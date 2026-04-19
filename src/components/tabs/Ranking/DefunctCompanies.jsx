import React from 'react';
import { Card } from '../../ui/index.js';

export const DefunctCompanies = ({ companies }) => {
  if (companies.length === 0) return null;
  
  return (
    <Card className="p-6 bg-slate-900/20">
      <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-4 h-[1px] bg-slate-700" /> 
        かつての巨人たち（市場から撤退）
        <span className="w-4 h-[1px] bg-slate-700" />
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {companies.map(([id, ai]) => (
          <div key={id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 group">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${ai.color} opacity-30 group-hover:opacity-60 transition-opacity`} />
              <span className="text-[11px] text-slate-600 font-bold line-through tracking-tight group-hover:text-slate-500 transition-colors">
                {ai.name}
              </span>
            </div>
            <div className="text-[8px] text-slate-700 font-black tracking-tighter uppercase pl-3">
              {ai.appearsYear} — {ai.disappearsYear}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
