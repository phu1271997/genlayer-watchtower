import { ClaimButton } from "./ClaimButton";

interface PenaltyPoolPanelProps {
  penaltyPool: number;
  pendingBalance: number;
  isLoading: boolean;
  onClaim: () => void;
}

export function PenaltyPoolPanel({ penaltyPool, pendingBalance, isLoading, onClaim }: PenaltyPoolPanelProps) {
  return (
    <section className="card">
      <h2 className="card-title">💰 Penalty Pool</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-pink)", fontFamily: "var(--font-mono)" }}>
          {penaltyPool.toLocaleString()}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Native GEN units</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-dark)", marginTop: "0.5rem" }}>
        Total slashed value currently retained by Watchtower after reporter splits.
      </p>
      <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Claimable balance</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{pendingBalance}</span>
        </div>
        <ClaimButton pendingBalance={pendingBalance} disabled={isLoading} onClick={onClaim} />
      </div>
    </section>
  );
}
