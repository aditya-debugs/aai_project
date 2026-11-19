import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  RotateCw, 
  ShieldAlert, 
  ShieldCheck, 
  Hash, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter,
  Activity
} from 'lucide-react';

export default function GovernanceEMGTab({ circuitBreaker, onToggleCircuitBreaker }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [manualReason, setManualReason] = useState('Manual administrator security review');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/governance/emg-logs?limit=50');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch EMG logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (severityFilter === 'ALL') return true;
    return log.severity === severityFilter;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'EMERGENCY': return 'badge-red';
      case 'CRITICAL': return 'badge-red';
      case 'WARNING': return 'badge-amber';
      default: return 'badge-indigo';
    }
  };

  const getDispositionBadge = (disp) => {
    switch (disp) {
      case 'APPROVED': return 'badge-emerald';
      case 'QUARANTINED': return 'badge-red';
      case 'REJECTED': return 'badge-red';
      default: return 'badge-amber';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertOctagon size={22} color="#ef4444" />
              <span>Governance Agent & Event Monitoring (EMG) Audit Sentinel</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Immutable real-time audit event stream enforcing ISO/IEC 42001 and RBI compliance with cryptographic SHA-256 parameter hashing and automated circuit breakers.
            </p>
          </div>
          <button onClick={fetchLogs} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Audit Stream</span>
          </button>
        </div>
      </div>

      {/* Circuit Breaker Sentinel Card */}
      <div className="glass-panel" style={{ 
        padding: 24, 
        border: circuitBreaker.tripped ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
        background: circuitBreaker.tripped ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`badge ${circuitBreaker.tripped ? 'badge-red' : 'badge-emerald'}`}>
                {circuitBreaker.tripped ? 'CIRCUIT BREAKER: TRIPPED (HALTED)' : 'CIRCUIT BREAKER: OPERATIONAL'}
              </span>
              <span className="badge badge-indigo">EMG-02 COMPLIANT</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 6, color: '#ffffff' }}>
              Autonomous Safety Killswitch & Containment Harness
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {circuitBreaker.tripped 
                ? `Current Halt Reason: "${circuitBreaker.reason || 'Safety containment triggered'}"`
                : 'Monitors financial anomaly spikes, security breaches, and unauthorized tool executions. Automatically halts agent pipeline if critical exceptions occur.'}
            </p>
          </div>

          {/* Action Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {circuitBreaker.tripped ? (
              <button 
                onClick={() => onToggleCircuitBreaker(false)} 
                className="btn btn-primary"
                style={{ padding: '9px 18px' }}
              >
                <ShieldCheck size={16} />
                <span>Reset Sentinel & Resume System</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Killswitch trip reason..."
                  className="input-control"
                  style={{ width: 260, fontSize: '0.8rem' }}
                />
                <button 
                  onClick={() => onToggleCircuitBreaker(true, manualReason)} 
                  className="btn btn-danger"
                  style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}
                >
                  <ShieldAlert size={16} />
                  <span>Trip Killswitch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} color="var(--text-dim)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Severity:</span>
          {['ALL', 'INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`btn ${severityFilter === sev ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: 20 }}
            >
              {sev}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredLogs.length} events
        </div>
      </div>

      {/* EMG Audit Stream List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredLogs.map((log) => (
          <div key={log.emg_id} className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${getSeverityBadge(log.severity)}`}>
                  {log.severity}
                </span>
                <span className={`badge ${getDispositionBadge(log.governance_disposition)}`}>
                  {log.governance_disposition}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {log.action}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                  <Hash size={12} />
                  <span>{log.emg_id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <Clock size={12} />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <strong>Agent Role:</strong> <span style={{ color: '#f1f5f9' }}>{log.agent_role}</span> · 
              <strong> Actor:</strong> <span style={{ color: '#f1f5f9' }}>{log.actor}</span> · 
              <strong> Risk Score:</strong> <span style={{ color: log.risk_score > 0.5 ? '#f87171' : '#34d399' }}>{log.risk_score}</span>
            </div>

            <p style={{ marginTop: 6, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>
              {log.reason}
            </p>

            <div style={{ 
              marginTop: 10, 
              paddingTop: 10, 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)'
            }}>
              <div>Parameter Hash: <code style={{ color: '#f59e0b' }}>{log.parameter_hash}</code></div>
              <div>Trace ID: <code style={{ color: '#a78bfa' }}>{log.trace_id}</code></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
