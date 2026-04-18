import { Factory, Trash2 } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

export default function Production() {
  const {
    productionLines, setProductionLines,
    totalFactories, setTotalFactories,
    money, setMoney,
    blueprints,
  } = useGame();

  const totalUsedFactories = productionLines.reduce((s, l) => s + l.factories, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-wrap justify-between items-center gap-4 shadow-lg">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2"><Factory size={24} /> 工場管理</h3>
          <p className="text-sm text-slate-400">
            稼働中 {totalUsedFactories} / 総棟数: {totalFactories}
          </p>
        </div>
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

      <div className="grid grid-cols-1 gap-4">
        {productionLines.map(line => {
          const bp = blueprints.find(b => b.id === line.blueprintId);
          return (
            <div key={line.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-wrap items-center gap-6 shadow-md">
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
          );
        })}
        {productionLines.length === 0 && (
          <div className="text-center text-slate-600 py-12">生産ラインがありません。「新規ライン」で追加してください。</div>
        )}
      </div>
    </div>
  );
}
