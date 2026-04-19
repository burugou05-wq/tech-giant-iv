import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

export const TechNode = ({ 
  tech, 
  isUnlocked, 
  canAfford, 
  reqMet, 
  requirementNames, 
  onUnlock 
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all duration-300 relative group ${
        isUnlocked   
          ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
          : !reqMet    
            ? 'border-slate-800 opacity-40 grayscale'
            : canAfford  
              ? 'border-blue-500/50 bg-slate-800 hover:border-blue-400 hover:bg-slate-700 shadow-xl'
              : 'border-slate-700 bg-slate-800/80 opacity-80'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`font-black text-sm tracking-tight ${isUnlocked ? 'text-emerald-400' : 'text-white'}`}>
          {tech.name}
        </div>
        {isUnlocked ? (
          <CheckCircle size={16} className="text-emerald-400" />
        ) : !reqMet ? (
          <Lock size={14} className="text-slate-600" />
        ) : null}
      </div>

      {tech.req && tech.req.length > 0 && (
        <div className="mb-4">
          <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Required</div>
          <div className="text-[9px] text-slate-400 font-bold leading-tight">
            {requirementNames.join(', ')}
          </div>
        </div>
      )}

      {!isUnlocked && (
        <button
          onClick={onUnlock}
          disabled={!canAfford || !reqMet}
          className={`w-full py-2.5 rounded-xl mt-2 font-black text-[10px] uppercase tracking-widest transition-all ${
            !reqMet 
              ? 'bg-slate-900 text-slate-700 cursor-not-allowed'
              : canAfford
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          {tech.cost === 0 ? '開発可能' : `${tech.cost} RP`}
        </button>
      )}
      
      {isUnlocked && (
        <div className="text-center py-2 text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">
          Developed
        </div>
      )}
    </div>
  );
};
