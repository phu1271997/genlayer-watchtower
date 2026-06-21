# Milestone 1 Evidence

## Expected Artifacts

- `before.png`: Watchtower v1 UI and contract behavior before the M1 refactor
- `after.png`: Watchtower v2 M1 UI and contract behavior after the storage, value, and security upgrade
- `contract-diff.md`: summary of storage/value-transfer/security changes
- `test-output.txt`: local pytest output for the M1 suite

## Current Local Evidence

- Contract foundation commit: `feat(contract): rebuild storage and bond custody flow`
- Direct tests: `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3 -m pytest tests -q`
- M1 docs: `CHANGELOG.md`, `SECURITY.md`, `docs/PROMPT_EN.md`, `docs/PROMPT_VI.md`

Screenshots still need to be captured from the refreshed UI and the Studio deployment flow before opening the final PR.
