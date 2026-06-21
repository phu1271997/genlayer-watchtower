# Contributing

## Local Setup

1. Install frontend dependencies:
   - `npm install`
2. Run the operator console:
   - `npm run dev`
3. Run the direct contract tests:
   - `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python3 -m pytest tests -q`
4. Build the frontend:
   - `npm run build`

## Working With The Contract

- Keep the first three lines of `contracts/watchtower.py` exactly aligned with the current GenLayer deployment rules.
- Do not initialize `TreeMap()` or `DynArray()` inside `__init__`.
- Keep all persisted balances as `u256`.
- Keep nondeterministic logic inside `gl.eq_principle.prompt_comparative(...)` or `gl.vm.run_nondet_unsafe(...)`.

## Docs And Evidence

- Add a changelog entry for every milestone release.
- Save before/after screenshots and verification logs under `docs/evidence/m<N>/`.
- Update both `README.md` and `README.vi.md` when user-facing behavior changes.

## API Docs

- Regenerate the contract API reference with:
  - `python3 scripts/generate_api_docs.py`

## Testing Notes

- The direct-mode harness in `tests/conftest.py` stubs the minimal GenLayer surface needed for deterministic local tests.
- If you add new contract interfaces, extend the fake runtime instead of skipping coverage.
