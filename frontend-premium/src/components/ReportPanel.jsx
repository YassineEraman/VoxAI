import React from 'react';

export default function ReportPanel({ title, data, color }) {
  const entries = Object.entries(data || {});
  const max = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1;

  return (
    <div className="card">
      <div className="section-header"><span className="section-title">{title}</span></div>
      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pas assez de données</p>
      ) : (
        <div className="report-list">
          {entries.map(([name, count]) => (
            <div className="report-item" key={name}>
              <span style={{ minWidth: '120px' }}>{name}</span>
              <div className="report-bar">
                <div className="report-bar-fill" style={{ width: `${(count / max) * 100}%`, background: color || 'var(--accent-blue)' }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: '24px', textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
