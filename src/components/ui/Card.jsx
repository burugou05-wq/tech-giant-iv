import React from 'react';

/**
 * 汎用的なカードコンポーネント
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.hover] - ホバー時に光るエフェクトを付けるか
 * @param {boolean} [props.glass] - 強めのガラス質感にするか
 */
export const Card = ({ children, className = '', hover = false, glass = false }) => {
  const baseStyle = "bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300";
  const hoverStyle = hover ? "hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10" : "";
  const glassStyle = glass ? "backdrop-blur-md" : "";

  return (
    <div className={`${baseStyle} ${hoverStyle} ${glassStyle} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
