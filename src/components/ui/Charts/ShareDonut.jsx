import React from 'react';

const COLORS = {
  player: '#22c55e', toshiba: '#b91c1c', panasonic: '#1e3a8a', philips: '#06b6d4',
  samsung: '#2563eb', hitachi: '#e11d48', motorola: '#ef4444', ge: '#94a3b8',
  apple: '#71717a', microsoft: '#10b981', google: '#f59e0b', nokia: '#38bdf8',
  nintendo: '#d946ef', blackberry: '#5b21b6', siemens: '#14b8a6',
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
