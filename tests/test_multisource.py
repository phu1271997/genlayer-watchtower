import json


OWNER = "0x6666666666666666666666666666666666666666"


def test_audit_fetches_all_available_sources(deployed_contract):
    module, env, contract = deployed_contract
    mandate = (
        "Agent may only execute approved vendor payments and must never move funds to "
        "unknown wallets, speculative pools, or unapproved counterparties."
    )
    evidence_url = "https://example.com/feed"
    wallet_address = "0x7777777777777777777777777777777777777777"
    github_repo = "openai/watchtower"
    social_url = "https://x.com/watchtower_agent"

    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent(
        "multisource-agent",
        mandate,
        evidence_url,
        1_000,
        wallet_address,
        github_repo,
        social_url,
    )

    archive_url = contract._archive_url(evidence_url)
    wallet_url = contract._wallet_source_url(wallet_address)
    github_url = contract._github_source_url(github_repo)
    for url, mode in [
        (evidence_url, "text"),
        (evidence_url, "screenshot"),
        (archive_url, "text"),
        (wallet_url, "text"),
        (github_url, "text"),
        (social_url, "text"),
    ]:
        env.rendered_pages[(url, mode)] = f"Rendered {url} [{mode}]"

    canary = contract._build_canary("multisource-agent", 1)
    env.prompt_outputs = [
        {
            "verdict": "WARNING",
            "severity": 35,
            "slash_ratio": 0,
            "reasoning": "Observed $100 vendor payment in the primary feed and commit log.",
            "canary": canary,
            "confidence": 75,
            "evidence_quality": 82,
            "perspectives": {
                "compliance": "Mandate mostly respected.",
                "forensic": "No suspicious spikes yet.",
                "risk": "Some caution due to rapid activity.",
            },
            "sources_used": [evidence_url, github_url],
        }
    ]
    env.prompt_comparative_impl = lambda fn, principle: fn()
    env.message.value = module.u256(0)

    contract.audit("multisource-agent", "watcher")
    observed_calls = set(env.render_calls)
    expected_calls = {
        (evidence_url, "text"),
        (evidence_url, "screenshot"),
        (archive_url, "text"),
        (wallet_url, "text"),
        (github_url, "text"),
        (social_url, "text"),
    }
    assert expected_calls.issubset(observed_calls)

    audit = json.loads(contract.get_full_audit(1))
    assert audit["sources_used"] == [evidence_url, github_url]
    assert audit["confidence"] == 75
    assert audit["evidence_quality"] == 82
