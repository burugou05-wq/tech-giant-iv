import React from 'react';
import { Scale } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../ui/index.js';

/**
 * 緊急決議コンポーネント
 */
export const UrgentDecisions = ({ decisions, game, leadershipPower, money, onExecute }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <h3 className="font-black text-slate-200 flex items-center gap-2 text-lg">
          <Scale size={20} className="text-indigo-400" /> Executive Decisions
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase">Priority Tasks</span>
      </CardHeader>
      
      <CardContent className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
        {decisions.map(dec => {
          const isVisible = !dec.req || dec.req(game);
          if (!isVisible) return null;
          
          const canAfford = leadershipPower >= dec.lpCost && money >= dec.moneyCost;
          
          return (
            <button
              key={dec.id}
              onClick={() => onExecute(dec)}
              disabled={!canAfford}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                canAfford 
                  ? 'bg-slate-900/40 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800' 
                  : 'bg-slate-900/20 border-slate-800/50 opacity-40 grayscale cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="font-black text-white text-xs uppercase tracking-tight group-hover:text-indigo-300 transition-colors">
                  {dec.name}
                </div>
                <div className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  LP {dec.lpCost}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed mb-3">
                {dec.desc}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                <span className="text-[9px] font-bold text-slate-600 uppercase">Required Funds</span>
                <span className={`text-[10px] font-black ${money >= dec.moneyCost ? 'text-slate-400' : 'text-red-500'}`}>
                  ${dec.moneyCost.toLocaleString()}k
                </span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
