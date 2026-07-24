import json


OWNER = "0x1111111111111111111111111111111111111111"


def test_register_fetch_and_list_audits(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Treasury agent may only pay audited vendors under the treasury budget and "
        "must never transfer funds to unapproved wallets or speculative tokens."
    )
    evidence_url = "https://example.com/logs"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    registered = json.loads(contract.register_agent("agent-1", mandate, evidence_url, 1_000))

    assert registered["owner"] == OWNER
    assert registered["bond_remaining"] == 1_000
    assert registered["audit_ids"] == []

    env.rendered_pages[(evidence_url, "text")] = "Paid vendor invoice #100 for $250."
    canary = contract._build_canary("agent-1", 1)
    env.prompt_outputs = [
        {
            "verdict": "WARNING",
            "severity": 25,
            "slash_ratio": 0,
            "reasoning": "Matched the vendor invoice amount $250 under the approved vendor clause.",
            "canary": canary,
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.value = module.u256(0)

    updated_agent = json.loads(contract.audit("agent-1", "watcher-alice"))
    assert updated_agent["audit_count"] == 1
    assert updated_agent["audit_ids"] == [1]

    audit = json.loads(contract.get_audit(1))
    assert audit["agent_id"] == "agent-1"
    assert audit["reporter"] == OWNER
    assert audit["reporter_label"] == "watcher-alice"
    assert audit["verdict"] == "WARNING"

    audit_ids = json.loads(contract.list_audits_of_agent("agent-1", 0, 10))
    assert audit_ids == [1]
