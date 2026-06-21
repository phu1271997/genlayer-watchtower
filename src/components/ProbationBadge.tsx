interface ProbationBadgeProps {
  probationUntil: number;
  now: number;
}

export function ProbationBadge({ probationUntil, now }: ProbationBadgeProps) {
  const remaining = Math.max(0, probationUntil - now);
  if (probationUntil <= 0 || remaining <= 0) return null;

  return (
    <span className="status-badge warning" title={`Probation remaining: ${remaining}`}>
      PROBATION · {remaining}s left
    </span>
  );
}
