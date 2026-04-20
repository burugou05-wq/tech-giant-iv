import React from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../ui/index.js';
import { CHASSIS_TECH, COMPONENT_TECH } from '../../../constants/index.js';

export const DesignStudio = ({ 
  designName, setDesignName,
  selectedChassisId, setSelectedChassisId,
  designSlots, setDesignSlots,
  designPrice, setDesignPrice,
  designStrategy, setDesignStrategy,
  unlockedChassis, unlockedModules,
  specs, canSave, onSave
}) => {
  const chassis = CHASSIS_TECH.find(c => c.id === selectedChassisId) || CHASSIS_TECH[0];
  const allTech = COMPONENT_TECH;
  const allUnlocked = unlockedModules;

  return (
    <Card className="p-8 bg-slate-800 border-slate-700 shadow-2xl">
      <CardHeader>
        <h3 className="text-2xl font-black text-yellow-400 flex items-center gap-3">
          <Wrench size={28} /> 設計スタジオ
        </h3>
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">新規製品プロトタイプ</span>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* モデル名入力 */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-black uppercase px-1">モデル名</label>
          <input
            type="text" value={designName}
            onChange={e => setDesignName(e.target.value)}
            placeholder="製品名を入力 (例: TECH-G1)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-black placeholder:text-slate-800 focus:ring-2 focus:ring-yellow-500 transition-all"
          />
        </div>

        {/* シャーシ選択 */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-black uppercase px-1">プラットフォーム / シャーシ</label>
          <select
            value={selectedChassisId}
            onChange={e => { setSelectedChassisId(e.target.value); setDesignSlots({}); }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {CHASSIS_TECH.filter(c => unlockedChassis.includes(c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.name} (基礎魅力:{c.baseAppeal})</option>
            ))}
          </select>
        </div>

        {/* 部品スロット */}
        <div className="space-y-3 pt-2">
          <label className="text-[10px] text-slate-500 font-black uppercase px-1">コンポーネントスロット</label>
          {chassis.slots.map(slotType => (
            <select
              key={slotType} value={designSlots[slotType] || ''}
              onChange={e => setDesignSlots(p => ({ ...p, [slotType]: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-bold text-xs hover:border-slate-600 transition-all"
            >
              <option value="">【{slotType}】部品を選択...</option>
              {allTech.filter(m => m.type === slotType && allUnlocked.includes(m.id)).map(m => (
                <option key={m.id} value={m.id}>{m.name} (+{m.appeal} 魅力 / +${m.costVal} 原価)</option>
              ))}
            </select>
          ))}
        </div>

        {/* 価格設定 */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <div className="flex justify-between items-end">
            <label className="text-[10px] text-slate-500 font-black uppercase px-1">希望販売価格</label>
            <div className="text-xs font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
              原価: ${specs.cost}k
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <input
              type="range"
              min={Math.floor(specs.cost * 0.5)}
              max={Math.floor(specs.cost * 10)}
              step={1}
              value={designPrice}
              onChange={e => setDesignPrice(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">$</span>
              <input
                type="number"
                value={designPrice}
                onChange={e => setDesignPrice(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-white font-black text-right focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase">想定利益率</span>
            <span className={`text-xs font-black ${
              designPrice > specs.cost * 2 ? 'text-emerald-400' : 
              designPrice > specs.cost ? 'text-yellow-400' : 'text-rose-500'
            }`}>
              {(((designPrice - specs.cost) / Math.max(1, designPrice)) * 100).toFixed(1)}%
            </span>
          </div>

          {/* 相場ガイド */}
          {specs.recommendation && (
            <div className="mt-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">市場相場</div>
                <div className="text-xs font-black text-slate-300">${specs.recommendation.avg}k</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mb-1">おすすめ</div>
                <button 
                  onClick={() => setDesignPrice(specs.recommendation.price)}
                  className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 rounded-lg text-indigo-300 text-[10px] font-black transition-all"
                >
                  ${specs.recommendation.price}k を適用
                </button>
              </div>
            </div>
          )}
        </div>

        {/* マーケット戦略選択 */}
        <div className="space-y-3 pt-4 border-t border-slate-700/50">
          <label className="text-[10px] text-slate-500 font-black uppercase px-1 tracking-widest flex justify-between">
            マーケット戦略 <span>Select Strategy</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'high-end', name: 'HIGH-END', color: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400', desc: '魅力 1.3倍 / 高価格必須' },
              { id: 'mainstream', name: 'MAINSTREAM', color: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', desc: 'シェア連動バフ / 定番' },
              { id: 'budget', name: 'BUDGET', color: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-400', desc: 'ブランド無視 / 魅力減' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setDesignStrategy(s.id)}
                className={`p-2 rounded-xl border text-center transition-all group ${
                  designStrategy === s.id ? `${s.bg} ${s.color} ring-1 ring-white/20` : 'bg-slate-950 border-slate-800 opacity-40 grayscale hover:opacity-70'
                }`}
              >
                <div className={`text-[10px] font-black ${s.text} group-hover:scale-105 transition-transform`}>{s.name}</div>
                <div className="text-[7px] font-bold text-slate-500 leading-tight mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* プレビュー数値 */}
        {canSave && (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-black uppercase">想定魅力度</span>
              <span className="text-lg font-black text-yellow-400">{specs.appeal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-black uppercase">製造原価</span>
              <span className="text-lg font-black text-red-400">${specs.cost.toLocaleString()}k</span>
            </div>
            
            <div className="pt-2 space-y-1">
              {specs.isSiloActive && chassis.category === 'smart_device' && (
                <div className="text-[9px] text-red-500 font-black bg-red-500/10 p-1.5 rounded border border-red-500/20 animate-pulse">
                  ⚠ サイロ化ペナルティ：開発コスト 1.5倍
                </div>
              )}
              {specs.moralePenalty && (
                <div className="text-[9px] text-red-400 font-black">⚠ 事業部士気低下によるコスト増</div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onSave}
          disabled={!canSave}
          className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-20 disabled:grayscale rounded-2xl font-black text-white shadow-xl shadow-yellow-600/10 transition-all hover:scale-[1.02] active:scale-95"
        >
          プロトタイプを保存
        </button>
      </CardContent>
    </Card>
  );
};
