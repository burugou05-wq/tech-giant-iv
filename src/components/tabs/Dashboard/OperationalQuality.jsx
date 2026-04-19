import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../../ui/index.js';

/**
 * 品質管理コンポーネント
 */
export const OperationalQuality = ({ qualityLevel, qualityCap, onQualityChange }) => {
  const isDangerous = qualityLevel < 60;
  
  return (
    <Card className="p-6">
      <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
        <ShieldCheck size={16} className={isDangerous ? 'text-red-500' : 'text-emerald-500'} /> 
        Quality Assurance
      </h3>
      
      <div className="flex items-center gap-8">
        <div className={`text-5xl font-black w-24 tracking-tighter ${isDangerous ? 'text-red-500' : 'text-emerald-500'}`}>
          {Math.min(qualityLevel, qualityCap)}%
        </div>
        
        <div className="flex-1">
          <input
            type="range" 
            min="30" 
            max="100" 
            value={qualityLevel}
            onChange={e => onQualityChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-3 font-black uppercase tracking-wider px-1">
            <span className="text-red-400">Low Cost</span>
            <span>Standard</span>
            <span className="text-blue-400">Reliable</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
