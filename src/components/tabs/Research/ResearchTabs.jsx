import React from 'react';
import { FlaskConical } from 'lucide-react';
import { Card } from '../../ui/index.js';

export const ResearchTabs = ({ activeTab, onTabChange, researchPoints }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md">
      <div className="flex gap-2">
        <button
          onClick={() => onTabChange('chassis')}
          className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all tracking-widest uppercase ${
            activeTab === 'chassis' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
          }`}
        >
          シャーシ
        </button>
        <button
          onClick={() => onTabChange('components')}
          className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all tracking-widest uppercase ${
            activeTab === 'components' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105' 
              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
          }`}
        >
          部品ユニット
        </button>
      </div>

      <div className="flex items-center gap-4 bg-slate-950 px-6 py-2.5 rounded-xl border border-slate-800 shadow-inner">
        <div className="p-1.5 bg-blue-500/10 rounded-lg">
          <FlaskConical size={18} className="text-blue-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Research Points</span>
          <span className="text-xl font-black text-blue-400 leading-none">
            {Math.floor(researchPoints)}<span className="text-xs ml-1 opacity-50">RP</span>
          </span>
        </div>
      </div>
    </div>
  );
};
