import type { FormEvent } from "react";

interface AppealModalProps {
  appealArgument: string;
  appealStake: string;
  disabled?: boolean;
  onArgumentChange: (value: string) => void;
  onStakeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function AppealModal({
  appealArgument,
  appealStake,
  disabled,
  onArgumentChange,
  onStakeChange,
  onSubmit,
}: AppealModalProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Appeal Stake (GEN Units)</label>
        <input
          type="number"
          className="form-input"
          value={appealStake}
          onChange={(event) => onStakeChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Appeal Argument</label>
        <textarea
          className="form-textarea"
          value={appealArgument}
          onChange={(event) => onArgumentChange(event.target.value)}
          disabled={disabled}
          placeholder="Explain why the last audit should be overturned."
        />
      </div>
      <button type="submit" className="btn btn-secondary" disabled={disabled}>
        {disabled ? "Submitting..." : "File Appeal"}
      </button>
    </form>
  );
}
