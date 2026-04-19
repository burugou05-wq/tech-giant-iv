import React from 'react';
import { Film } from 'lucide-react';
import { Card } from '../../ui/index.js';

/**
 * エンタメ投資コンポーネント
 */
export const ContentInvestment = ({ investments, ownedIds, money, onInvest }) => {
  return (
    <Card className="p-6">
      <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Film size={16} className="text-purple-400" /> Entertainment IP
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {investments.map(inv => {
          const isOwned = ownedIds.includes(inv.id);
          const canAfford = money >= inv.cost;
          
          return (
            <button
              key={inv.id}
              disabled={isOwned || !canAfford}
              onClick={() => onInvest(inv)}
              className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                isOwned 
                  ? 'border-purple-500/50 bg-purple-900/10 shadow-[0_0_10px_rgba(168,85,247,0.05)]' 
                  : 'border-slate-700/50 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-800'
              }`}
            >
              <div className={`font-black text-[10px] uppercase leading-tight ${isOwned ? 'text-purple-300' : 'text-slate-300'}`}>
                {inv.name}
              </div>
              {!isOwned && (
                <div className="text-[9px] font-bold text-slate-500 mt-1.5 flex justify-between items-center">
                  <span>COST</span>
                  <span className={canAfford ? 'text-slate-400' : 'text-red-500'}>${inv.cost.toLocaleString()}k</span>
                </div>
              )}
              {isOwned && (
                <div className="text-[8px] font-black text-purple-500/70 mt-1 tracking-widest uppercase">Acquired</div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
