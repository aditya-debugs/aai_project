import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RotateCw, 
  Cpu, 
  FileText, 
  CheckCircle, 
  ExternalLink,
  BookOpen,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function MultiRAGTab() {
  const [engines, setEngines] = useState([]);
  const [query, setQuery] = useState('What is my liability if someone makes an unauthorized UPI transfer from my account?');
  const [selectedRag, setSelectedRag] = useState('auto');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEngines();
  }, []);

  const fetchEngines = async () => {
    try {
      const res = await fetch('/api/rag/engines');
      const data = await res.json();
      setEngines(data.engines || []);
    } catch (err) {
      console.error('Failed to load RAG engines:', err);
    }
  };

  const handleQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          rag_name: selectedRag,
          top_k: 4,
        }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err) {
      alert('Error querying RAG: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    {
      title: 'RBI Fraud Liability',
      text: 'What is my liability if someone makes an unauthorized UPI transfer from my account?',
      rag: 'rbi_regulations_rag',
    },
    {
      title: 'Tax Regime Comparison',
      text: 'Which income tax regime saves more money for a ₹15,00,000 annual salary?',
      rag: 'tax_regimes_rag',
    },
    {
      title: 'Household Benchmarks',
      text: 'What are the typical household spending percentages for a ₹75,000 monthly income?',
      rag: 'market_benchmarks_rag',
    },
    {
      title: 'Emergency Cushion Rule',
      text: 'How many months of essential expenses should I save in an emergency fund?',
      rag: 'personal_finance_rag',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Database size={22} color="#8b5cf6" />
          <span>Dynamic Multi-RAG Router & Knowledge Ecosystem</span>
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Choose from 4 specialized knowledge bases dynamically based on input intent or manual selection. Grounded in official RBI guidelines, income tax slabs, and national spending benchmarks.
        </p>
      </div>

      {/* Catalog of the 4 RAG Engines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {engines.map((eng) => (
          <div 
            key={eng.name}
            className="glass-card" 
            style={{ 
              borderLeft: `4px solid ${eng.color}`,
              background: selectedRag === eng.name ? 'rgba(139, 92, 246, 0.15)' : 'rgba(20, 28, 44, 0.6)',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedRag(eng.name)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="badge" style={{ background: `${eng.color}22`, color: eng.color, border: `1px solid ${eng.color}44` }}>
                {eng.category}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {eng.document_count} facts
              </span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              {eng.display_name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {eng.description}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Query Sandbox */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={18} color="#06b6d4" />
            <span>Interactive Multi-RAG Query Sandbox</span>
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RAG ENGINE:</span>
            <select
              value={selectedRag}
              onChange={(e) => setSelectedRag(e.target.value)}
              className="select-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <option value="auto">✨ Auto (Dynamic Intent Router)</option>
              <option value="personal_finance_rag">Personal Finance RAG</option>
              <option value="rbi_regulations_rag">RBI Regulations RAG</option>
              <option value="tax_regimes_rag">Income Tax Regimes RAG</option>
              <option value="market_benchmarks_rag">Market Benchmarks RAG</option>
            </select>
          </div>
        </div>

        {/* Quick Sample Queries */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(sample.text); setSelectedRag(sample.rag); }}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              <Zap size={12} color="#f59e0b" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any financial, regulatory, tax, or benchmark question..."
            className="input-control"
            style={{ fontSize: '0.875rem' }}
          />
          <button 
            onClick={handleQuery} 
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '10px 22px', whiteSpace: 'nowrap' }}
          >
            {loading ? <RotateCw size={16} className="spin" /> : <Search size={16} />}
            <span>Retrieve Facts</span>
          </button>
        </div>

        {/* Results Display */}
        {queryResult && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Intent Router Feedback */}
            <div className="glass-card" style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span className="badge badge-purple">DYNAMIC INTENT CLASSIFIER</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                    Routed to: <span style={{ color: '#c4b5fd' }}>{queryResult.chosen_rag_name}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {queryResult.routing_reason}
                  </p>
                </div>

                {/* Confidence Scores Meter */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {Object.entries(queryResult.confidence_scores || {}).map(([ragKey, score]) => (
                    <div key={ragKey} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        {ragKey.replace('_rag', '')}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: score > 0.5 ? '#38bdf8' : 'var(--text-muted)' }}>
                        {(score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Retrieved Facts Cards */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                Retrieved Grounded Facts ({queryResult.total_facts})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {queryResult.facts.map((fact, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                        {fact.title}
                      </h5>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                        Score: {fact.relevance_score}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {fact.content}
                    </p>
                    {fact.metadata && Object.keys(fact.metadata).length > 0 && (
                      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        Metadata: {JSON.stringify(fact.metadata)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
