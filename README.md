# Watchtower

![CI](https://github.com/phu1271997/genlayer-watchtower/actions/workflows/test.yml/badge.svg)

Watchtower is a GenLayer-native fiduciary watchdog for autonomous AI agents. Owners register an agent with a natural-language mandate and a bonded stake, then reporters can trigger on-chain audits that combine web evidence with consensus-backed language reasoning before any deterministic slash or freeze is applied.

## Why GenLayer

Watchtower needs two things that plain EVM contracts cannot do well on their own:

- read live, unstructured public evidence from the web
- reach a semantically meaningful judgment about whether an agent’s behavior still fits its mandate

GenLayer makes both possible inside the contract through `gl.nondet.web.render(...)`, `gl.nondet.exec_prompt(...)`, and semantic consensus controls.

## Current Release Line

- `v2.M1`: storage refactor, payable native bonds, pending-balance claims, prompt hardening
- `v2.M6`: architecture docs, ADRs, expanded tests, bilingual docs, CI, generated API reference
- `v2.M2`: multi-source evidence gathering, three-perspective reasoning, confidence/evidence-quality-aware outcomes
- `v2.M3`: owner appeals, probation recovery, and reporter reward economics
- planned next: categories, multi-token bonds, watchlists, and full frontend overhaul

See [CHANGELOG.md](./CHANGELOG.md) for release notes and `docs/evidence/` for milestone evidence bundles.

## Repository Map

```text
contracts/      GenLayer contracts
docs/           deployment notes, prompts, ADRs, evidence, API docs
examples/       sample audit material
scripts/        utility scripts such as API doc generation
src/            Vite + React operator console
tests/          direct-mode contract test harness
```

## Local Development

```bash
npm install
npm run dev
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3 -m pytest tests -q
npm run build
python3 scripts/generate_api_docs.py
```

## Deployment Notes

- Deploy `contracts/storage_test.py` first as a Studio sanity check.
- Deploy `contracts/watchtower.py` after a Studio storage reset and hard refresh.
- From `v2.M1` onward, `register_agent` and `top_up_bond` are payable and require `gl.message.value` to match the declared amount.

Detailed guidance lives in [docs/DEPLOY.md](./docs/DEPLOY.md) and the current architecture is documented in [ARCHITECTURE.md](./ARCHITECTURE.md).
