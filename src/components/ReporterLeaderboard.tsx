interface ReporterEntry {
  address: string;
  total_rewarded: number;
  audit_count: number;
  overturned_count: number;
  score: number;
}

interface ReporterLeaderboardProps {
  reporters: ReporterEntry[];
}

export function ReporterLeaderboard({ reporters }: ReporterLeaderboardProps) {
  if (reporters.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No reporter rewards recorded yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {reporters.map((reporter, index) => (
        <div key={reporter.address} className="audit-node node-warning">
          <div className="audit-meta">
            <span className="audit-verdict warning">#{index + 1}</span>
            <span className="audit-reporter">
              <strong>{reporter.address}</strong>
            </span>
          </div>
          <div className="audit-details-row">
            <div className="audit-detail-item">
              Rewarded: <span>{reporter.total_rewarded}</span>
            </div>
            <div className="audit-detail-item">
              Audits: <span>{reporter.audit_count}</span>
            </div>
            <div className="audit-detail-item">
              Overturned: <span>{reporter.overturned_count}</span>
            </div>
            <div className="audit-detail-item">
              Score: <span>{reporter.score}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
