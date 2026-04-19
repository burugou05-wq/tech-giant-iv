import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '../../ui/index.js';

/**
 * 製品ライフサイクル管理
 */
export const ProductLifecycle = ({ blueprints, currentYear }) => {
  const oldestYear = blueprints.length > 0 
    ? Math.min(...blueprints.map(bp => bp.launchYear || currentYear))
    : currentYear;
  
  const age = currentYear - oldestYear;
  const isTooOld = age >= 4;

  return (
    <Card className="p-6">
      <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Clock size={16} className="text-amber-400" /> 製品寿命管理
      </h3>
      
      {blueprints.length > 0 ? (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">最古モデルの経過年数</div>
            <div className={`text-3xl font-black tracking-tighter ${isTooOld ? 'text-amber-500' : 'text-slate-200'}`}>
              {Math.max(0, age)} <span className="text-xs uppercase ml-1">年</span>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
            isTooOld 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 animate-pulse' 
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}>
            {isTooOld ? '更新を推奨' : '健全'}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-700 text-center">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">有効な設計図がありません</div>
        </div>
      )}
      
      <div className="mt-6 text-[9px] text-slate-500 leading-relaxed font-medium italic">
        "製品寿命が4年を超えると市場での魅力度が急激に低下します。Mk2モデルへの更新を検討してください。"
      </div>
    </Card>
  );
};
