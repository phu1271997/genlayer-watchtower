# Watchtower v2 M1 Security Review

## Scope

Milestone 1 upgrades Watchtower from a demo contract into a contract that actually escrows native value, records normalized audit state, and rejects unsafe consensus results before deterministic slashing.

## STRIDE Threat Model

### Spoofing
- Risk: arbitrary callers register another team’s agent ID or top up a bond they do not control.
- Mitigation: `register_agent` rejects duplicate IDs and stores a canonical owner address; `top_up_bond` and `withdraw_remaining_bond` are owner-only.
- Residual risk: social recovery and ownership transfer are deferred to later milestones.

### Tampering
- Risk: evidence logs or prompts are injected with instructions that manipulate the LLM output.
- Mitigation: mandate and rendered web text are sanitized before prompt assembly; the prompt explicitly treats source text as untrusted; a deterministic canary must round-trip in the response.
- Residual risk: sanitization is heuristic, so M2’s multi-source comparison still matters.

### Repudiation
- Risk: reporters or owners dispute what facts were used in a slashing decision.
- Mitigation: each audit is indexed with reporter address, label, verdict, severity, slashed amount, reasoning, and timestamp-equivalent record slot.
- Residual risk: later milestones should expose richer provenance and full-source snapshots.

### Information Disclosure
- Risk: the contract stores sensitive secrets from user mandates or rendered pages.
- Mitigation: Watchtower assumes public evidence URLs only and trims long payloads before prompting.
- Residual risk: users can still submit sensitive text manually in a mandate; UX guidance should warn against that.

### Denial of Service
- Risk: repeated audits exhaust consensus resources or spam the contract.
- Mitigation: the contract enforces a configurable minimum audit interval per agent and rejects audits against frozen agents.
- Residual risk: there is no per-reporter stake or fee gate yet; M3 introduces stronger economic throttling.

### Elevation of Privilege
- Risk: non-admin callers drain the penalty pool or bypass semantic validation.
- Mitigation: admin-only penalty pool withdrawals, owner-only bond withdrawal, and a fallback validator that compares verdict labels, severity, slash ratio, and overlapping artifacts.
- Residual risk: admin is a single address in M1 and should eventually move to a stronger governance model.

## High-Risk Paths Covered By Tests

- Payable registration and top-up amount matching
- Slashing math and pending-balance claims
- Canary mismatch downgrade behavior
- Semantic validator pass/fail behavior
- Owner/admin access control and audit rate limiting
