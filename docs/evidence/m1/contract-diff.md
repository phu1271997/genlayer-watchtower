# Milestone 1 Contract Delta

## Before

- Agent state lived inside one JSON blob under `agents: TreeMap[str, str]`
- Bond amounts were plain integers, not real native value held by the contract
- Audit validation accepted any `gl.vm.Return` shape without semantic agreement
- There was no pending-balance ledger or `claim()` payout path

## After

- Agent storage is split across indexed `TreeMap` fields for owner, mandate, evidence URL, bond, status, timestamps, and audit counts
- Audit history is normalized into a dedicated audit table plus per-agent audit index pagination
- `register_agent` and `top_up_bond` are payable and enforce `gl.message.value == declared amount`
- Slashing updates native custody balances, penalty pool accounting, and claimable pending balances
- The audit path now sanitizes inputs, requires a deterministic canary, and falls back to a semantic validator when comparative consensus is unavailable
