# AI Consensus Flow

Milestone 2 upgrades Watchtower from a single-source prompt into a richer evidence pack with multiple personas and richer audit metadata.

```mermaid
sequenceDiagram
    actor Reporter
    participant Contract as Watchtower
    participant Primary as Evidence URL
    participant Archive as Web Archive
    participant Wallet as Explorer
    participant GitHub as Commits API
    participant Social as Social Page
    participant Model as Consensus Model

    Reporter->>Contract: audit(agent_id, reporter)
    Contract->>Primary: render(text)
    Contract->>Primary: render(screenshot)
    Contract->>Archive: render(text)
    opt wallet address supplied
        Contract->>Wallet: render(text)
    end
    opt github repo supplied
        Contract->>GitHub: render(text)
    end
    opt social URL supplied
        Contract->>Social: render(text)
    end
    Contract->>Model: prompt with Compliance, Forensic, Risk personas
    Contract->>Model: comparative principle / semantic fallback
    Model-->>Contract: verdict + severity + slash_ratio + confidence + evidence_quality + perspectives + sources_used
    Contract-->>Reporter: deterministic status / slash outcome + indexed audit record
```

## Stored Audit Metadata

- verdict
- severity
- slash ratio result
- confidence
- evidence quality
- three perspective summaries
- source URLs used
- deterministic canary
