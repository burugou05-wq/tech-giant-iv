import { Wrench, X } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH } from '../../constants/index.js';

export default function Design() {
  const {
    unlockedChassis, unlockedModules,
    designName, setDesignName,
    selectedChassisId, setSelectedChassisId,
    designSlots, setDesignSlots,
    blueprints, setBlueprints,
    productionLines,
    money,
    currentYear,
    refreshBlueprint,
    divisions, currentEffects
  } = useGame();

  const chassis = CHASSIS_TECH.find(c => c.id === selectedChassisId) || CHASSIS_TECH[0];
  const allTech = [...COMPONENT_TECH];
  const allUnlocked = [...unlockedModules];

  const chassisDiv = divisions[chassis.category];
  const isSiloActive = currentYear >= 2000 && !currentEffects?.siloFix;
  const moralePenalty = chassisDiv?.morale < 60 ? 1 + (60 - chassisDiv.morale) * 0.02 : 1;
  const siloPenalty = (isSiloActive && chassis.category === 'smart_device') ? 1.5 : 1;
  const totalCostMulti = (1 - (chassisDiv?.level || 1) * 0.01) * moralePenalty * siloPenalty;

  const previewAppeal = (() => {
    let app = chassis.baseAppeal;
    chassis.slots.forEach(s => {
      const m = allTech.find(x => x.id === designSlots[s]);
      if (m) app += m.appeal;
    });
    return Math.round(app * (1 + (chassisDiv?.level || 1) * 0.02));
  })();

  const previewCost = (() => {
    let cost = chassis.baseCost;
    chassis.slots.forEach(s => {
      const m = allTech.find(x => x.id === designSlots[s]);
      if (m) cost += m.costVal;
    });
    return Math.round(cost * totalCostMulti);
  })();

  const canSave = designName && chassis.slots.every(s => designSlots[s]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 設計スタジオ */}
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
        <h3 className="text-2xl font-black text-yellow-400 flex items-center gap-2">
          <Wrench size={24} /> 設計スタジオ
        </h3>
        <div className="space-y-4">
          <input
            type="text" value={designName}
            onChange={e => setDesignName(e.target.value)}
            placeholder="製品名を入力"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold"
          />
          <select
            value={selectedChassisId}
            onChange={e => { setSelectedChassisId(e.target.value); setDesignSlots({}); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold"
          >
            {CHASSIS_TECH.filter(c => unlockedChassis.includes(c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.name} (基礎魅力:{c.baseAppeal})</option>
            ))}
          </select>
          {chassis.slots.map(slotType => (
            <select
              key={slotType} value={designSlots[slotType] || ''}
              onChange={e => setDesignSlots(p => ({ ...p, [slotType]: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs"
            >
              <option value="">【{slotType}】部品を選択...</option>
              {allTech.filter(m => m.type === slotType && allUnlocked.includes(m.id)).map(m => (
                <option key={m.id} value={m.id}>{m.name} (+{m.appeal} 魅力 / +${m.costVal} 原価)</option>
              ))}
            </select>
          ))}
          {canSave && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-[11px] text-slate-400 space-y-1">
              <div>設計魅力度: <span className="text-yellow-400 font-black">{previewAppeal}</span></div>
              <div>原価: <span className="text-red-400 font-black">${previewCost}k</span></div>
              {chassisDiv && <div className="text-emerald-400">事業部レベルボーナス適用中 (Lv.{chassisDiv.level})</div>}
              {chassisDiv?.morale < 60 && <div className="text-red-400">事業部士気低下によるコスト増！</div>}
              {isSiloActive && chassis.category === 'smart_device' && <div className="text-red-500 font-bold">サイロ化ペナルティ：スマートデバイス開発コスト1.5倍！</div>}
            </div>
          )}
          <button
            onClick={() => {
              const modules = {};
              chassis.slots.forEach(s => { modules[s] = designSlots[s]; });
              setBlueprints(prev => [...prev, {
                id: `bp_${Date.now()}`,
                name: designName,
                chassisId: chassis.id,
                baseAppeal: previewAppeal,
                cost: previewCost,
                modules: modules,
                launchYear: currentYear,
                generation: 1,
              }]);
              setDesignName(''); setDesignSlots({});
            }}
            disabled={!canSave}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 rounded-xl font-black text-white"
          >
            設計図を保存
          </button>
        </div>
      </div>

      {/* カタログ */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 overflow-y-auto max-h-[600px] shadow-xl">
        <h3 className="font-black text-slate-200 mb-6">カタログ ({blueprints.length}件)</h3>
        <div className="grid grid-cols-1 gap-3">
          {[...blueprints].reverse().map(bp => {
            const age = currentYear - (bp.launchYear || currentYear);
            const refreshCost = Math.max(8000, bp.cost * 3);
            return (
              <div key={bp.id} className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-black text-yellow-500 text-lg">{bp.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      発売: {bp.launchYear || currentYear}年 / 世代: {bp.generation || 1}
                    </div>
                  </div>
                  <button
                    onClick={() => setBlueprints(prev => prev.filter(b => b.id !== bp.id))}
                    disabled={productionLines.some(l => l.blueprintId === bp.id)}
                    className="w-10 h-10 hover:bg-red-900/50 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">
                  設計魅力度: {bp.baseAppeal} / 原価: ${bp.cost}k
                </div>
                <div className={`text-[10px] ${age >= 4 ? 'text-amber-300' : 'text-slate-400'}`}>
                  製品寿命: {age}年経過{age >= 4 ? '（次世代を準備する時期です）' : ''}
                </div>
                <button
                  onClick={() => refreshBlueprint(bp.id)}
                  disabled={money < refreshCost}
                  className={`w-full py-2 rounded-xl text-[10px] font-black ${money < refreshCost ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                >
                  新世代モデル開発 (${refreshCost.toLocaleString()}k)
                </button>
              </div>
            );
          })}
          {blueprints.length === 0 && (
            <div className="text-center text-slate-600 py-8">設計図がありません</div>
          )}
        </div>
      </div>
    </div>
  );
}
