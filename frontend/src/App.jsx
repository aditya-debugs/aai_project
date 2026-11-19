import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FinancialDashboardTab from './components/FinancialDashboardTab';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import ParameterFlowTab from './components/ParameterFlowTab';
import GuardrailsHarnessTab from './components/GuardrailsHarnessTab';
import GovernanceEMGTab from './components/GovernanceEMGTab';
import MultiRAGTab from './components/MultiRAGTab';
import MultiMCPTab from './components/MultiMCPTab';
import PublicDataTab from './components/PublicDataTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [maxRisk, setMaxRisk] = useState('MEDIUM');
  const [circuitBreaker, setCircuitBreaker] = useState({ tripped: false, reason: '' });
  const [pipelineResult, setPipelineResult] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  useEffect(() => {
    fetchCircuitBreakerStatus();
    runInitialPipeline();
  }, []);

  const fetchCircuitBreakerStatus = async () => {
    try {
      const res = await fetch('/api/governance/circuit-breaker/status');
      const data = await res.json();
      setCircuitBreaker({ tripped: data.tripped, reason: data.reason });
    } catch (err) {
      console.warn('Circuit breaker status fetch:', err);
    }
  };

  const runInitialPipeline = async () => {
    handleRunWorkflow({
      source: 'sample',
      opening_balance: 100000,
      monthly_income: 50000,
      preferred_rag: 'auto',
      risk_level: 'MEDIUM',
    });
  };

  const handleRunWorkflow = async (payload) => {
    setPipelineLoading(true);
    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Workflow error: ' + (data.detail || 'Execution failed'));
      } else {
        setPipelineResult(data);
      }
    } catch (err) {
      alert('Pipeline execution failed: ' + err.message);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleToggleCircuitBreaker = async (trip, reason = 'Administrator toggle') => {
    try {
      const res = await fetch('/api/governance/circuit-breaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip, reason }),
      });
      const data = await res.json();
      setCircuitBreaker({ tripped: data.circuit_breaker_tripped, reason: data.reason });
    } catch (err) {
      alert('Failed to toggle circuit breaker: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Brand & Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        circuitBreaker={circuitBreaker}
        onToggleCircuitBreaker={handleToggleCircuitBreaker}
        maxRisk={maxRisk}
        setMaxRisk={setMaxRisk}
      />

      {/* Main Tab View Canvas */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px 40px', width: '100%', flex: 1 }}>
        {activeTab === 'overview' && (
          <FinancialDashboardTab
            onRunWorkflow={handleRunWorkflow}
            pipelineResult={pipelineResult}
            loading={pipelineLoading}
            maxRisk={maxRisk}
          />
        )}

        {activeTab === 'diagram' && (
          <ArchitectureDiagram onSelectTab={setActiveTab} />
        )}

        {activeTab === 'lineage' && (
          <ParameterFlowTab />
        )}

        {activeTab === 'guardrails' && (
          <GuardrailsHarnessTab />
        )}

        {activeTab === 'governance' && (
          <GovernanceEMGTab
            circuitBreaker={circuitBreaker}
            onToggleCircuitBreaker={handleToggleCircuitBreaker}
          />
        )}

        {activeTab === 'multirag' && (
          <MultiRAGTab />
        )}

        {activeTab === 'multimcp' && (
          <MultiMCPTab maxRisk={maxRisk} />
        )}

        {activeTab === 'publicdata' && (
          <PublicDataTab />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        maxWidth: 1440, 
        margin: '0 auto', 
        padding: '20px 24px', 
        width: '100%', 
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: '0.78rem',
        color: 'var(--text-dim)'
      }}>
        <div>
          FinPilot Autonomous AI Agent Platform · Event Monitoring & Governance (EMG) Sentinel
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>ISO/IEC 42001 Standard</span>
          <span>RBI Master Directions</span>
          <span>FastMCP stdio Architecture</span>
        </div>
      </footer>
    </div>
  );
}
