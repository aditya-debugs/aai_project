import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Layers, 
  GitFork, 
  Cpu, 
  Database, 
  Terminal, 
  FileText,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  circuitBreaker, 
  onToggleCircuitBreaker,
  maxRisk,
  setMaxRisk
}) {
  const tabs = [
    { id: 'overview', label: 'Financial Overview', icon: Activity },
    { id: 'diagram', label: 'Architecture Diagram', icon: Layers },
    { id: 'lineage', label: 'Parameter Lineage', icon: GitFork },
    { id: 'guardrails', label: 'Guardrails Harness', icon: ShieldCheck },
    { id: 'governance', label: 'Governance & EMG', icon: AlertOctagon },
    { id: 'multirag', label: 'Multi-RAG Router', icon: Database },
    { id: 'multimcp', label: 'Multi-MCP Servers', icon: Terminal },
    { id: 'publicdata', label: 'Public Data', icon: FileText },
  ];

  return (
    <header className="glass-panel" style={{ 
      margin: '16px auto', 
      maxWidth: 1440, 
      padding: '14px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 42, 
            height: 42, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FinPilot
              </h1>
              <span className="badge badge-cyan">v2.0 Autonomous Agent</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              11-Agent Financial Wellness Engine · EMG Sentinel · Guardrails Harness · Multi-MCP & Multi-RAG
            </p>
          </div>
        </div>

        {/* Right Controls: Circuit Breaker Status, Killswitch, Risk Tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Risk Tier Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RISK TIER:</span>
            <select 
              value={maxRisk} 
              onChange={(e) => setMaxRisk(e.target.value)}
              className="select-control"
              style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto', background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          {/* Circuit Breaker Pill */}
          <div className={`badge ${circuitBreaker.tripped ? 'badge-red' : 'badge-emerald'}`} style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
            <div className={circuitBreaker.tripped ? 'status-dot-red' : 'status-dot-green'} />
            <span>{circuitBreaker.tripped ? 'KILLSWITCH ENGAGED' : 'SYSTEM OPERATIONAL'}</span>
          </div>

          {/* Emergency Killswitch Toggle */}
          <button 
            onClick={() => onToggleCircuitBreaker(!circuitBreaker.tripped)}
            className={`btn ${circuitBreaker.tripped ? 'btn-outline' : 'btn-danger'}`}
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            {circuitBreaker.tripped ? (
              <>
                <RefreshCw size={14} />
                <span>Reset Sentinel</span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} />
                <span>Emergency Killswitch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav style={{ 
        display: 'flex', 
        gap: 6, 
        overflowX: 'auto', 
        paddingBottom: 2, 
        borderTop: '1px solid var(--border-subtle)', 
        paddingTop: 12 
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 15px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#38bdf8' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
