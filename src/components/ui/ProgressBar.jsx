import React from 'react';

/**
 * 汎用進捗バー
 * @param {Object} props
 * @param {number} props.value - 0から100の数値
 * @param {string} [props.color] - バーの色（Tailwind背景色クラス）
 * @param {string} [props.label] - 左側に表示するテキスト
 * @param {string|number} [props.rightLabel] - 右側に表示するテキスト
 * @param {boolean} [props.showValue] - バーの上に数値を出すか
 * @param {string} [props.size] - 'sm', 'md', 'lg'
 * @param {string} [props.className]
 */
export const ProgressBar = ({ 
  value, 
  color = 'bg-indigo-500', 
  label, 
  rightLabel, 
  showValue = false, 
  size = 'md',
  className = ''
}) => {
  const height = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5'
  }[size];

  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || rightLabel) && (
        <div className="flex justify-between items-end mb-1.5 px-0.5">
          {label && <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{label}</span>}
          {rightLabel && <span className="text-xs font-black text-white">{rightLabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/30 p-0.5 shadow-inner ${height}`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color} ${percentage > 0 ? 'shadow-[0_0_8px_rgba(255,255,255,0.1)]' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
