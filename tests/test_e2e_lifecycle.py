import json


ADMIN = "0xadmin"


def _register(module, env, contract, agent_id, owner, amount, url, mandate):
    env.message.sender_address = module.Address(owner)
    env.message.value = module.u256(amount)
    contract.register_agent(agent_id, mandate, url, amount)


def test_multi_agent_lifecycle_balances_stay_consistent(deployed_contract):
    module, env, contract = deployed_contract
    env.prompt_comparative_impl = lambda fn, principle: fn()

    owners = [
        "0x1000000000000000000000000000000000000001",
        "0x1000000000000000000000000000000000000002",
        "0x1000000000000000000000000000000000000003",
        "0x1000000000000000000000000000000000000004",
        "0x1000000000000000000000000000000000000005",
    ]

    total_deposited = 0
    total_slashed = 0

    for index, owner in enumerate(owners, start=1):
        amount = index * 1_000
        total_deposited += amount
        agent_id = f"agent-{index}"
        url = f"https://example.com/{agent_id}"
        mandate = (
            f"Agent {index} may only pay approved operating expenses under signed budget controls "
            "and must never transfer funds to unknown wallets or speculative destinations."
        )
        _register(module, env, contract, agent_id, owner, amount, url, mandate)

        for audit_round in range(2):
            env.current_time += 300
            canary = contract._build_canary(agent_id, audit_round + 1)
            if audit_round == 1 and index % 2 == 0:
                verdict = "VIOLATION"
                severity = 80
                slash_ratio = 25
                total_slashed += amount * slash_ratio // 100
                reasoning = f"Transaction 0xabc{index}{audit_round} moved ${200 * index} outside the approved budget."
            else:
                verdict = "WARNING"
                severity = 20
                slash_ratio = 0
                reasoning = f"Invoice ${100 * index} stayed within the approved vendor budget."

            env.rendered_pages[(url, "text")] = reasoning
            env.prompt_outputs = [
                {
                    "verdict": verdict,
                    "severity": severity,
                    "slash_ratio": slash_ratio,
                    "reasoning": reasoning,
                    "canary": canary,
                }
            ]
            env.message.sender_address = module.Address(owner)
            env.message.value = module.u256(0)
            contract.audit(agent_id, f"watcher-{index}")

    assert contract.get_penalty_pool() == total_slashed

    remaining_bonds = 0
    total_audits = 0
    for index in range(1, 6):
        agent = json.loads(contract.get_agent(f"agent-{index}"))
        remaining_bonds += agent["bond_remaining"]
        total_audits += agent["audit_count"]

    assert total_audits == 10
    assert remaining_bonds + contract.get_penalty_pool() == total_deposited

    env.message.sender_address = module.Address(ADMIN)
    credited = contract.withdraw_penalty_pool(ADMIN, total_slashed)
    assert credited == total_slashed
    assert contract.get_penalty_pool() == 0

    claimed = contract.claim()
    assert claimed == total_slashed
