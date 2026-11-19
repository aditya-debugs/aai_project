import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RotateCw, 
  Search, 
  BookOpen, 
  Download, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Scale
} from 'lucide-react';

export default function PublicDataTab() {
  const [catalog, setCatalog] = useState({});
  const [selectedFile, setSelectedFile] = useState('rbi_regulations');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public-data/browse');
      const data = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error('Failed to load public data:', err);
    } finally {
      setLoading(false);
    }
  };

  const files = [
    { key: 'rbi_regulations', name: 'RBI Banking & Digital Payment Circulars', icon: Scale, tag: 'REGULATION' },
    { key: 'tax_regimes', name: 'Indian Income Tax Regimes (FY 24-26)', icon: TrendingUp, tag: 'TAXATION' },
    { key: 'spending_benchmarks', name: 'Household Spending & Savings Benchmarks', icon: BookOpen, tag: 'BENCHMARKS' },
    { key: 'governance_policies', name: 'Autonomous FinTech AI Governance Standards', icon: ShieldCheck, tag: 'GOVERNANCE' },
  ];

  const currentData = catalog[selectedFile];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={22} color="#14b8a6" />
              <span>Public Data & Regulatory Standards Repository</span>
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Integrated public financial benchmarks, official Reserve Bank of India circulars, and tax regimes grounding the RAG and advisor agent.
            </p>
          </div>
          <button onClick={fetchPublicData} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Files</span>
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {files.map((f) => {
          const Icon = f.icon;
          const isSelected = selectedFile === f.key;
          return (
            <div
              key={f.key}
              onClick={() => setSelectedFile(f.key)}
              className="glass-card"
              style={{
                border: isSelected ? '1px solid #14b8a6' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 28, 44, 0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
              }}
            >
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                background: isSelected ? '#14b8a6' : 'rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Icon size={20} color={isSelected ? '#ffffff' : '#94a3b8'} />
              </div>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: 2 }}>
                  {f.tag}
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                  {f.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Content Viewer */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            File Contents: <code style={{ color: '#14b8a6' }}>{selectedFile}.json</code>
          </h3>
          <span className="badge badge-emerald">PUBLIC REPO</span>
        </div>

        {currentData ? (
          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            padding: 18,
            borderRadius: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#f8fafc',
            maxHeight: 520,
            overflowY: 'auto',
            lineHeight: 1.5,
          }}>
            {JSON.stringify(currentData, null, 2)}
          </pre>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading public data file...
          </div>
        )}
      </div>
    </div>
  );
}
