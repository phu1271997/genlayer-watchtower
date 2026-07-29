export function LoadingSkeleton() {
  const phases = [
    "Sanitizing inputs...",
    "Rendering 5 sources...",
    "Capturing screenshot...",
    "Cross-referencing prior audits...",
    "Reaching consensus...",
  ];

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2 className="card-title">⏳ Audit Pipeline</h2>
      <div style={{ display: "grid", gap: "0.6rem" }}>
        {phases.map((phase) => (
          <div key={phase} className="terminal-line info">
            {phase}
          </div>
        ))}
      </div>
    </div>
  );
}
