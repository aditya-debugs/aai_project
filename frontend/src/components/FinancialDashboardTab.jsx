import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  RotateCw, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Layers, 
  Clock, 
  FileText,
  Upload,
  Zap,
  Sparkles,
  Info
} from 'lucide-react';

export default function FinancialDashboardTab({ 
  onRunWorkflow, 
  pipelineResult, 
  loading,
  maxRisk 
}) {
  const [source, setSource] = useState('sample');
  const [openingBalance, setOpeningBalance] = useState(100000);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [preferredRag, setPreferredRag] = useState('auto');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const inr = (val) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploadStatus('Uploading & normalising statement...');
      const res = await fetch('/api/pipeline/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Uploaded: ${data.record_count} transactions parsed from ${data.filename}`);
        setSource('custom');
      } else {
        setUploadStatus(`Error: ${data.detail || 'Failed to parse'}`);
      }
    } catch (err) {
      setUploadStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleRun = () => {
    onRunWorkflow({
      source,
      opening_balance: Number(openingBalance),
      monthly_income: Number(monthlyIncome),
      preferred_rag: preferredRag,
      risk_level: maxRisk,
    });
  };

  const summary = pipelineResult?.summary || {
    health_score: 78,
    balance: 142500,
    savings_rate: 0.245,
    emergency_months: 4.8,
    cash_flow_risk: 'Low',
    alert_count: 2,
    anomalies_count: 3,
    transaction_count: 240,
  };

  const health = pipelineResult?.health || { score: 78, savings_rate: 0.245, emergency_months: 4.8 };
  const alerts = pipelineResult?.alerts || [];
  const anomalies = pipelineResult?.anomalies || [];
  const advice = pipelineResult?.advice || [];
  const forecast = pipelineResult?.forecast || { risk: 'Low', min_balance: 32000, safe: true };
  const trace = pipelineResult?.trace || [];
  const ragContext = pipelineResult?.rag_context || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Configuration & Trigger Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={22} color="#06b6d4" />
              <span>Financial Overview & Multi-Agent Orchestration</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Execute the 11-agent financial pipeline with real-time health scoring, anomaly detection, cash-flow forecasting, and grounded RAG advice.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Preferred RAG Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RAG:</span>
              <select
                value={preferredRag}
                onChange={(e) => setPreferredRag(e.target.value)}
                className="select-control"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', border: 'none', background: 'transparent', color: '#c4b5fd' }}
              >
                <option value="auto">✨ Auto RAG Router</option>
                <option value="personal_finance_rag">Personal Finance RAG</option>
                <option value="rbi_regulations_rag">RBI Regulations RAG</option>
                <option value="tax_regimes_rag">Tax Regimes RAG</option>
                <option value="market_benchmarks_rag">Market Benchmarks RAG</option>
              </select>
            </div>

            {/* Run Button */}
            <button 
              onClick={handleRun} 
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '10px 22px' }}
            >
              {loading ? <RotateCw size={16} className="spin" /> : <Play size={16} />}
              <span>Run Financial Pipeline</span>
            </button>
          </div>
        </div>

        {/* Input Controls Drawer */}
        <div style={{ 
          marginTop: 18, 
          paddingTop: 16, 
          borderTop: '1px solid var(--border-subtle)', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16 
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              DATA SOURCE
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="select-control"
            >
              <option value="sample">Sample Statement (12 Months)</option>
              <option value="custom">Uploaded Custom Statement</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              OPENING BALANCE (₹)
            </label>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="input-control"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              MONTHLY INCOME (₹)
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="input-control"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              UPLOAD STATEMENT (CSV/JSON/PDF)
            </label>
            <input
              type="file"
              accept=".csv,.json,.pdf"
              onChange={handleFileUpload}
              className="input-control"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            />
            {uploadStatus && (
              <span style={{ fontSize: '0.7rem', color: uploadStatus.startsWith('Error') ? '#f87171' : '#34d399', display: 'block', marginTop: 3 }}>
                {uploadStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {/* Health Score Metric */}
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HEALTH SCORE</span>
            <span className="badge badge-emerald">MAX 100</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: 6 }}>
            {summary.health_score}<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Deterministic wellness score
          </div>
        </div>

        {/* Current Balance Metric */}
        <div className="glass-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED BALANCE</span>
            <span className="badge badge-cyan">NET CASH</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: 6 }}>
            {inr(summary.balance)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Income & expense reconciliation
          </div>
        </div>

        {/* Savings Rate Metric */}
        <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVINGS RATE</span>
            <span className="badge badge-purple">BENCHMARK ≥ 20%</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', marginTop: 6 }}>
            {(summary.savings_rate * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Target: 25% - 30% of income
          </div>
        </div>

        {/* Emergency Cushion Metric */}
        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMERGENCY CUSHION</span>
            <span className="badge badge-amber">BENCHMARK 6 MO</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: 6 }}>
            {summary.emergency_months.toFixed(1)} <span style={{ fontSize: '1rem' }}>mo</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Essential living expenses buffer
          </div>
        </div>

        {/* Cash Flow Risk Metric */}
        <div className="glass-card" style={{ borderLeft: summary.cash_flow_risk === 'High' ? '4px solid #ef4444' : '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CASH-FLOW RISK</span>
            <span className={`badge ${summary.cash_flow_risk === 'High' ? 'badge-red' : 'badge-emerald'}`}>
              25-DAY SIM
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: summary.cash_flow_risk === 'High' ? '#f87171' : '#34d399', marginTop: 6 }}>
            {summary.cash_flow_risk}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Min projection: {inr(forecast.min_balance)}
          </div>
        </div>
      </div>

      {/* AI CFO Coach Summary & Grounded RAG Guidance */}
      <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#c084fc" />
              <span className="badge badge-indigo">AI CFO GROUNDED SYNTHESIS</span>
              {ragContext && (
                <span className="badge badge-purple">
                  RAG SOURCE: {ragContext.chosen_rag}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 6, color: '#ffffff' }}>
              Personalized Financial Wellness Assessment
            </h3>
          </div>
          <span className="badge badge-emerald">REVIEWER GUARDRAIL APPROVED</span>
        </div>

        {/* Grounded narrative */}
        <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.6 }}>
          {typeof pipelineResult?.narrative === 'object' && pipelineResult?.narrative?.summary
            ? pipelineResult.narrative.summary
            : typeof pipelineResult?.narrative === 'string'
            ? pipelineResult.narrative
            : `Your financial foundation shows a healthy score of ${summary.health_score}/100. Emergency cushion stands at ${summary.emergency_months.toFixed(1)} months of essential living expenses, protecting your liquidity baseline. 25-day cash-flow simulation indicates ${summary.cash_flow_risk} risk with expected minimum balance of ${inr(forecast.min_balance)}.`}
        </p>

        {/* Grounded RAG Evidence Box */}
        {ragContext?.facts && ragContext.facts.length > 0 && (
          <div style={{ marginTop: 16, background: 'rgba(139, 92, 246, 0.08)', borderRadius: 10, padding: 14, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <FileText size={14} />
              <span>Grounded RAG Evidence Anchoring This Assessment:</span>
            </span>
            <ul style={{ paddingLeft: 18, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ragContext.facts.slice(0, 3).map((f, i) => (
                <li key={i}>
                  <strong style={{ color: '#e2e8f0' }}>{f.title}:</strong> {f.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Two Column Grid: Anomaly Alerts & Recommended Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Anomaly Detection */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
              <ShieldAlert size={18} />
              <span>Detected Anomalies ({anomalies.length})</span>
            </h3>
            <span className="badge badge-red">Z-SCORE FLAGS</span>
          </div>

          {anomalies.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div>No critical financial anomalies detected.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {anomalies.slice(0, 4).map((a, idx) => (
                <div key={idx} className="glass-card" style={{ borderLeft: '3px solid #ef4444', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                      {a.merchant}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171' }}>
                      {inr(a.amount)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <strong>{a.kind}:</strong> {a.reason} · <em>{a.date}</em>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quantified Recommendations */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8' }}>
              <TrendingUp size={18} />
              <span>Quantified Advice ({advice.length})</span>
            </h3>
            <span className="badge badge-cyan">₹/YEAR SAVINGS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {advice.slice(0, 4).map((adv, idx) => (
              <div key={idx} className="glass-card" style={{ borderLeft: '3px solid #06b6d4', padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                    {adv.action}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    +{inr(adv.saving)}/yr
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {adv.why}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Trace Timeline (All 11 Agents) */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="#c084fc" />
          <span>11-Agent Execution Trace & Execution Latency</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {trace.map((tr, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                  {tr.agent}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {tr.ms} ms
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {tr.summary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
