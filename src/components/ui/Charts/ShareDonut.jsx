import React from 'react';

const COLORS = {
  player: '#22c55e', mony: '#6366f1', natio: '#f97316', philis: '#06b6d4',
  samstar: '#2563eb', hitac: '#e11d48', motora: '#ef4444', genera: '#94a3b8',
  pineapple: '#d4d4d8', microhard: '#10b981', googo: '#f59e0b', nokio: '#38bdf8',
  commodo: '#78716c', ninten: '#d946ef', berry: '#7c3aed', siemen: '#14b8a6',
};

export function ShareDonut({ shares, size = 120 }) {
  const entries = Object.entries(shares).filter(([, v]) => v > 0.001);
  const r = 40, cx = 50, cy = 50;
  let cumAngle = -Math.PI / 2;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {entries.map(([key, value]) => {
          const angle = value * Math.PI * 2;
          const x1 = cx + r * Math.cos(cumAngle);
          const y1 = cy + r * Math.sin(cumAngle);
          cumAngle += angle;
          const x2 = cx + r * Math.cos(cumAngle);
          const y2 = cy + r * Math.sin(cumAngle);
          const large = angle > Math.PI ? 1 : 0;
          return (
            <path key={key}
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
              fill={COLORS[key] || '#475569'} 
              stroke="#0f172a" 
              strokeWidth="0.8"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        <circle cx={cx} cy={cy} r="25" fill="#0f172a" />
      </svg>
    </div>
  );
}
