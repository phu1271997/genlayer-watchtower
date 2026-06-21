import json


ADMIN = "0xadmin"
OWNER = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
REPORTER = "0xcccccccccccccccccccccccccccccccccccccccc"


def test_slash_math_pending_balances_and_claim_flow(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute treasury payments under signed budget approvals and "
        "must never move capital to speculative destinations or unknown recipients."
    )
    evidence_url = "https://example.com/rogue-log"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("rogue-agent", mandate, evidence_url, 1_000)

    env.rendered_pages[(evidence_url, "text")] = "Transferred 0xabc12345 to unknown wallet for $900."
    canary = contract._build_canary("rogue-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 88,
            "slash_ratio": 50,
            "reasoning": "The transfer 0xabc12345 moved $900 outside the approved treasury budget.",
            "canary": canary,
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.sender_address = module.Address(REPORTER)
    env.message.value = module.u256(0)

    updated = json.loads(contract.audit("rogue-agent", "watcher-bob"))
    assert updated["status"] == "FROZEN"
    assert updated["bond_remaining"] == 500
    assert contract.get_penalty_pool() == 450
    assert contract.get_pending_balance(REPORTER) == 50

    env.message.sender_address = module.Address(ADMIN)
    credited = contract.withdraw_penalty_pool(ADMIN, 450)
    assert credited == 450
    assert contract.get_penalty_pool() == 0
    assert contract.get_pending_balance(ADMIN) == 450

    claimed = contract.claim()
    assert claimed == 450
    assert env.transfers[-1] == {"to": ADMIN, "value": 450, "on": "finalized"}
    assert contract.get_pending_balance(ADMIN) == 0

    env.message.sender_address = module.Address(REPORTER)
    reporter_claim = contract.claim()
    assert reporter_claim == 50
    assert env.transfers[-1] == {"to": REPORTER, "value": 50, "on": "finalized"}

    env.message.sender_address = module.Address(OWNER)
    remaining = contract.withdraw_remaining_bond("rogue-agent")
    assert remaining == 500
    assert contract.get_pending_balance(OWNER) == 500

    owner_claim = contract.claim()
    assert owner_claim == 500
    assert env.transfers[-1] == {"to": OWNER, "value": 500, "on": "finalized"}
