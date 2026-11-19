import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Database, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  X,
  FileCode,
  Zap,
  Activity
} from 'lucide-react';

export default function ArchitectureDiagram({ onSelectTab }) {
  const [selectedNode, setSelectedNode] = useState('node_multi_rag');
  const [diagramData, setDiagramData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiagram();
  }, []);

  const fetchDiagram = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagram');
      const data = await res.json();
      setDiagramData(data);
    } catch (err) {
      console.error('Failed to fetch diagram:', err);
    } finally {
      setLoading(false);
    }
  };

  const contracts = diagramData?.contracts || {};
  const currentContract = contracts[selectedNode] || {
    name: 'Dynamic Multi-RAG Router',
    role: 'Semantic intent classification and knowledge retrieval across 4 specialized KBs',
    inputs: ['User financial snapshot / query', "Preferred RAG engine ('auto' or specific)"],
    outputs: ['Retrieved facts with citations', 'Confidence scores per engine', 'Chosen RAG metadata'],
    transformations: 'Intent keyword scoring and token overlap ranking',
    validation: 'Facts exist in selected knowledge base (no hallucinations)',
    risk: 'LOW',
  };

  const nodes = [
    { id: 'node_input', title: '1. User Statement', desc: 'Raw CSV/JSON/PDF upload', icon: '📥', color: '#06b6d4', group: 'input' },
    { id: 'node_guardrails', title: '2. Guardrails Harness', desc: 'PII Masking & Threat Defense', icon: '🛡️', color: '#10b981', group: 'security' },
    { id: 'node_orchestrator', title: '3. Master Orchestrator', desc: 'Planner & Dependency Dispatcher', icon: '🧠', color: '#6366f1', group: 'core' },
    { id: 'node_agents', title: '4. 11-Agent Pipeline', desc: 'Deterministic financial analysis', icon: '⚡', color: '#3b82f6', group: 'agents' },
    { id: 'node_multi_rag', title: '5. Multi-RAG Router (4 KBs)', desc: 'Personal, RBI, Tax & Benchmarks', icon: '📚', color: '#8b5cf6', group: 'rag' },
    { id: 'node_multi_mcp', title: '6. Multi-MCP Bus (3 Servers)', desc: 'Analysis, Public Data, Security', icon: '🔌', color: '#ec4899', group: 'mcp' },
    { id: 'node_governance', title: '7. Governance Sentinel', desc: 'EMG Logging & Killswitch', icon: '🚨', color: '#ef4444', group: 'governance' },
    { id: 'node_reviewer', title: '8. Reviewer Guardrail', desc: 'Anti-hallucination verification', icon: '⚖️', color: '#f59e0b', group: 'review' },
    { id: 'node_output', title: '9. React Client UI', desc: 'Glassmorphism dashboard & trace', icon: '💻', color: '#14b8a6', group: 'output' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={22} color="#8b5cf6" />
              <span>Multi-Agent System Architecture & Data Contracts</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Interactive topology showing <strong>Multiple MCP Servers</strong>, <strong>Multiple RAG Engines</strong>, <strong>Guardrails Harness</strong>, and <strong>Governance EMG Sentinel</strong>. Click any node to inspect data contracts ("What parameters go where").
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-purple">4 RAG Engines</span>
            <span className="badge badge-pink">3 MCP Servers</span>
            <span className="badge badge-emerald">Guardrails Harness</span>
            <span className="badge badge-red">EMG Sentinel</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Diagram & Contract Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 24 }}>
        {/* Left: Visual Architecture Diagram Canvas */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Data-Flow Pipeline
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' 
                      : 'rgba(15, 23, 42, 0.5)',
                    border: isSelected ? `2px solid ${node.color}` : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? `0 0 20px ${node.color}33` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>{node.icon}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      background: `${node.color}22`, 
                      color: node.color,
                      fontWeight: 700 
                    }}>
                      {node.group.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {node.desc}
                  </div>

                  {isSelected && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      height: 3, 
                      background: node.color 
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Special Visual Callouts for Multiple RAG and Multiple MCP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8 }}>
            {/* Multiple RAG Callout Box */}
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.08)', 
              border: '1px solid rgba(139, 92, 246, 0.25)', 
              borderRadius: 12, 
              padding: 16 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Database size={16} color="#a78bfa" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd' }}>Multiple RAG Knowledge Bases</span>
              </div>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16 }}>
                <li><code>personal_finance_rag</code>: 50/30/20, emergency cushion</li>
                <li><code>rbi_regulations_rag</code>: Zero liability, UPI fraud limits</li>
                <li><code>tax_regimes_rag</code>: Old vs New regime slabs, 80C/80D</li>
                <li><code>market_benchmarks_rag</code>: Income tier spending ratios</li>
              </ul>
            </div>

            {/* Multiple MCP Callout Box */}
            <div style={{ 
              background: 'rgba(236, 72, 153, 0.08)', 
              border: '1px solid rgba(236, 72, 153, 0.25)', 
              borderRadius: 12, 
              padding: 16 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Terminal size={16} color="#f472b6" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbcfe8' }}>Multiple FastMCP Servers</span>
              </div>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16 }}>
                <li><code>finpilot_analysis_server</code>: Health, forecast, anomalies</li>
                <li><code>financial_public_data_server</code>: RBI search, Tax calc</li>
                <li><code>security_audit_server</code>: PII scanning, SHA-256 hash</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Parameter Contract Details Drawer */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: 4 }}>PARAMETER CONTRACT DETAILS</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {currentContract.name}
              </h3>
            </div>
            <span className="badge badge-emerald">VALIDATED</span>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <strong>Node Function:</strong> {currentContract.role}
          </div>

          {/* What parameters go into this node */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowRight size={14} />
              <span>Input Parameters (What enters here)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentContract.inputs.map((inp, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(6, 182, 212, 0.08)', 
                  border: '1px solid rgba(6, 182, 212, 0.2)', 
                  borderRadius: 6, 
                  padding: '6px 10px', 
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#e2e8f0'
                }}>
                  {inp}
                </div>
              ))}
            </div>
          </div>

          {/* What parameters leave this node */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowRight size={14} />
              <span>Output Parameters (What goes where next)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentContract.outputs.map((out, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(139, 92, 246, 0.08)', 
                  border: '1px solid rgba(139, 92, 246, 0.2)', 
                  borderRadius: 6, 
                  padding: '6px 10px', 
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#e2e8f0'
                }}>
                  {out}
                </div>
              ))}
            </div>
          </div>

          {/* Transformations & Schema Validation */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRANSFORMATION RULE:</span>
              <p style={{ fontSize: '0.8rem', color: '#f1f5f9', marginTop: 2 }}>{currentContract.transformations}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SCHEMA ENFORCEMENT:</span>
              <p style={{ fontSize: '0.8rem', color: '#34d399', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>{currentContract.validation}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
