import { useMemo } from "react";

interface AuditLike {
  id: number;
  verdict: string;
  reporter_label?: string;
  severity: number;
  reasoning: string;
}

export function useLiveAudits(audits: AuditLike[], demoMode: boolean) {
  return useMemo(() => {
    if (!demoMode) return audits.slice().reverse();
    return audits.slice().reverse().slice(0, 10);
  }, [audits, demoMode]);
}
