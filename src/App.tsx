import { useState, useEffect, useRef } from "react";
import { getGenLayerClient, CONTRACT_ADDRESS, RPC_URL, generatePrivateKey } from "./genlayerClient";
import "./App.css";

interface AuditReport {
  reporter: string;
  verdict: string;
  severity: number;
  slashed: number;
  reasoning: string;
}

interface AgentState {
  id: string;
  mandate: string;
  evidence_url: string;
  bond_remaining: number;
  status: string;
  audits: AuditReport[];
}

interface LogLine {
  timestamp: string;
  text: string;
  type: "info" | "success" | "error" | "warning";
}

function App() {
  // Account & Client Settings
  const [privateKey, setPrivateKey] = useState<string>("");
  const [activeAddress, setActiveAddress] = useState<string>("");
  const [contractAddress] = useState<string>(CONTRACT_ADDRESS);
  const [penaltyPool, setPenaltyPool] = useState<number>(0);
  
  // Ephemeral loading
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Registry & Active Selection
  const [agentsRegistry, setAgentsRegistry] = useState<string[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [activeAgentData, setActiveAgentData] = useState<AgentState | null>(null);

  // Register Form
  const [regId, setRegId] = useState<string>("");
  const [regMandate, setRegMandate] = useState<string>("");
  const [regEvidenceUrl, setRegEvidenceUrl] = useState<string>("");
  const [regBond, setRegBond] = useState<number>(500000); // 500,000 cents = $5,000

  // Interaction Forms
  const [topUpAmount, setTopUpAmount] = useState<number>(100000); // $1000.00
  const [reporterName, setReporterName] = useState<string>("watcher-alice");

  // Console Logs
  const [consoleLogs, setConsoleLogs] = useState<LogLine[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load private key on mount
  useEffect(() => {
    let key = localStorage.getItem("watchtower_private_key");
    if (!key) {
      key = generatePrivateKey();
      localStorage.setItem("watchtower_private_key", key);
    }
    setPrivateKey(key);
    
    // Load registered agents from local storage
    const savedAgents = localStorage.getItem("watchtower_registered_agents");
    if (savedAgents) {
      try {
        const parsed = JSON.parse(savedAgents);
        setAgentsRegistry(parsed);
        if (parsed.length > 0) {
          setSelectedAgentId(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to parse agents registry", e);
      }
    } else {
      // Pre-populate with default search helper agent ID
      setAgentsRegistry(["treasury-bot-01"]);
      setSelectedAgentId("treasury-bot-01");
      localStorage.setItem("watchtower_registered_agents", JSON.stringify(["treasury-bot-01"]));
    }
  }, []);

  // Update address when privateKey changes
  useEffect(() => {
    if (privateKey) {
      try {
        const client = getGenLayerClient(privateKey);
        if (client.account) {
          setActiveAddress(client.account.address);
        }
      } catch (e) {
        console.error("Failed to extract address from key", e);
      }
    }
  }, [privateKey]);

  // Load selected agent & penalty pool
  useEffect(() => {
    if (selectedAgentId) {
      fetchAgentDetails(selectedAgentId);
    }
    fetchPenaltyPool();
  }, [selectedAgentId, activeAddress]);

  // Auto-scroll console
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Add line to custom console
  const addLog = (text: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, { timestamp, text, type }]);
  };

  // Fetch Penalty Pool
  const fetchPenaltyPool = async () => {
    try {
      const client = getGenLayerClient(privateKey);
      const pool = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_penalty_pool",
      });
      setPenaltyPool(Number(pool));
    } catch (e) {
      console.error("Failed to fetch penalty pool", e);
    }
  };

  // Fetch details of a specific agent
  const fetchAgentDetails = async (agentId: string) => {
    if (!agentId) return;
    try {
      const client = getGenLayerClient(privateKey);
      const res = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_agent",
        args: [agentId],
      });
      
      const resStr = String(res);
      if (resStr === "{}" || !resStr) {
        setActiveAgentData(null);
      } else {
        const parsed = JSON.parse(resStr) as AgentState;
        setActiveAgentData(parsed);
      }
    } catch (e) {
      console.error("Failed to load agent details", e);
      setActiveAgentData(null);
    }
  };

  // Update Custom Key
  const handleKeyChange = (key: string) => {
    if (key.trim().startsWith("0x") && key.trim().length === 66) {
      setPrivateKey(key.trim());
      localStorage.setItem("watchtower_private_key", key.trim());
      addLog("Restored account from custom private key.", "success");
    } else if (key.trim() === "") {
      // Regenerate
      const newKey = generatePrivateKey();
      setPrivateKey(newKey);
      localStorage.setItem("watchtower_private_key", newKey);
      addLog("Cleared key. Generated new random ephemeral account.", "info");
    }
  };

  // Fund Account (Studionet only)
  const fundAccount = async () => {
    if (!activeAddress) return;
    setIsFunding(true);
    addLog(`Requesting test tokens for ${activeAddress}...`, "info");
    try {
      const client = getGenLayerClient(privateKey);
      await client.request({
        method: "sim_fundAccount",
        params: [activeAddress as `0x${string}`, 100],
      });
      addLog("Test tokens funded successfully! (100 GEN)", "success");
    } catch (e) {
      console.error("Funding error", e);
      addLog("Failed to fund account. This feature requires Studionet.", "error");
    } finally {
      setIsFunding(false);
    }
  };

  // Register Agent
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId || !regMandate || !regEvidenceUrl || regBond <= 0) {
      alert("Please fill all agent registration fields.");
      return;
    }

    setIsLoading(true);
    addLog(`[Register] Submitting agent registration for: ${regId}...`, "info");
    try {
      const client = getGenLayerClient(privateKey);
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "register_agent",
        args: [regId, regMandate, regEvidenceUrl, regBond],
        value: 0n,
      });

      addLog(`[Register] TX Broadcasted. Hash: ${txHash}. Waiting for finalization...`, "warning");

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
      });

      addLog(`[Register] Finalized in block. Result status: ${receipt.status}`, "success");
      
      // Update local registry
      if (!agentsRegistry.includes(regId)) {
        const updated = [...agentsRegistry, regId];
        setAgentsRegistry(updated);
        localStorage.setItem("watchtower_registered_agents", JSON.stringify(updated));
      }

      // Reset form
      setRegId("");
      setRegMandate("");
      setRegEvidenceUrl("");
      
      // Focus on registered agent
      setSelectedAgentId(regId);
      await fetchAgentDetails(regId);
      await fetchPenaltyPool();
    } catch (err: any) {
      console.error(err);
      addLog(`[Register Error] ${err.message || err.toString()}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Top Up Bond
  const handleTopUp = async () => {
    if (!selectedAgentId || topUpAmount <= 0) return;
    setIsLoading(true);
    addLog(`[Top-up] Depositing $${(topUpAmount/100).toFixed(2)} cọc (bond) cho ${selectedAgentId}...`, "info");
    try {
      const client = getGenLayerClient(privateKey);
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "top_up_bond",
        args: [selectedAgentId, topUpAmount],
        value: 0n,
      });

      addLog(`[Top-up] TX Broadcasted. Hash: ${txHash}. Awaiting confirmation...`, "warning");

      await client.waitForTransactionReceipt({
        hash: txHash,
      });

      addLog("[Top-up] Bond top-up confirmed successfully!", "success");
      await fetchAgentDetails(selectedAgentId);
    } catch (err: any) {
      console.error(err);
      addLog(`[Top-up Error] ${err.message || err.toString()}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Run Audit
  const handleAudit = async () => {
    if (!selectedAgentId || !activeAgentData) return;
    setIsLoading(true);
    addLog(`[Audit] Initiating audit for agent: ${selectedAgentId} triggered by ${reporterName}...`, "info");
    
    // Simulate terminal outputs representing GenVM consensus stages
    const runSim = (delay: number, text: string, type: "info" | "success" | "error" | "warning" = "info") => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          addLog(text, type);
          resolve();
        }, delay);
      });
    };

    try {
      const client = getGenLayerClient(privateKey);

      // Begin writing transaction
      const txPromise = client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "audit",
        args: [selectedAgentId, reporterName],
        value: 0n,
      });

      await runSim(1000, `[GenVM] Transaction sent to transaction pool. Broadcasting to active validators...`, "info");
      await runSim(2500, `[GenVM] Leader node selected. Executing web content reader...`, "warning");
      await runSim(4000, `[gl.nondet.web.render] Cào nhật ký hoạt động từ URL: ${activeAgentData.evidence_url}`, "info");
      await runSim(6000, `[gl.nondet.exec_prompt] Gửi dữ liệu nhật ký & mandate đến mô hình LLM Consensus...`, "warning");
      await runSim(8000, `[GenVM] Các node Validators bắt đầu kiểm chứng đề xuất của Leader...`, "info");

      const txHash = await txPromise;
      addLog(`[Audit] Transaction successfully mined. TX Hash: ${txHash}. Finalizing consensus...`, "warning");

      await client.waitForTransactionReceipt({
        hash: txHash,
      });

      addLog(`[Audit] Consensus reached. Sông đã đổ, transaction finalized!`, "success");
      
      // Reload Agent and Pool
      await fetchAgentDetails(selectedAgentId);
      await fetchPenaltyPool();
      
      // Print verdict summary based on reloaded state
      const refreshedClient = getGenLayerClient(privateKey);
      const res = await refreshedClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_agent",
        args: [selectedAgentId],
      });
      const parsed = JSON.parse(String(res)) as AgentState;
      const latestAudit = parsed.audits[parsed.audits.length - 1];
      if (latestAudit) {
        const severityColor = latestAudit.severity >= 60 ? "error" : latestAudit.severity >= 30 ? "warning" : "success";
        addLog(`[Verdict] Reporter: ${latestAudit.reporter} | Verdict: ${latestAudit.verdict} (Severity: ${latestAudit.severity}/100)`, severityColor);
        addLog(`[Reasoning] ${latestAudit.reasoning}`, "info");
        if (latestAudit.slashed > 0) {
          addLog(`[Slashing Alert] SLASHE D $${(latestAudit.slashed / 100).toFixed(2)} from bond into penalty pool!`, "error");
        }
      }
    } catch (err: any) {
      console.error(err);
      addLog(`[Audit Error] ${err.message || err.toString()}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <h1>
            🛡️ WATCHTOWER <span className="brand-badge">GenLayer Studio v0.2.16</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Fiduciary Guarddog for Autonomous AI Agents
          </p>
        </div>
        
        <div className="contract-info">
          <div className="contract-address-label">
            <span>Intelligent Contract Address</span>
          </div>
          <div className="contract-address" title={contractAddress}>
            {contractAddress}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Sidebar */}
        <aside className="sidebar">
          {/* Ephemeral Account info */}
          <section className="card">
            <h2 className="card-title">
              🔑 Active Wallet
            </h2>
            <div className="account-box">
              <div className="account-row">
                <span className="account-key">Address</span>
                <span className="account-val" title={activeAddress}>
                  {activeAddress || "Connecting..."}
                </span>
              </div>
              <div className="account-row">
                <span className="account-key">RPC URL</span>
                <span className="account-val" title={RPC_URL}>
                  Studio Network
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
                onChange={(e) => handleKeyChange(e.target.value)}
              />
            </div>
            
            <div className="account-actions">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={fundAccount}
                disabled={isFunding}
              >
                {isFunding ? "Funding..." : "⚡ Request 100 GEN"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const newKey = generatePrivateKey();
                  handleKeyChange(newKey);
                }}
              >
                🔄 New Account
              </button>
            </div>
          </section>

          {/* Slashed penalty pool widget */}
          <section className="card">
            <h2 className="card-title">
              💰 Penalty Pool
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-pink)", fontFamily: "var(--font-mono)" }}>
                ${(penaltyPool / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                USD (Cents: {penaltyPool})
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-dark)", marginTop: "0.5rem" }}>
              Total bond amount slashed from rogue AI agents violating their natural language mandates.
            </p>
          </section>

          {/* Agents registry */}
          <section className="card">
            <h2 className="card-title">
              🤖 Monitored Agents
            </h2>
            {agentsRegistry.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No agents monitored yet.</p>
            ) : (
              <div className="registry-list">
                {agentsRegistry.map((id) => (
                  <div
                    key={id}
                    className={`registry-item ${selectedAgentId === id ? "active" : ""}`}
                    onClick={() => setSelectedAgentId(id)}
                  >
                    <span className="registry-id">{id}</span>
                    <span className="registry-status active">Active</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>

        {/* Right Main Panel */}
        <main className="main-panel">
          {/* Register Agent Card */}
          <section className="card">
            <h2 className="card-title">
              ✍️ Register New AI Agent Guardian
            </h2>
            <form onSubmit={handleRegister}>
              <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Agent ID / Name</label>
                  <input
                    type="text"
                    className="form-input form-input-mono"
                    placeholder="e.g. treasury-bot-01"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="form-label">Initial Bond (in Cents)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="500000 (= $5,000 USD)"
                    value={regBond}
                    onChange={(e) => setRegBond(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Mandate (Natural Language Scope & Obligations)</label>
                <textarea
                  className="form-textarea"
                  placeholder="I am a treasury agent. I can only make developer salary, hosting, and marketing payments. I must not swap token memes or transfer more than $1000 per transaction..."
                  value={regMandate}
                  onChange={(e) => setRegMandate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Public Activity Feed URL (Raw Logs Website)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://gist.githubusercontent.com/.../raw/activity.log"
                  value={regEvidenceUrl}
                  onChange={(e) => setRegEvidenceUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Broadcasting to GenLayer..." : "🔒 Lock Bond & Register Agent"}
              </button>
            </form>
          </section>

          {/* Active Agent Dashboard */}
          {activeAgentData ? (
            <div className="agent-dashboard">
              <section className="card">
                <div className="agent-header-card">
                  <div className="agent-title-area">
                    <h2>
                      🤖 {activeAgentData.id}
                    </h2>
                    <a
                      href={activeAgentData.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-url"
                    >
                      🔗 View Public Evidence Logs ↗
                    </a>
                  </div>
                  
                  <span className={`status-badge ${activeAgentData.status.toLowerCase()}`}>
                    {activeAgentData.status}
                  </span>
                </div>

                <div className="bond-container">
                  <div className="bond-header">
                    <span className="bond-title">Guardian Bond Progress</span>
                    <span className="bond-values">
                      ${(activeAgentData.bond_remaining / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining
                    </span>
                  </div>
                  <div className="bond-bar">
                    <div
                      className={`bond-fill ${activeAgentData.status === "FROZEN" ? "slashed" : ""}`}
                      style={{ width: `${Math.max(0, Math.min(100, activeAgentData.bond_remaining > 0 ? 100 : 0))}%` }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <span className="form-label">Ủy thác hoạt động (Fiduciary Mandate)</span>
                  <div className="mandate-quote">
                    "{activeAgentData.mandate}"
                  </div>
                </div>
              </section>

              {/* Action Box Grid */}
              <div className="action-box-grid">
                {/* Audit Trigger */}
                <section className="card" style={{ marginBottom: 0 }}>
                  <h2 className="card-title">
                    🔍 Trigger Fiduciary Audit
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                    This triggers a GenVM consensus. Validators fetch public logs and execute LLM judgment logic.
                  </p>
                  
                  <div className="form-group">
                    <label className="form-label">Reporter Name</label>
                    <input
                      type="text"
                      className="form-input form-input-mono"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      disabled={isLoading || activeAgentData.status === "FROZEN"}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleAudit}
                    disabled={isLoading || activeAgentData.status === "FROZEN"}
                  >
                    {isLoading ? "Auditing via GenVM..." : "🚀 Run Intelligent Audit"}
                  </button>
                </section>

                {/* Top Up Bond Form */}
                <section className="card" style={{ marginBottom: 0 }}>
                  <h2 className="card-title">
                    💸 Increase Agent Bond
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                    Top up the security cọc (bond) for active agents to allow higher volume operations.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Top up Amount (in Cents)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      disabled={isLoading || activeAgentData.status === "FROZEN"}
                    />
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={handleTopUp}
                    disabled={isLoading || activeAgentData.status === "FROZEN"}
                  >
                    {isLoading ? "Confirming..." : "➕ Top Up Bond"}
                  </button>
                </section>
              </div>

              {/* Console Output simulator */}
              <section className="card" style={{ marginBottom: 0 }}>
                <h2 className="card-title">
                  💻 GenVM Consensus Console
                </h2>
                <div className="terminal">
                  <div className="terminal-header">
                    <div className="terminal-dot dot-red" />
                    <div className="terminal-dot dot-yellow" />
                    <div className="terminal-dot dot-green" />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dark)", marginLeft: "0.5rem" }}>console@genvm</span>
                  </div>
                  {consoleLogs.length === 0 ? (
                    <div className="terminal-line info">Awaiting transaction execution...</div>
                  ) : (
                    consoleLogs.map((log, idx) => (
                      <div key={idx} className={`terminal-line ${log.type}`}>
                        [{log.timestamp}] {log.text}
                      </div>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </section>

              {/* Audit history list */}
              <section className="card" style={{ marginBottom: 0 }}>
                <h2 className="card-title">
                  📜 Audit History logs
                </h2>
                {activeAgentData.audits.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
                    No audit reports filed for this agent yet.
                  </p>
                ) : (
                  <div className="audit-timeline">
                    {activeAgentData.audits.slice().reverse().map((audit, idx) => (
                      <div 
                        key={idx} 
                        className={`audit-node node-${audit.verdict.toLowerCase()}`}
                      >
                        <div className="audit-meta">
                          <span className={`audit-verdict ${audit.verdict.toLowerCase()}`}>
                            {audit.verdict}
                          </span>
                          <span className="audit-reporter">
                            Reported by <strong>{audit.reporter}</strong>
                          </span>
                          {audit.slashed > 0 && (
                            <span className="audit-slashed">
                              -${(audit.slashed / 100).toFixed(2)} slashed
                            </span>
                          )}
                        </div>
                        
                        <div className="audit-reasoning">
                          {audit.reasoning}
                        </div>
                        
                        <div className="audit-details-row">
                          <div className="audit-detail-item">
                            Severity: <span>{audit.severity}/100</span>
                          </div>
                          <div className="audit-detail-item">
                            Slash Ratio: <span>{audit.slashed > 0 ? `${Math.round(audit.slashed / activeAgentData.bond_remaining * 100)}%` : "0%"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <section className="empty-dashboard">
              <div className="empty-icon">🤖</div>
              <h3>No Agent Selected</h3>
              <p>
                Select a registered AI agent from the list on the left, or fill in the registration form above to spawn a new agent watchdog.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
