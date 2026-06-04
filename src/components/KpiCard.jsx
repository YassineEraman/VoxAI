import React from 'react';
import { MessageCircle, Star, TrendingUp, Globe } from 'lucide-react';

const ICONS = {
  messages: MessageCircle,
  star: Star,
  trending: TrendingUp,
  globe: Globe,
};

export default function KpiCard({ icon, color, label, value }) {
  const Icon = ICONS[icon] || MessageCircle;
  return (
    <div className="card kpi">
      <div className={`kpi-icon ${color}`}><Icon size={22} /></div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}
