import json


OWNER = "0x1111222233334444555566667777888899990000"
REPORTER = "0x0000999988887777666655554444333322221111"


def test_reporter_reward_and_leaderboard(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute approved treasury payments and must never move funds "
        "to unknown recipients or speculative venues."
    )
    url = "https://example.com/rewards"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("reward-agent", mandate, url, 1_000)

    env.rendered_pages[(url, "text")] = "Transaction 0xfeed123 moved $500 outside the approved budget."
    env.rendered_pages[(url, "screenshot")] = "screenshot"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archive"
    canary = contract._build_canary("reward-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 90,
            "slash_ratio": 40,
            "reasoning": "Transaction 0xfeed123 moved $500 outside the approved budget.",
            "canary": canary,
            "confidence": 85,
            "evidence_quality": 80,
            "perspectives": {"compliance": "Breach.", "forensic": "Confirmed.", "risk": "High."},
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.sender_address = module.Address(REPORTER)
    env.message.value = module.u256(0)

    contract.audit("reward-agent", "watcher")
    assert contract.get_pending_balance(REPORTER) == 40

    leaderboard = json.loads(contract.get_top_reporters(10))
    assert leaderboard[0]["address"] == REPORTER
    assert leaderboard[0]["total_rewarded"] == 40
