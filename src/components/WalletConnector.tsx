interface WalletConnectorProps {
  activeAddress: string;
  privateKey: string;
  isFunding: boolean;
  onKeyChange: (value: string) => void;
  onFund: () => void;
  onGenerate: () => void;
}

export function WalletConnector({
  activeAddress,
  privateKey,
  isFunding,
  onKeyChange,
  onFund,
  onGenerate,
}: WalletConnectorProps) {
  return (
    <section className="card">
      <h2 className="card-title">🔑 Active Wallet</h2>
      <div className="account-box">
        <div className="account-row">
          <span className="account-key">Address</span>
          <span className="account-val" title={activeAddress}>
            {activeAddress || "Connecting..."}
          </span>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Private Key (ECDSA Hex)</label>
        <input
          type="text"
          className="form-input form-input-mono"
          placeholder="0x... (Leave empty for random account)"
          value={privateKey}
          onChange={(event) => onKeyChange(event.target.value)}
        />
      </div>
      <div className="account-actions">
        <button className="btn btn-secondary btn-sm" onClick={onFund} disabled={isFunding}>
          {isFunding ? "Funding..." : "⚡ Request 100 GEN"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onGenerate}>
          🔄 New Account
        </button>
      </div>
    </section>
  );
}
