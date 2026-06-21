# Changelog

## [v2.M5] - Multi-Token Bonds + Network Effects - 2026-06-21
### Added
- ERC20-style bond registration, top-up, and token claim flows.
- Watchlist creation, membership management, and subscriber counts.
- Prior-pattern and category-precedent prompt injection for case-law-style consistency.
- Mock ERC20 contract and supporting docs.

### Changed
- Agent records now track a `bond_token` field alongside native or token-denominated bond balances.

### Fixed
- Watchtower can now model higher-value bonds without forcing every agent into native GEN only.

### Security
- Token bonds are gated behind an admin allowlist before registration is allowed.

### Evidence
- before/after screenshots: `docs/evidence/m5/`
- tests added: `tests/test_multi_token.py`, `tests/test_watchlist.py`, `tests/test_precedent.py`
- quantifiable metric: audit prompts now reference up to 3 same-agent precedents plus same-category peer precedents

## [v2.M4] - Agent Categories + Category-Specific Rubrics - 2026-06-21
### Added
- Agent categories, category rubrics, category thresholds, and mandate templates.
- `get_categories` plus admin setters for rubric, threshold, and template overrides.
- Category-aware registration UI, rubric panel, and mandate autofill.
- Seed scaffold at `scripts/seed_categories.ts`.

### Changed
- Audit prompts now include agent category and category-specific rubric text.
- Severity thresholds are category-aware, with `DEFI_TRADING` stricter than generic agents by default.

### Fixed
- Watchtower no longer evaluates all agents through one generic fiduciary rubric.

### Security
- High-risk categories can now adopt lower default thresholds without changing the global contract threshold.

### Evidence
- before/after screenshots: `docs/evidence/m4/`
- tests added: `tests/test_categories.py`, `tests/test_mandate_template.py`
- quantifiable metric: 7 curated categories now drive tailored rubric text and thresholds

## [v2.M3] - Appeal Flow + Probation + Reporter Rewards - 2026-06-21
### Added
- Appeal storage and flows with `file_appeal`, `evaluate_appeal`, and `get_appeal`.
- Probation tracking with timed promotion and harsher handling for probation reoffenders.
- Reporter rewards, accounting, and leaderboard views.
- UI support for filing appeals, showing probation, and viewing top reporters.

### Changed
- Slashes now split between the reporter reward and the penalty pool.
- Overturned appeals restore owner balances and reconcile reporter accounting.

### Fixed
- Frozen states are no longer terminal when a valid appeal overturns the prior ruling.

### Security
- Appeals require owner authorization and a stake of at least 2x the most recent slash.

### Evidence
- before/after screenshots: `docs/evidence/m3/`
- tests added: `tests/test_appeal.py`, `tests/test_probation.py`, `tests/test_rewards.py`
- quantifiable metric: Watchtower now supports a complete report -> slash -> appeal -> probation -> reward lifecycle

## [v2.M2] - AI Consensus Upgrade: Multi-Source Behavior Aggregation - 2026-06-21
### Added
- Multi-source audit collection across primary text, primary screenshot, web archive, wallet explorer, GitHub commits, and optional social signals.
- Richer verdict metadata: `confidence`, `evidence_quality`, `perspectives`, and `sources_used`.
- `get_full_audit` view and `docs/AI_CONSENSUS.md`.
- Optional agent metadata fields for wallet, GitHub repo, and social URL.

### Changed
- The audit prompt now reasons from Compliance Officer, Forensic Auditor, and Risk Manager perspectives before concluding.
- High-severity low-confidence verdicts now land in `NEEDS_REVIEW` instead of freezing immediately.
- Low-evidence-quality verdicts cap slash severity to reduce overreaction to weak signals.

### Fixed
- Single-source evidence dependence is replaced by a broader evidence pack that is harder to game.

### Security
- Comparative consensus is now applied to a richer verdict shape while still preserving semantic fallback behavior.

### Evidence
- before/after screenshots: `docs/evidence/m2/`
- tests added: `tests/test_multisource.py`, `tests/test_perspectives.py`, `tests/test_eq_principle.py`
- quantifiable metric: audit input surface expanded from 1 rendered source to up to 6 labeled sources plus three perspective summaries

## [v2.M6] - Documentation, Architecture, Tests, and CI - 2026-06-21
### Added
- `ARCHITECTURE.md`, `ECONOMICS.md`, `CONTRIBUTING.md`, `README.vi.md`, and `docs/VIDEO_SCRIPT.md`.
- ADR set under `docs/adr/` covering storage, payable custody, pull withdrawals, semantic consensus, category planning, and English prompting.
- Generated API docs under `docs/api/watchtower.md` plus `scripts/generate_api_docs.py`.
- GitHub Actions workflow at `.github/workflows/test.yml`.
- End-to-end lifecycle coverage in `tests/test_e2e_lifecycle.py`.

### Changed
- `README.md` is now the English primary README with CI badge and streamlined setup guidance.
- Evidence scaffolding now includes a dedicated `docs/evidence/m6/` bundle.

### Fixed
- Removed the “no onboarding path” gap by documenting architecture, economics, deployment, contribution, and demo flow in one place.

### Security
- Reinforced the documented threat model and made the CI path validate tests before frontend build.

### Evidence
- before/after screenshots: `docs/evidence/m6/`
- tests added: `tests/test_e2e_lifecycle.py`
- quantifiable metric: documentation surface expanded from 4 docs to architecture, economics, contributing, bilingual readmes, ADRs, generated API docs, and CI workflow

## [v2.M1] - Storage Refactor + Real Value Transfer + Security Hardening - 2026-06-21
### Added
- Indexed audit storage via parallel `TreeMap` fields and per-agent audit pagination.
- Native-value bond custody with pull-based claims for owners and admin withdrawals.
- Prompt documentation in English and Vietnamese plus an M1 evidence scaffold under `docs/evidence/m1/`.

### Changed
- `register_agent` and `top_up_bond` now require payable value that matches the declared bond amount.
- `get_agent` now assembles structured JSON from normalized storage instead of returning a serialized blob.
- `audit` now applies English prompting, canary verification, rate limiting, and semantic consensus checks.

### Fixed
- Eliminated the JSON blob anti-pattern that previously mixed mutable agent state and growing audit history.
- Replaced synthetic integer bond math with actual contract-held value accounting and claimable balances.
- Added admin and owner authorization checks around sensitive bond and pool operations.

### Security
- Added prompt sanitization for mandate and rendered behavior text.
- Added semantic validator fallback checks for verdict label, severity, slash ratio, and overlapping evidence artifacts.
- Added STRIDE threat modeling in `SECURITY.md`.

### Evidence
- before/after screenshots: `docs/evidence/m1/`
- tests added: `tests/conftest.py`, `tests/test_storage_refactor.py`, `tests/test_value_transfer.py`, `tests/test_validator_semantic.py`, `tests/test_security.py`
- quantifiable metric: agent state moved from one JSON blob to 17 indexed storage fields plus paginated audit lookups
