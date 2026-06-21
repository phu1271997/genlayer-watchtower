# Watchtower Economics

## Bond Model

Watchtower holds a native-value bond inside the contract when an agent is registered. The owner declares the bond amount as a parameter and must send the same amount as `gl.message.value`.

## Slashing Formula

When an audit severity meets or exceeds the active threshold:

```text
slashed = remaining_bond * slash_ratio // 100
remaining_bond = remaining_bond - slashed
penalty_pool = penalty_pool + slashed
```

All math is integer-only. No floating point values exist in public interfaces or persisted storage.

## Withdrawal Flows

- `withdraw_penalty_pool(to, amount)` is admin-only and moves value from `penalty_pool` into `pending_balance_of[to]`.
- `withdraw_remaining_bond(agent_id)` is owner-only and only works after the agent is frozen.
- `claim()` zeros the caller’s pending balance before `emit_transfer`, following the pull-payment pattern.

## Attack Cost Notes

- Spam audit griefing is throttled by `min_audit_interval_seconds`.
- Prompt injection attacks must bypass both the sanitizer and the canary echo check.
- Penalty pool draining requires admin privileges plus a nonzero pool balance.
- False-positive slash events are bounded by semantic validation and are traceable through indexed audit records.

## Later-Milestone Extensions

- M3 will introduce reporter rewards and appeal stakes.
- M5 will add ERC20-denominated bond accounting alongside native GEN custody.
