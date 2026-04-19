import React from 'react';
import { Card } from '../../ui/index.js';
import { ShareDonut } from '../../ui/Charts/ShareDonut.jsx';
import { SparkLine } from '../../ui/Charts/SparkLine.jsx';

export const MarketAnalysis = ({ markets, chartData }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(markets).map(([mKey, m]) => (
          <Card key={mKey} className="p-6 bg-slate-800 border-slate-700 shadow-xl">
            <h4 className="font-black text-white mb-4 flex items-center justify-between">
              {m.name}
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Market Share</span>
            </h4>
            <div className="flex items-center gap-6">
              <ShareDonut shares={m.shares} size={90} />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-emerald-400 font-black">自社</span>
                  <span className="text-white font-black">{(m.shares.player * 100).toFixed(1)}%</span>
                </div>
                <div className="h-[1px] bg-slate-700 w-full" />
                {Object.entries(m.shares)
                  .filter(([k, v]) => k !== 'player' && v > 0.01)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      <span>{k}</span>
                      <span className="text-slate-400">{(v * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
              <span className="text-slate-600 font-black uppercase tracking-widest">市場規模</span>
              <span className="text-slate-400 font-bold">{m.locked ? '🔒 未進出' : `${m.demand.toLocaleString()} 個/週`}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* 市場シェア推移 */}
      <Card className="p-8 bg-slate-800 border-slate-700 shadow-xl">
        <h3 className="font-black text-slate-300 text-sm mb-8 uppercase tracking-widest">自社市場シェア推移（各地域）</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'jpShare', label: '日本', color: '#f97316' },
            { key: 'naShare', label: '北米', color: '#3b82f6' },
            { key: 'euShare', label: '欧州', color: '#a855f7' },
          ].map(m => (
            <div key={m.key} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                {m.label}市場
              </div>
              <SparkLine 
                data={chartData} 
                dataKey={m.key} 
                color={m.color} 
                height={80}
                format={v => `${(v * 100).toFixed(1)}%`} 
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
