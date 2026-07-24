# ADR-003: Pull Withdrawal Pattern

## Status
Accepted

## Decision
Value exits the contract through a pending-balance ledger plus `claim()`, not direct push payments during slashing logic.

## Why
- reduces reentrancy-style payout risk
- separates deterministic accounting from external transfer side effects
