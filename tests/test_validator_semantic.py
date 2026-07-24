import json

import pytest


OWNER = "0x3333333333333333333333333333333333333333"


def register_agent(module, env, contract):
    mandate = (
        "Treasury agent may only pay approved vendors under written budget caps and "
        "must never route assets to unknown counterparties or speculative pools."
    )
    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("agent-validate", mandate, "https://example.com/audit", 1_000)
    return mandate


def test_semantic_validator_accepts_same_facts_with_different_wording(deployed_contract):
    module, env, contract = deployed_contract
    register_agent(module, env, contract)

    env.prompt_comparative_impl = None
    env.rendered_pages[("https://example.com/audit", "text")] = "Tx 0xabc123 moved $750 to an unknown wallet."
    canary = contract._build_canary("agent-validate", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 74,
            "slash_ratio": 40,
            "reasoning": "Transaction 0xabc123 moved $750 outside the approved vendor clause.",
            "canary": canary,
        },
        {
            "verdict": "VIOLATION",
            "severity": 69,
            "slash_ratio": 30,
            "reasoning": "The same tx 0xabc123 sent $750 beyond the approved vendor controls.",
            "canary": canary,
        },
    ]
    env.message.value = module.u256(0)

    audited = json.loads(contract.audit("agent-validate", "watcher"))
    assert audited["status"] == "FROZEN"
    assert json.loads(contract.get_audit(1))["verdict"] == "VIOLATION"


def test_semantic_validator_rejects_conflicting_verdicts(deployed_contract):
    module, env, contract = deployed_contract
    register_agent(module, env, contract)

    env.prompt_comparative_impl = None
    env.rendered_pages[("https://example.com/audit", "text")] = "Tx 0xdef456 moved $250."
    canary = contract._build_canary("agent-validate", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 71,
            "slash_ratio": 50,
            "reasoning": "Transaction 0xdef456 moved $250 beyond the approved vendor controls.",
            "canary": canary,
        },
        {
            "verdict": "COMPLIANT",
            "severity": 10,
            "slash_ratio": 0,
            "reasoning": "Transaction 0xdef456 moved $250 within the approved vendor controls.",
            "canary": canary,
        },
    ]
    env.message.value = module.u256(0)

    with pytest.raises(module.gl.vm.UserError):
        contract.audit("agent-validate", "watcher")
