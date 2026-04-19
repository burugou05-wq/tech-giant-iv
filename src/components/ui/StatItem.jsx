import React from 'react';

/**
 * 統計情報を表示するためのパーツ
 * @param {Object} props
 * @param {string} props.label - ラベル（例：推定売上）
 * @param {string|number} props.value - 数値
 * @param {React.ReactNode} [props.icon] - Lucideアイコンなど
 * @param {string} [props.subValue] - 小さな補足値（例：+15%）
 * @param {string} [props.trendColor] - subValueの色（text-emerald-400など）
 * @param {string} [props.className]
 */
export const StatItem = ({ 
  label, 
  value, 
  icon, 
  subValue, 
  trendColor = 'text-white', 
  className = '' 
}) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
        {icon && <span className="opacity-80">{icon}</span>}
        {label}
      </div>
      <div className="flex items-end gap-2">
        <div className={`text-2xl font-black leading-none tracking-tight ${trendColor}`}>
          {value}
        </div>
        {subValue && (
          <div className={`text-[10px] font-bold mb-0.5 ${trendColor}`}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
