interface AuditReport {
  id: number;
  reporter: string;
  reporter_label: string;
  verdict: string;
  severity: number;
  slashed: number;
  reasoning: string;
  confidence: number;
  evidence_quality: number;
  perspectives: {
    compliance?: string;
    forensic?: string;
    risk?: string;
  };
  sources_used: string[];
  recorded_at: number;
}

interface AuditCardProps {
  audit: AuditReport;
}

export function AuditCard({ audit }: AuditCardProps) {
  return (
    <div className={`audit-node node-${audit.verdict.toLowerCase()}`}>
      <div className="audit-meta">
        <span className={`audit-verdict ${audit.verdict.toLowerCase()}`}>{audit.verdict}</span>
        <span className="audit-reporter">
          Audit #{audit.id} by <strong>{audit.reporter_label || audit.reporter}</strong>
        </span>
        {audit.slashed > 0 && <span className="audit-slashed">-{audit.slashed} units slashed</span>}
      </div>

      <div className="audit-reasoning">{audit.reasoning}</div>

      <div className="audit-details-row">
        <div className="audit-detail-item">
          Severity: <span>{audit.severity}/100</span>
        </div>
        <div className="audit-detail-item">
          Confidence: <span>{audit.confidence}/100</span>
        </div>
        <div className="audit-detail-item">
          Evidence Quality: <span>{audit.evidence_quality}/100</span>
        </div>
        <div className="audit-detail-item">
          Recorded At: <span>{audit.recorded_at}</span>
        </div>
      </div>

      <div className="audit-details-row" style={{ marginTop: "0.75rem", alignItems: "flex-start" }}>
        <div className="audit-detail-item" style={{ display: "block", flex: 1 }}>
          Compliance:
          <span style={{ display: "block" }}>{audit.perspectives?.compliance || "n/a"}</span>
        </div>
        <div className="audit-detail-item" style={{ display: "block", flex: 1 }}>
          Forensic:
          <span style={{ display: "block" }}>{audit.perspectives?.forensic || "n/a"}</span>
        </div>
        <div className="audit-detail-item" style={{ display: "block", flex: 1 }}>
          Risk:
          <span style={{ display: "block" }}>{audit.perspectives?.risk || "n/a"}</span>
        </div>
      </div>

      {audit.sources_used.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="form-label">Sources Used</div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            {audit.sources_used.map((source) => (
              <a key={source} href={source} target="_blank" rel="noopener noreferrer" className="agent-url">
                {source}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
