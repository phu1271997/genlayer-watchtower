# ADR-002: Payable Registration

## Status
Accepted

## Decision
`register_agent` and `top_up_bond` require matching `gl.message.value` so Watchtower holds real bonded value.

## Why
- synthetic integers do not create enforceable economic security
- custody inside the contract enables deterministic slash and claim flows
