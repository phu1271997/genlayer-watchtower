interface LogLine {
  timestamp: string;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

interface ToastNotificationsProps {
  logs: LogLine[];
}

export function ToastNotifications({ logs }: ToastNotificationsProps) {
  const visible = logs.slice(-3);
  if (visible.length === 0) return null;

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, display: "grid", gap: "0.75rem", zIndex: 20 }}>
      {visible.map((log, index) => (
        <div key={`${log.timestamp}-${index}`} className={`audit-node node-${log.type === "error" ? "violation" : "warning"}`}>
          <div className="audit-reasoning">[{log.timestamp}] {log.text}</div>
        </div>
      ))}
    </div>
  );
}
