import React from 'react';

export function BarChart({ data, keys, colors, height = 140, labels }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest" style={{ height }}>
        データ収集中...
      </div>
    );
  }
  
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => Math.abs(d[k] ?? 0))), 1);
  const barW = 90 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {data.map((d, i) => {
          let yOffset = 0;
          return keys.map((k, ki) => {
            const val = Math.abs(d[k] ?? 0);
            const h = (val / maxVal) * (height - 20);
            const y = height - h - yOffset;
            yOffset += h;
            return (
              <rect 
                key={`${i}-${ki}`} 
                x={5 + i * (barW + 0.5)} 
                y={y} 
                width={barW} 
                height={h}
                fill={colors[ki]} 
                rx="0.5" 
                opacity="0.85" 
              />
            );
          });
        })}
      </svg>
      <div className="flex gap-4 mt-4">
        {keys.map((k, i) => (
          <div key={k} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: colors[i] }} />
            {labels?.[i] || k}
          </div>
        ))}
      </div>
    </div>
  );
}
