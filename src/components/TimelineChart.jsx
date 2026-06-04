import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,15,26,0.92)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div>Score : <strong style={{ color: '#60a5fa' }}>{payload[0]?.value}</strong></div>
      {payload[1] && <div>Avis : <strong>{payload[1]?.value}</strong></div>}
    </div>
  );
};

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Pas assez de données temporelles</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis domain={[1, 5]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="avg_score" stroke="#3b82f6" strokeWidth={2} fill="url(#scoreGradient)" dot={{ r: 3, fill: '#3b82f6' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
