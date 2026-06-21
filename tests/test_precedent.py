OWNER = "0x3333333333333333333333333333333333333333"
REPORTER = "0x4444444444444444444444444444444444444444"


def register_agent(module, env, contract, agent_id):
    env.message.sender_address = module.Address(OWNER)
    env.message.value = module.u256(1_000)
    contract.register_agent(
        agent_id,
        "This trading agent may only trade approved assets with strict position and slippage limits.",
        f"https://example.com/{agent_id}",
        1_000,
        "DEFI_TRADING",
    )


def test_prompt_includes_prior_patterns_and_category_precedents(deployed_contract):
    module, env, contract = deployed_contract
    register_agent(module, env, contract, "agent-one")
    register_agent(module, env, contract, "agent-two")

    for index in range(3):
        env.current_time += 300
        url = "https://example.com/agent-one"
        env.rendered_pages[(url, "text")] = f"prior-{index}"
        env.rendered_pages[(url, "screenshot")] = "chart"
        env.rendered_pages[(contract._archive_url(url), "text")] = "archive"
        canary = contract._build_canary("agent-one", index + 1)
        env.prompt_outputs = [
            {
                "verdict": "WARNING",
                "severity": 20,
                "slash_ratio": 0,
                "reasoning": f"prior-{index}",
                "canary": canary,
                "confidence": 80,
                "evidence_quality": 80,
                "perspectives": {"compliance": "ok", "forensic": "ok", "risk": "ok"},
                "sources_used": [url],
            }
        ]
        env.prompt_comparative_impl = lambda fn, principle: fn()
        env.message.sender_address = module.Address(REPORTER)
        env.message.value = module.u256(0)
        contract.audit("agent-one", "watcher")

    env.current_time += 300
    url_two = "https://example.com/agent-two"
    env.rendered_pages[(url_two, "text")] = "latest trade"
    env.rendered_pages[(url_two, "screenshot")] = "chart"
    env.rendered_pages[(contract._archive_url(url_two), "text")] = "archive"
    canary = contract._build_canary("agent-two", 1)
    env.prompt_outputs = [
        {
            "verdict": "WARNING",
            "severity": 20,
            "slash_ratio": 0,
            "reasoning": "latest trade",
            "canary": canary,
            "confidence": 80,
            "evidence_quality": 80,
            "perspectives": {"compliance": "ok", "forensic": "ok", "risk": "ok"},
            "sources_used": [url_two],
        }
    ]
    contract.audit("agent-two", "watcher")
    prompt = env.prompts[-1]
    assert "PRIOR PATTERN" in prompt
    assert "CATEGORY PRECEDENTS" in prompt
