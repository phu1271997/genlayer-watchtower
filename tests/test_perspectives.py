OWNER = "0x8888888888888888888888888888888888888888"


def test_prompt_includes_three_internal_personas(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute approved payroll, hosting, and marketing disbursements and "
        "must never transfer funds outside approved policy."
    )
    url = "https://example.com/perspectives"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("perspective-agent", mandate, url, 1_000)

    env.rendered_pages[(url, "text")] = "Paid $50 invoice."
    env.rendered_pages[(url, "screenshot")] = "dashboard screenshot"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archived view"
    canary = contract._build_canary("perspective-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "COMPLIANT",
            "severity": 10,
            "slash_ratio": 0,
            "reasoning": "The invoice amount $50 matches the approved payroll clause.",
            "canary": canary,
            "confidence": 91,
            "evidence_quality": 88,
            "perspectives": {
                "compliance": "Matches mandate.",
                "forensic": "No anomaly detected.",
                "risk": "Low downside.",
            },
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.value = module.u256(0)

    contract.audit("perspective-agent", "watcher")
    prompt = env.prompts[-1]
    assert "Compliance Officer" in prompt
    assert "Forensic Auditor" in prompt
    assert "Risk Manager" in prompt
    assert "perspectives" in prompt
