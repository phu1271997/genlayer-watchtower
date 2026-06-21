interface AuditFeedItem {
  id: number;
  verdict: string;
  reporter_label?: string;
  severity: number;
  reasoning: string;
}

interface LiveAuditFeedProps {
  audits: AuditFeedItem[];
  demoMode: boolean;
}

export function LiveAuditFeed({ audits, demoMode }: LiveAuditFeedProps) {
  return (
    <section className="card" style={{ marginBottom: 0 }}>
      <h2 className="card-title">{demoMode ? "📡 Demo Live Audit Feed" : "📡 Live Audit Feed"}</h2>
      {audits.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {demoMode ? "Waiting for demo audits..." : "Run audits to populate the live feed."}
        </p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {audits.map((audit) => (
            <div key={audit.id} className={`audit-node node-${audit.verdict.toLowerCase()}`}>
              <div className="audit-meta">
                <span className={`audit-verdict ${audit.verdict.toLowerCase()}`}>{audit.verdict}</span>
                <span className="audit-reporter">
                  #{audit.id} · {audit.reporter_label || "watcher"}
                </span>
              </div>
              <div className="audit-reasoning">{audit.reasoning}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
