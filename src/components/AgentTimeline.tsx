interface AgentTimelineProps {
  auditIds: number[];
}

export function AgentTimeline({ auditIds }: AgentTimelineProps) {
  if (auditIds.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
      {auditIds.slice(-3).map((auditId) => (
        <span key={auditId} className="registry-status active">
          Prior audit #{auditId}
        </span>
      ))}
    </div>
  );
}
