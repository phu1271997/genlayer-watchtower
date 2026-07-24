# Watchtower Architecture

Watchtower is a GenLayer intelligent contract plus a Vite/React operator console. Milestone 1 established the contract safety baseline, and Milestone 6 documents the current shape so the later AI, appeals, categories, and multi-token releases have a stable reference.

## End-to-End Sequence

```mermaid
sequenceDiagram
    actor Owner
    actor Reporter
    participant UI as React Console
    participant Contract as Watchtower Contract
    participant Web as Public Web Source
    participant LLM as GenLayer Consensus
    participant Vault as Pending Balance Ledger

    Owner->>UI: Enter mandate + evidence URL + bond
    UI->>Contract: register_agent(...), value=bond
    Contract-->>UI: Agent ACTIVE with indexed storage

    Reporter->>UI: Trigger audit(agent_id, reporter)
    UI->>Contract: audit(...)
    Contract->>Web: gl.nondet.web.render(evidence_url, mode="text")
    Contract->>LLM: exec_prompt(English watchdog prompt + canary)
    alt comparative consensus available
        Contract->>LLM: gl.eq_principle.prompt_comparative(...)
    else fallback validator
        Contract->>LLM: run_nondet_unsafe(leader, semantic validator)
    end
    Contract-->>Contract: deterministic slash / freeze / audit indexing
    Contract-->>UI: Updated agent JSON + audit IDs

    alt admin withdraws penalty pool
        UI->>Contract: withdraw_penalty_pool(to, amount)
        Contract->>Vault: credit pending balance
    end

    alt owner or admin claims
        UI->>Contract: claim()
        Contract->>Vault: zero balance first
        Contract->>Owner: emit_transfer(value=amount)
    end
```

## Component Map

```mermaid
flowchart TD
    A["contracts/watchtower.py"] --> B["Agent storage maps"]
    A --> C["Audit storage maps"]
    A --> D["Pending balance ledger"]
    A --> E["Prompt / sanitizer / semantic validator helpers"]
    F["tests/"] --> A
    G["src/App.tsx"] --> H["genlayerClient.ts"]
    H --> A
    I["docs/"] --> A
    I --> G
```

## Storage Groups

- Agents: owner, mandate, evidence URL, native bond, status, registration time, last audit time, audit count, audit index slots.
- Audits: global audit counter plus agent, reporter address, reporter label, verdict, severity, slashed amount, reasoning, canary, recorded time.
- Balances: contract-held penalty pool and per-address pending claim balances.
- Config: admin address, violation threshold, minimum audit interval.

## Current State Machine

```mermaid
stateDiagram-v2
    [*] --> ACTIVE
    ACTIVE --> ACTIVE: audit severity < threshold
    ACTIVE --> FROZEN: audit severity >= threshold
    FROZEN --> CLAIMED: owner withdraws remaining bond
    CLAIMED --> [*]
```

Future milestones extend this machine with `NEEDS_REVIEW`, `PROBATION`, and appeal transitions.
