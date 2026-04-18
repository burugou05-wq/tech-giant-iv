import { Factory, Trash2, TrendingUp, Package } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export default function Production() {
  const {
    productionLines, setProductionLines,
    totalFactories, setTotalFactories,
    money, setMoney,
    blueprints, markets, inventory,
  } = useGame();

  const totalUsedFactories = productionLines.reduce((s, l) => s + l.factories, 0);

  // 推定需要の計算（全市場の需要 × 自社シェア の合計）
  const estimatedDemand = Object.values(markets).reduce((sum, m) => {
    if (m.locked) return sum;
    return sum + Math.floor(m.demand * m.shares.player);
  }, 0);

  // 総生産量の計算
  const totalProduction = productionLines.reduce((sum, line) => {
    return sum + Math.floor(line.factories * 40 * (line.efficiency / 100));
  }, 0);

  const supplyRatio = estimatedDemand > 0 ? totalProduction / estimatedDemand : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-wrap justify-between items-center gap-4 shadow-lg">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2"><Factory size={24} /> 工場管理</h3>
          <p className="text-sm text-slate-400">
            稼働中 {totalUsedFactories} / 総棟数: {totalFactories}
          </p>
        </div>

        {/* 需給バランス表示 */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold">総生産量</div>
            <div className="text-lg font-black text-blue-400">{totalProduction.toLocaleString()}<span className="text-[10px] text-slate-500">/期</span></div>
          </div>
          <div className="text-slate-600 text-lg font-black">vs</div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold">推定需要</div>
            <div className="text-lg font-black text-amber-400">{estimatedDemand.toLocaleString()}<span className="text-[10px] text-slate-500">/期</span></div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
            supplyRatio >= 0.9 && supplyRatio <= 1.3 ? 'bg-green-900/40 text-green-400 border border-green-700' :
            supplyRatio < 0.9 ? 'bg-red-900/40 text-red-400 border border-red-700' :
            'bg-amber-900/40 text-amber-400 border border-amber-700'
          }`}>
            {supplyRatio < 0.5 ? '⚠ 供給不足' :
             supplyRatio < 0.9 ? '↓ やや不足' :
             supplyRatio <= 1.3 ? '✓ バランス良好' :
             supplyRatio <= 2.0 ? '↑ やや過剰' : '⚠ 在庫過多'}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const cost = 20000 + (totalFactories - 10) * 5000;
              if (money < cost) { alert('資金不足'); return; }
              setMoney(prev => prev - cost);
              setTotalFactories(prev => prev + 1);
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            工場増設 (${(20000 + (totalFactories - 10) * 5000).toLocaleString()}k)
          </button>
          <button
            onClick={() => {
              if (blueprints.length === 0) { alert('先に設計図を作成してください'); return; }
              setProductionLines(prev => [...prev, {
                id: `line_${Date.now()}`,
                blueprintId: blueprints[0].id,
                factories: 0,
                efficiency: 10,
              }]);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all"
          >
            新規ライン
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {productionLines.map(line => {
          const bp = blueprints.find(b => b.id === line.blueprintId);
          const lineProduction = Math.floor(line.factories * 40 * (line.efficiency / 100));
          const stock = inventory[line.blueprintId]?.amount || 0;
          const totalSold = inventory[line.blueprintId]?.sold || 0;
          return (
            <div key={line.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
              {/* 上段: 生産量 & 在庫 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-800/50">
                  <TrendingUp size={12} className="text-blue-400" />
                  <span className="text-[10px] font-black text-blue-300">生産: {lineProduction.toLocaleString()}/期</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Package size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">在庫: {stock.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-600">累計販売: {totalSold.toLocaleString()}</div>
              </div>

              {/* 下段: メインコントロール */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-sm font-black text-yellow-500 w-32">{bp?.name || '(未設定)'}</div>
                <div className="w-52">
                  <select
                    value={line.blueprintId}
                    onChange={e => setProductionLines(ls =>
                      ls.map(l => l.id === line.id ? { ...l, blueprintId: e.target.value, efficiency: 10 } : l)
                    )}
                    className="w-full bg-slate-900 text-white rounded-lg p-2 font-bold border border-slate-600"
                  >
                    {blueprints.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <div className="text-[9px] text-slate-600 mt-1 pl-1">
                    推定需要: {estimatedDemand.toLocaleString()}/期（全市場合計）
                  </div>
                </div>
                <div className="flex-1 min-w-32 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>習熟度</span><span>{Math.floor(line.efficiency)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div className="bg-green-500 h-full" style={{ width: `${line.efficiency}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setProductionLines(ls =>
                      ls.map(l => l.id === line.id ? { ...l, factories: Math.max(0, l.factories - 1) } : l)
                    )}
                    className="w-8 h-8 bg-slate-800 rounded font-black"
                  >-</button>
                  <div className="text-lg font-black text-yellow-500 w-6 text-center">{line.factories}</div>
                  <button
                    onClick={() => {
                      if (totalUsedFactories >= totalFactories) return;
                      setProductionLines(ls =>
                        ls.map(l => l.id === line.id ? { ...l, factories: l.factories + 1 } : l)
                      );
                    }}
                    className="w-8 h-8 bg-slate-800 rounded font-black"
                  >+</button>
                </div>
                <button
                  onClick={() => setProductionLines(ls => ls.filter(l => l.id !== line.id))}
                  className="text-red-500 p-2 hover:bg-red-900/30 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {productionLines.length === 0 && (
          <div className="text-center text-slate-600 py-12">生産ラインがありません。「新規ライン」で追加してください。</div>
        )}
      </div>
    </div>
  );
}
