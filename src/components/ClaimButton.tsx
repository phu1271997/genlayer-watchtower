interface ClaimButtonProps {
  pendingBalance: number;
  disabled?: boolean;
  onClick: () => void;
}

export function ClaimButton({ pendingBalance, disabled, onClick }: ClaimButtonProps) {
  return (
    <button className="btn btn-secondary btn-sm" onClick={onClick} disabled={disabled || pendingBalance <= 0}>
      {disabled ? "Claiming..." : "Claim Pending Balance"}
    </button>
  );
}
