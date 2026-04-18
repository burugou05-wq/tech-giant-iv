import { Factory, Trash2, TrendingUp, Package, Star, Tag } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export default function Production() {
  const {
    productionLines, setProductionLines,
    totalFactories, setTotalFactories,
    money, setMoney,
    blueprints, markets, inventory,
    setLineStrategy
  } = useGame();

  const totalUsedFactories = productionLines.reduce((s, l) => s + l.factories, 0);

  // 推定需要の計算
  const estimatedDemand = Object.values(markets).reduce((sum, m) => {
    if (m.locked) return sum;
    return sum + Math.floor(m.demand * m.shares.player);
  }, 0);

  // 総生産量の計算
  const totalProduction = productionLines.reduce((sum, line) => {
    if (line.strategy === 'discount') return sum; // セール品は生産停止
    return sum + Math.floor(line.factories * 40 * (line.efficiency / 100));
  }, 0);

  const supplyRatio = estimatedDemand > 0 ? totalProduction / estimatedDemand : 0;

  const strategyOptions = [
    { id: 'standard', name: '標準', icon: <Package size={12} />, color: 'bg-slate-700', desc: '通常の価格と魅力度' },
    { id: 'flagship', name: '目玉', icon: <Star size={12} />, color: 'bg-yellow-600', desc: '魅力1.5倍 / 広告費3倍' },
    { id: 'discount', name: 'セール', icon: <Tag size={12} />, color: 'bg-red-600', desc: '売却速2倍 / 利益減 / 生産停止' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-wrap justify-between items-center gap-4 shadow-lg">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2"><Factory size={24} /> 工場管理</h3>
          <p className="text-sm text-slate-400">
            稼働中 {totalUsedFactories} / 総棟数: {totalFactories}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold">総生産量</div>
            <div className="text-lg font-black text-blue-400">{totalProduction.toLocaleString()}</div>
          </div>
          <div className="text-slate-600 text-lg font-black">vs</div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold">推定需要</div>
            <div className="text-lg font-black text-amber-400">{estimatedDemand.toLocaleString()}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
            supplyRatio >= 0.9 && supplyRatio <= 1.3 ? 'bg-green-900/40 text-green-400 border border-green-700' :
            supplyRatio < 0.9 ? 'bg-red-900/40 text-red-400 border border-red-700' :
            'bg-amber-900/40 text-amber-400 border border-amber-700'
          }`}>
            {supplyRatio < 0.5 ? '⚠ 供給不足' : supplyRatio <= 1.3 ? '✓ バランス良好' : '⚠ 在庫過多'}
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
                strategy: 'standard'
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
          const lineProduction = line.strategy === 'discount' ? 0 : Math.floor(line.factories * 40 * (line.efficiency / 100));
          const stock = inventory[line.blueprintId]?.amount || 0;
          
          return (
            <div key={line.id} className={`bg-slate-800 p-5 rounded-xl border transition-all ${
              line.strategy === 'flagship' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 
              line.strategy === 'discount' ? 'border-red-500/50' : 'border-slate-700'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 ${
                    line.strategy === 'discount' ? 'bg-red-900/30 text-red-300' : 'bg-blue-900/30 text-blue-300'
                  }`}>
                    <TrendingUp size={12} />
                    {line.strategy === 'discount' ? '生産停止' : `生産: ${lineProduction.toLocaleString()}/期`}
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-bold flex items-center gap-1.5 border border-slate-700">
                    <Package size={12} />
                    在庫: {stock.toLocaleString()}
                  </div>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                  {strategyOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setLineStrategy(line.id, opt.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all ${
                        line.strategy === opt.id ? `${opt.color} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={opt.desc}
                    >
                      {opt.icon} {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="w-32">
                  <div className="text-sm font-black text-yellow-500 truncate">{bp?.name || '(未設定)'}</div>
                </div>
                <div className="w-48">
                  <select
                    value={line.blueprintId}
                    onChange={e => setProductionLines(ls =>
                      ls.map(l => l.id === line.id ? { ...l, blueprintId: e.target.value, efficiency: 10 } : l)
                    )}
                    className="w-full bg-slate-900 text-white rounded-lg p-2 font-bold border border-slate-600 text-xs"
                  >
                    {blueprints.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-32">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>習熟度</span><span>{Math.floor(line.efficiency)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className={`${line.strategy === 'flagship' ? 'bg-yellow-500' : 'bg-green-500'} h-full transition-all`} style={{ width: `${line.efficiency}%` }} />
                  </div>
                </div>
                <div className={`flex items-center gap-4 bg-slate-900 p-1.5 rounded-xl border border-slate-700 ${line.strategy === 'discount' ? 'opacity-30 pointer-events-none' : ''}`}>
                  <button onClick={() => setProductionLines(ls => ls.map(l => l.id === line.id ? { ...l, factories: Math.max(0, l.factories-1) } : l))} className="w-8 h-8 bg-slate-800 rounded font-black">-</button>
                  <div className="text-lg font-black text-yellow-500 w-6 text-center">{line.factories}</div>
                  <button onClick={() => { if (totalUsedFactories < totalFactories) setProductionLines(ls => ls.map(l => l.id === line.id ? { ...l, factories: l.factories+1 } : l)) }} className="w-8 h-8 bg-slate-800 rounded font-black">+</button>
                </div>
                <button onClick={() => setProductionLines(ls => ls.filter(l => l.id !== line.id))} className="text-red-500 p-2 hover:bg-red-900/30 rounded"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
