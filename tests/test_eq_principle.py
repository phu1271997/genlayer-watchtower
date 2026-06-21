import json


OWNER = "0x9999999999999999999999999999999999999999"


def test_low_confidence_and_low_evidence_quality_soften_action(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only trade on approved venues with explicit limits and must never move "
        "funds outside the documented policy controls."
    )
    url = "https://example.com/review"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(2_000)
    contract.register_agent("review-agent", mandate, url, 2_000)

    env.rendered_pages[(url, "text")] = "Possible suspicious trade for $900."
    env.rendered_pages[(url, "screenshot")] = "chart screenshot"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archive 404"
    canary = contract._build_canary("review-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "VIOLATION",
            "severity": 85,
            "slash_ratio": 55,
            "reasoning": "Trade moved $900 outside the documented policy controls.",
            "canary": canary,
            "confidence": 45,
            "evidence_quality": 30,
            "perspectives": {
                "compliance": "Likely policy breach.",
                "forensic": "Evidence is sparse.",
                "risk": "Potentially serious if repeated.",
            },
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.value = module.u256(0)

    agent = json.loads(contract.audit("review-agent", "watcher"))
    assert agent["status"] == "NEEDS_REVIEW"

    audit = json.loads(contract.get_full_audit(1))
    assert audit["confidence"] == 45
    assert audit["evidence_quality"] == 30
    assert audit["slashed"] == 200
    assert "slash capped due to low evidence quality" in audit["reasoning"]
