import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  RotateCw, 
  Play, 
  Server, 
  Cpu, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Code
} from 'lucide-react';

export default function MultiMCPTab({ maxRisk }) {
  const [servers, setServers] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  // Playground state
  const [selectedServer, setSelectedServer] = useState('financial_public_data_server');
  const [selectedTool, setSelectedTool] = useState('query_tax_regimes');
  const [toolArgs, setToolArgs] = useState('{\n  "income": 1500000.0\n}');
  const [callLoading, setCallLoading] = useState(false);
  const [callResult, setCallResult] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setLoading(true);
    try {
      const [srvRes, toolRes] = await Promise.all([
        fetch('/api/mcp/servers'),
        fetch('/api/mcp/tools'),
      ]);
      const srvData = await srvRes.json();
      const toolData = await toolRes.json();
      setServers(srvData.servers || []);
      setTools(toolData.tools || []);
    } catch (err) {
      console.error('Failed to load MCP metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelect = (toolName, serverId) => {
    setSelectedTool(toolName);
    setSelectedServer(serverId);

    // Preset arguments for convenience
    if (toolName === 'query_tax_regimes') setToolArgs('{\n  "income": 1500000.0\n}');
    else if (toolName === 'search_rbi_regulations') setToolArgs('{\n  "keyword": "liability"\n}');
    else if (toolName === 'get_household_spending_benchmarks') setToolArgs('{\n  "monthly_income": 85000.0\n}');
    else if (toolName === 'scan_financial_pii') setToolArgs('{\n  "text": "Card 4532-8921-9012-4411 and PAN ABCDE1234F"\n}');
    else if (toolName === 'verify_parameter_hash') setToolArgs('{\n  "parameters": { "income": 50000, "balance": 100000 },\n  "expected_hash": "a1b2c3d4e5f6"\n}');
    else if (toolName === 'trigger_emergency_circuit_breaker') setToolArgs('{\n  "reason": "Test emergency containment via playground"\n}');
    else if (toolName === 'forecast_cashflow') setToolArgs('{\n  "transactions": [\n    { "date": "2024-01-05", "merchant": "Salary", "amount": 60000, "type": "credit" },\n    { "date": "2024-01-10", "merchant": "Rent", "amount": 18000, "type": "debit" }\n  ],\n  "opening_balance": 50000.0,\n  "days": 25\n}');
    else setToolArgs('{}');
  };

  const handleCallTool = async () => {
    setCallLoading(true);
    setCallResult(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolArgs);
      } catch (e) {
        alert('Invalid JSON in arguments: ' + e.message);
        setCallLoading(false);
        return;
      }

      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: selectedServer,
          tool_name: selectedTool,
          arguments: parsedArgs,
        }),
      });
      const data = await res.json();
      setCallResult(data);
    } catch (err) {
      alert('Error invoking MCP tool: ' + err.message);
    } finally {
      setCallLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={22} color="#ec4899" />
              <span>Multi-MCP Server Bus & Interactive Tool Playground</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Client-server Model Context Protocol architecture running 3 FastMCP servers over stdio: Core Financial Analysis, Public Regulatory Standards, and FinTech Security.
            </p>
          </div>
          <button onClick={fetchMetadata} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span>Discover Tools</span>
          </button>
        </div>
      </div>

      {/* 3 Servers Registry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {servers.map((srv) => (
          <div key={srv.id} className="glass-card" style={{ borderTop: '3px solid #ec4899' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span className="badge badge-pink">{srv.transport}</span>
              <span className="badge badge-emerald">{srv.status}</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              {srv.name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
              {srv.description}
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Registered Tools: <strong>{srv.tool_count}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Discovered Tools Catalog & Playground Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
        {/* Left: Discovered Tools List */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
            Discovered Tool Catalog ({tools.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
            {tools.map((t) => {
              const isSelected = selectedTool === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => handleToolSelect(t.name, t.server)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: isSelected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid #ec4899' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <code style={{ fontSize: '0.825rem', color: isSelected ? '#ffffff' : '#38bdf8', fontWeight: 600 }}>
                      {t.name}()
                    </code>
                    <span className={`badge ${t.risk === 'CRITICAL' ? 'badge-red' : t.risk === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                      {t.risk}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {t.description}
                  </p>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    Server: {t.server}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Playground Invoker */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-pink">PLAYGROUND INVOKER</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4, color: '#ffffff' }}>
                <code>{selectedTool}</code>
              </h3>
            </div>
            <button 
              onClick={handleCallTool} 
              disabled={callLoading}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              {callLoading ? <RotateCw size={14} className="spin" /> : <Play size={14} />}
              <span>Execute Tool</span>
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              INPUT ARGUMENTS (JSON):
            </label>
            <textarea
              value={toolArgs}
              onChange={(e) => setToolArgs(e.target.value)}
              className="input-control"
              rows={5}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
          </div>

          {callResult && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: 6 }}>
                JSON-RPC RETURN OUTPUT:
              </label>
              <pre style={{ 
                background: 'rgba(0,0,0,0.5)', 
                padding: 14, 
                borderRadius: 8, 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.78rem',
                color: '#f8fafc',
                maxHeight: 220,
                overflowY: 'auto'
              }}>
                {JSON.stringify(callResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
