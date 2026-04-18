import { useState } from 'react';
import { TrendingUp, DollarSign, BarChart2, PieChart, Activity } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

// ==========================================
// SVG ミニチャートコンポーネント
// ==========================================
function SparkLine({ data, dataKey, color = '#6366f1', height = 120, label, format, showArea = true }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-xs font-bold" style={{ height }}>
        データ収集中...
      </div>
    );
  }
  const values = data.map(d => d[dataKey] ?? 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${w},${height}`;
  const latest = values[values.length - 1];
  const prev = values[values.length - 2] || latest;
  const diff = latest - prev;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {showArea && <polygon points={areaPoints} fill={`url(#grad-${dataKey})`} />}
        <polyline points={points} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* latest dot */}
        {values.length > 0 && (() => {
          const lx = w;
          const ly = height - ((latest - min) / range) * (height - 20) - 10;
          return <circle cx={lx} cy={ly} r="1.5" fill={color} />;
        })()}
      </svg>
      <div className="absolute top-1 right-2 text-right">
        <div className="text-lg font-black" style={{ color }}>{format ? format(latest) : Math.floor(latest).toLocaleString()}</div>
        <div className={`text-[10px] font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, keys, colors, height = 140, labels }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-xs font-bold" style={{ height }}>
        データ収集中...
      </div>
    );
  }
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => Math.abs(d[k] ?? 0))), 1);
  const barW = 90 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {data.map((d, i) => {
          let yOffset = 0;
          return keys.map((k, ki) => {
            const val = Math.abs(d[k] ?? 0);
            const h = (val / maxVal) * (height - 20);
            const y = height - h - yOffset;
            yOffset += h;
            return (
              <rect key={`${i}-${ki}`} x={5 + i * (barW + 0.5)} y={y} width={barW} height={h}
                fill={colors[ki]} rx="0.5" opacity="0.85" />
            );
          });
        })}
      </svg>
      <div className="flex gap-4 mt-2">
        {keys.map((k, i) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
            {labels?.[i] || k}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareDonut({ shares, size = 120 }) {
  const entries = Object.entries(shares).filter(([, v]) => v > 0.001);
  const colors = {
    player: '#22c55e', mony: '#6366f1', natio: '#f97316', philis: '#06b6d4',
    samstar: '#2563eb', hitac: '#e11d48', motora: '#ef4444', genera: '#94a3b8',
    pineapple: '#d4d4d8', microhard: '#10b981', googo: '#f59e0b', nokio: '#38bdf8',
    commodo: '#78716c', ninten: '#d946ef', berry: '#7c3aed', siemen: '#14b8a6',
  };
  const r = 40, cx = 50, cy = 50;
  let cumAngle = -Math.PI / 2;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {entries.map(([key, value]) => {
        const angle = value * Math.PI * 2;
        const x1 = cx + r * Math.cos(cumAngle);
        const y1 = cy + r * Math.sin(cumAngle);
        cumAngle += angle;
        const x2 = cx + r * Math.cos(cumAngle);
        const y2 = cy + r * Math.sin(cumAngle);
        const large = angle > Math.PI ? 1 : 0;
        return (
          <path key={key}
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
            fill={colors[key] || '#475569'} stroke="#0f172a" strokeWidth="0.5"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="22" fill="#0f172a" />
    </svg>
  );
}

// ==========================================
// 統計タブ メインコンポーネント
// ==========================================
export default function Statistics() {
  const { chartData, stockPrice, lastTickProfit, markets, currentYear, money, divisions } = useGame();
  const [activeChart, setActiveChart] = useState('stock');

  const totalCost = lastTickProfit.varCost + lastTickProfit.fixedCost + lastTickProfit.marketingCost + lastTickProfit.storeCost;
  const profit = lastTickProfit.revenue - totalCost;

  const chartTabs = [
    { id: 'stock',   label: '株価推移',     icon: TrendingUp },
    { id: 'finance', label: '売上・利益',   icon: DollarSign },
    { id: 'market',  label: '市場シェア',   icon: PieChart },
    { id: 'detail',  label: '財務詳細',     icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* タブ切り替え */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {chartTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveChart(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeChart === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 株価推移 */}
      {activeChart === 'stock' && (
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" /> 株価チャート
              </h3>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-400">${Math.floor(stockPrice)}</div>
                <div className="text-[10px] text-slate-500">{currentYear}年 現在</div>
              </div>
            </div>
            <SparkLine data={chartData} dataKey="stockPrice" color="#818cf8" height={200} label="株価"
              format={v => `$${Math.floor(v)}`} />
            <div className="flex justify-between text-[9px] text-slate-600 mt-2 px-1">
              <span>{chartData.length > 0 ? chartData[0].year : '---'}年</span>
              <span>{chartData.length > 0 ? chartData[chartData.length - 1].year : '---'}年</span>
            </div>
          </div>

          {/* 資産推移 */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <Activity size={18} className="text-emerald-400" /> 総資産推移
            </h3>
            <SparkLine data={chartData} dataKey="money" color="#34d399" height={140}
              format={v => `$${(v/1000).toFixed(0)}M`} />
          </div>
        </div>
      )}

      {/* 売上・利益 */}
      {activeChart === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
              <div className="text-[10px] text-slate-500 font-bold mb-1">週間売上</div>
              <div className="text-2xl font-black text-emerald-400">${Math.floor(lastTickProfit.revenue).toLocaleString()}k</div>
              <SparkLine data={chartData} dataKey="revenue" color="#34d399" height={60} showArea={false} />
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
              <div className="text-[10px] text-slate-500 font-bold mb-1">週間コスト</div>
              <div className="text-2xl font-black text-red-400">${Math.floor(totalCost).toLocaleString()}k</div>
              <SparkLine data={chartData} dataKey="cost" color="#f87171" height={60} showArea={false} />
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl">
              <div className="text-[10px] text-slate-500 font-bold mb-1">週間利益</div>
              <div className={`text-2xl font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}${Math.floor(profit).toLocaleString()}k
              </div>
              <SparkLine data={chartData} dataKey="profit" color={profit >= 0 ? '#4ade80' : '#f87171'} height={60} showArea={false} />
            </div>
          </div>

          {/* 売上 vs コスト棒グラフ */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white mb-4">売上 vs コスト 推移</h3>
            <BarChart data={chartData.slice(-30)} keys={['revenue', 'cost']} colors={['#34d399', '#f87171']}
              labels={['売上', 'コスト']} height={160} />
          </div>
        </div>
      )}

      {/* 市場シェア */}
      {activeChart === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(markets).map(([mKey, m]) => (
              <div key={mKey} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <h4 className="font-black text-white mb-3">{m.name}</h4>
                <div className="flex items-center gap-4">
                  <ShareDonut shares={m.shares} size={100} />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400 font-bold">自社</span>
                      <span className="text-white font-black">{(m.shares.player * 100).toFixed(1)}%</span>
                    </div>
                    {Object.entries(m.shares)
                      .filter(([k, v]) => k !== 'player' && v > 0.01)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px] text-slate-400">
                          <span>{k}</span>
                          <span>{(v * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
                {!m.locked && (
                  <div className="mt-3 text-[10px] text-slate-500">需要: {m.demand.toLocaleString()}個/期</div>
                )}
                {m.locked && (
                  <div className="mt-3 text-[10px] text-amber-400 font-bold">🔒 未進出</div>
                )}
              </div>
            ))}
          </div>

          {/* 市場シェア推移 */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white mb-4">自社シェア推移（各市場）</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'jpShare', label: '日本', color: '#f97316' },
                { key: 'naShare', label: '北米', color: '#3b82f6' },
                { key: 'euShare', label: '欧州', color: '#a855f7' },
              ].map(m => (
                <div key={m.key} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-slate-400 mb-2">{m.label}市場</div>
                  <SparkLine data={chartData} dataKey={m.key} color={m.color} height={80}
                    format={v => `${(v * 100).toFixed(1)}%`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 財務詳細 */}
      {activeChart === 'detail' && (
        <div className="space-y-6">
          {/* コスト内訳 */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white mb-4">コスト内訳</h3>
            <div className="space-y-3">
              {[
                { label: '変動費（材料費）', value: lastTickProfit.varCost, color: 'bg-red-500' },
                { label: '固定費（工場維持）', value: lastTickProfit.fixedCost, color: 'bg-orange-500' },
                { label: 'マーケティング費', value: lastTickProfit.marketingCost, color: 'bg-blue-500' },
                { label: '直営店運営費', value: lastTickProfit.storeCost, color: 'bg-purple-500' },
                { label: 'リコール・修理費', value: lastTickProfit.repairCost, color: 'bg-pink-500' },
              ].map(item => {
                const pct = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-bold">${Math.floor(item.value).toLocaleString()}k ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 事業部パフォーマンス */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white mb-4">事業部パフォーマンス</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(divisions).filter(([, d]) => d.active).map(([cat, div]) => (
                <div key={cat} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs font-black text-white mb-2">{div.name}</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>レベル</span>
                        <span className="text-indigo-400 font-bold">Lv.{div.level}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(div.xp / (div.level * 500)) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>士気</span>
                        <span className={`font-bold ${div.morale > 70 ? 'text-green-400' : div.morale > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {Math.floor(div.morale)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${div.morale > 70 ? 'bg-green-500' : div.morale > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${div.morale}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      予算配分: <span className="text-white font-bold">{div.budgetShare.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 損益計算書 (P/L) */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-black text-white mb-4">損益計算書（週次）</h3>
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="p-3 text-slate-400">売上高</td>
                    <td className="p-3 text-right text-emerald-400 font-black">${Math.floor(lastTickProfit.revenue).toLocaleString()}k</td>
                  </tr>
                  {lastTickProfit.b2b > 0 && (
                    <tr className="border-b border-slate-700">
                      <td className="p-3 text-slate-500 pl-6">└ うちB2B売上</td>
                      <td className="p-3 text-right text-slate-400">${Math.floor(lastTickProfit.b2b).toLocaleString()}k</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-700">
                    <td className="p-3 text-slate-400">変動費</td>
                    <td className="p-3 text-right text-red-400">-${Math.floor(lastTickProfit.varCost).toLocaleString()}k</td>
                  </tr>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <td className="p-3 text-slate-300 font-bold">粗利益</td>
                    <td className={`p-3 text-right font-black ${lastTickProfit.revenue - lastTickProfit.varCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${Math.floor(lastTickProfit.revenue - lastTickProfit.varCost).toLocaleString()}k
                    </td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="p-3 text-slate-400">固定費</td>
                    <td className="p-3 text-right text-red-400">-${Math.floor(lastTickProfit.fixedCost).toLocaleString()}k</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="p-3 text-slate-400">マーケティング費</td>
                    <td className="p-3 text-right text-red-400">-${Math.floor(lastTickProfit.marketingCost).toLocaleString()}k</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="p-3 text-slate-400">直営店運営費</td>
                    <td className="p-3 text-right text-red-400">-${Math.floor(lastTickProfit.storeCost).toLocaleString()}k</td>
                  </tr>
                  <tr className="bg-slate-800">
                    <td className="p-3 text-white font-black text-sm">純利益</td>
                    <td className={`p-3 text-right text-lg font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}${Math.floor(profit).toLocaleString()}k
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
