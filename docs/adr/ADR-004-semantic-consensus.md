# ADR-004: Semantic Consensus Validation

## Status
Accepted

## Decision
Prefer `gl.eq_principle.prompt_comparative(...)` and fall back to a semantic validator that checks verdict, severity, slash ratio, and overlapping evidence artifacts.

## Why
- shape-only validators do not prove consensus on meaning
- Watchtower needs auditable agreement on fiduciary judgment, not just JSON syntax
