# Changelog

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
