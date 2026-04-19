import React from 'react';

export function SparkLine({ data, dataKey, color = '#6366f1', height = 120, format, showArea = true }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest" style={{ height }}>
        データ収集中...
      </div>
    );
  }
  
  const values = data.map(d => d[dataKey] ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${w},${height}`;
  const latest = values[values.length - 1];
  const prev = values[values.length - 2] || latest;
  const diff = latest - prev;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {showArea && <polygon points={areaPoints} fill={`url(#grad-${dataKey})`} />}
        <polyline points={points} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        {values.length > 0 && (
          <circle cx={w} cy={height - ((latest - min) / range) * (height - 20) - 10} r="1.5" fill={color} />
        )}
      </svg>
      <div className="absolute top-1 right-2 text-right">
        <div className="text-xl font-black tracking-tighter" style={{ color }}>
          {format ? format(latest) : Math.floor(latest).toLocaleString()}
        </div>
        <div className={`text-[10px] font-black ${diff >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}
        </div>
      </div>
    </div>
  );
}
