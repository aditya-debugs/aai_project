import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Hash, 
  Layers, 
  ShieldCheck, 
  FileCode,
  RotateCw
} from 'lucide-react';

export default function ParameterFlowTab() {
  const [lineageData, setLineageData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStep, setSelectedStep] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLineage();
  }, []);

  const fetchLineage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/parameters/lineage');
      const data = await res.json();
      setLineageData(data);
      if (data.steps && data.steps.length > 0) {
        setSelectedStep(data.steps[0]);
      }
    } catch (err) {
      console.error('Failed to fetch parameter lineage:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = lineageData?.steps || [];
  const filteredSteps = steps.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.phase.toLowerCase().includes(q) ||
      s.agent_or_node.toLowerCase().includes(q) ||
      s.parameter_source.toLowerCase().includes(q) ||
      s.parameter_destination.toLowerCase().includes(q) ||
      JSON.stringify(s.input_parameters).toLowerCase().includes(q) ||
      JSON.stringify(s.output_parameters).toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <GitFork size={22} color="#06b6d4" />
              <span>Parameter Lineage & Transformation Tracker ("What Parameters Go Where")</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Complete end-to-end data-flow lineage tracking parameter origins, mutations, downstream destinations, schema enforcement, and cryptographic SHA-256 parameter hashes.
            </p>
          </div>
          <button onClick={fetchLineage} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Lineage</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Search parameters, input/output schemas, or agent stages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control"
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Showing {filteredSteps.length} of {steps.length} Pipeline Stages
        </div>
      </div>

      {/* Main Table View */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 4 }}>
        <table className="finpilot-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pipeline Phase & Node</th>
              <th>Input Parameters (Source)</th>
              <th>Output Parameters (Destination)</th>
              <th>Transformation & Mutation</th>
              <th>SHA-256 Hash</th>
              <th>Schema Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSteps.map((step) => {
              const isSelected = selectedStep?.step_id === step.step_id;
              return (
                <tr 
                  key={step.step_id}
                  onClick={() => setSelectedStep(step)}
                  style={{ 
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent'
                  }}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    {step.step_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{step.agent_or_node}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Phase: {step.phase}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.entries(step.input_parameters).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>
                          <code>{k}</code>: <span style={{ color: 'var(--text-dim)' }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                        From: <em>{step.parameter_source}</em>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.entries(step.output_parameters).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#c4b5fd' }}>
                          <code>{k}</code>: <span style={{ color: 'var(--text-dim)' }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowRight size={12} color="#a855f7" />
                        <span>To: <em>{step.parameter_destination}</em></span>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 280, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                    {step.mutation_details}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', padding: '3px 6px', borderRadius: 4 }}>
                      <Hash size={12} color="#f59e0b" />
                      <span>{step.parameter_hash}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={12} />
                      <span>VALIDATED</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Step Expanded Inspector Card */}
      {selectedStep && (
        <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-indigo">{selectedStep.step_id} DEEP INSPECTION</span>
                <span className="badge badge-cyan">{selectedStep.phase}</span>
                <span className="badge badge-amber">RISK: {selectedStep.risk_tier}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 6, color: '#ffffff' }}>
                {selectedStep.agent_or_node}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SHA-256 SIGNATURE:</span>
              <code style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{selectedStep.parameter_hash}</code>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Input Contract */}
            <div className="glass-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: 8 }}>
                📥 Incoming Parameters & Origin
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Origin: <strong>{selectedStep.parameter_source}</strong>
              </p>
              <pre style={{ 
                background: 'rgba(0,0,0,0.4)', 
                padding: 12, 
                borderRadius: 8, 
                fontSize: '0.75rem', 
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto'
              }}>
                {JSON.stringify(selectedStep.input_parameters, null, 2)}
              </pre>
            </div>

            {/* Output Contract */}
            <div className="glass-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', marginBottom: 8 }}>
                📤 Outgoing Parameters & Destination
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Destination: <strong>{selectedStep.parameter_destination}</strong>
              </p>
              <pre style={{ 
                background: 'rgba(0,0,0,0.4)', 
                padding: 12, 
                borderRadius: 8, 
                fontSize: '0.75rem', 
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                overflowX: 'auto'
              }}>
                {JSON.stringify(selectedStep.output_parameters, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
