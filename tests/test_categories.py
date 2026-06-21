import json


OWNER = "0xabcabcabcabcabcabcabcabcabcabcabcabcabca"
REPORTER = "0xbcabcabcabcabcabcabcabcabcabcabcabcabcab"


def test_defi_trading_threshold_is_stricter_than_other(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only trade approved assets with documented position limits and must "
        "never exceed slippage or leverage controls."
    )
    url = "https://example.com/category"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("trader", mandate, url, 1_000, "DEFI_TRADING")

    env.rendered_pages[(url, "text")] = "Trade exceeded policy."
    env.rendered_pages[(url, "screenshot")] = "chart"
    env.rendered_pages[(contract._archive_url(url), "text")] = "archive"
    canary = contract._build_canary("trader", 1)
    env.prompt_outputs = [
        {
            "verdict": "WARNING",
            "severity": 45,
            "slash_ratio": 0,
            "reasoning": "Trade breached slippage tolerance.",
            "canary": canary,
            "confidence": 85,
            "evidence_quality": 90,
            "perspectives": {"compliance": "Breach.", "forensic": "Seen.", "risk": "Moderate."},
            "sources_used": [url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.sender_address = module.Address(REPORTER)
    env.message.value = module.u256(0)

    trader = json.loads(contract.audit("trader", "watcher"))
    assert trader["status"] == "FROZEN"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent("generic", mandate, url, 1_000, "OTHER")
    canary_other = contract._build_canary("generic", 1)
    env.prompt_outputs = [
        {
            "verdict": "WARNING",
            "severity": 45,
            "slash_ratio": 0,
            "reasoning": "Trade breached slippage tolerance.",
            "canary": canary_other,
            "confidence": 85,
            "evidence_quality": 90,
            "perspectives": {"compliance": "Breach.", "forensic": "Seen.", "risk": "Moderate."},
            "sources_used": [url],
        }
    ]
    env.message.sender_address = module.Address(REPORTER)
    generic = json.loads(contract.audit("generic", "watcher"))
    assert generic["status"] != "FROZEN"
