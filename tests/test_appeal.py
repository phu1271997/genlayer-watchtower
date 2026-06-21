import json


OWNER = "0x5656565656565656565656565656565656565656"
REPORTER = "0x7878787878787878787878787878787878787878"


def test_appeal_overturns_and_restores_owner_balance(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute approved treasury payments and must never move funds "
        "outside board-approved recipients."
    )
    url = "https://example.com/appeal"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("appeal-agent", mandate, url, 1_000)

    env.rendered_pages[(url, "text")] = "Transaction 0xappeal1 moved $400 outside policy."
    env.rendered_pages[(url, "screenshot")] = "screen"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archive"
    canary = contract._build_canary("appeal-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 80,
            "slash_ratio": 50,
            "reasoning": "Transaction 0xappeal1 moved $400 outside policy.",
            "canary": canary,
            "confidence": 90,
            "evidence_quality": 90,
            "perspectives": {"compliance": "Breach.", "forensic": "Confirmed.", "risk": "High."},
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.sender_address = module.Address(REPORTER)
    env.message.value = module.u256(0)
    contract.audit("appeal-agent", "watcher")

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    appeal = json.loads(contract.file_appeal("appeal-agent", "The transfer was pre-approved."))
    assert appeal["status"] == "PENDING"

    env.rendered_pages[(url, "text")] = "Same transaction was pre-approved."
    result = json.dumps(
        {
            "verdict": "WARNING",
            "severity": 20,
            "slash_ratio": 0,
            "reasoning": "The appellant argument is supported by the refreshed evidence.",
            "canary": contract._build_canary("appeal-appeal-agent", 1),
            "confidence": 88,
            "evidence_quality": 90,
            "perspectives": {"compliance": "Approved.", "forensic": "Explained.", "risk": "Contained."},
            "sources_used": [url],
            "addresses_appeal": True,
            "overturned": True,
        }
    )
    env.prompt_outputs = [result]
    evaluated = json.loads(contract.evaluate_appeal(1))
    assert evaluated["status"] == "OVERTURNED"
    assert contract.agent_status_of["appeal-agent"] == "PROBATION"
    assert contract.get_pending_balance(OWNER) == 1_500
