import json


OWNER = "0x1212121212121212121212121212121212121212"
REPORTER = "0x3434343434343434343434343434343434343434"


def test_probation_reoffense_and_auto_promotion(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute approved operating payments and must never transfer "
        "funds beyond documented policy constraints."
    )
    url = "https://example.com/probation"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(2_000)
    contract.register_agent("probation-agent", mandate, url, 2_000)
    contract.agent_status_of["probation-agent"] = "PROBATION"
    contract.agent_probation_until_of["probation-agent"] = module.u256(env.current_time + 500)

    env.rendered_pages[(url, "text")] = "Transaction 0xprob123 moved $700 outside policy."
    env.rendered_pages[(url, "screenshot")] = "chart"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archive"
    canary = contract._build_canary("probation-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 65,
            "slash_ratio": 20,
            "reasoning": "Transaction 0xprob123 moved $700 outside policy.",
            "canary": canary,
            "confidence": 90,
            "evidence_quality": 90,
            "perspectives": {"compliance": "Breach.", "forensic": "Pattern.", "risk": "High."},
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.sender_address = module.Address(REPORTER)
    env.message.value = module.u256(0)
    result = json.loads(contract.audit("probation-agent", "watcher"))
    assert result["status"] == "FROZEN"
    assert result["appeal_locked"] is True

    contract.agent_status_of["probation-agent"] = "PROBATION"
    contract.agent_probation_until_of["probation-agent"] = module.u256(env.current_time - 1)
    promoted = contract.try_promote_from_probation("probation-agent")
    assert promoted == "ACTIVE"
