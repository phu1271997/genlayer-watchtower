interface Watchlist {
  id: number;
  name: string;
  agents: string[];
  subscriber_count: number;
}

interface WatchlistTabProps {
  watchlists: Watchlist[];
}

export function WatchlistTab({ watchlists }: WatchlistTabProps) {
  if (watchlists.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No watchlists created yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {watchlists.map((watchlist) => (
        <div key={watchlist.id} className="audit-node node-warning">
          <div className="audit-meta">
            <span className="audit-verdict warning">#{watchlist.id}</span>
            <span className="audit-reporter">
              <strong>{watchlist.name}</strong>
            </span>
          </div>
          <div className="audit-reasoning">{watchlist.agents.join(", ") || "No agents yet"}</div>
          <div className="audit-details-row">
            <div className="audit-detail-item">
              Subscribers: <span>{watchlist.subscriber_count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
