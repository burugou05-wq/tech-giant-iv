import React from 'react';
import { Trash2, TrendingUp, Package, Star, Tag } from 'lucide-react';

const strategyOptions = [
  { id: 'standard', name: '標準', icon: <Package size={12} />, color: 'bg-slate-700', desc: '通常の価格と魅力度' },
  { id: 'flagship', name: '目玉', icon: <Star size={12} />, color: 'bg-yellow-600', desc: '魅力1.5倍 / 広告費3倍' },
  { id: 'discount', name: 'セール', icon: <Tag size={12} />, color: 'bg-red-600', desc: '売却速2倍 / 利益減 / 生産停止' },
];

export const ProductionLineCard = ({ 
  line, 
  blueprints, 
  inventory, 
  onSetStrategy, 
  onUpdateLine, 
  onRemove,
  canAddFactory
}) => {
  const bp = blueprints.find(b => b.id === line.blueprintId);
  const lineProduction = line.strategy === 'discount' ? 0 : Math.floor(line.factories * 40 * (line.efficiency / 100));
  const stock = inventory[line.blueprintId]?.amount || 0;

  return (
    <div className={`bg-slate-800/80 p-5 rounded-2xl border transition-all duration-300 ${
      line.strategy === 'flagship' ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 
      line.strategy === 'discount' ? 'border-red-500/30 bg-red-900/5' : 'border-slate-700 hover:border-slate-600'
    }`}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 border ${
            line.strategy === 'discount' ? 'bg-red-900/40 text-red-300 border-red-500/20' : 'bg-blue-900/40 text-blue-300 border-blue-500/20'
          }`}>
            <TrendingUp size={12} />
            {line.strategy === 'discount' ? '生産停止' : `週産: ${lineProduction.toLocaleString()}`}
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 text-[10px] font-black flex items-center gap-2 border border-slate-700">
            <Package size={12} />
            在庫: {stock.toLocaleString()}
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 shadow-inner">
          {strategyOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onSetStrategy(line.id, opt.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all ${
                line.strategy === opt.id ? `${opt.color} text-white shadow-lg` : 'text-slate-600 hover:text-slate-400'
              }`}
              title={opt.desc}
            >
              {opt.icon} {opt.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="w-48">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-1 px-1">製品モデル</div>
          <select
            value={line.blueprintId}
            onChange={e => onUpdateLine(line.id, { blueprintId: e.target.value, efficiency: 10 })}
            className="w-full bg-slate-900 text-white rounded-xl p-2.5 font-black border border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {blueprints.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-32">
          <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-tighter">
            <span>製造習熟度</span><span>{Math.floor(line.efficiency)}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${line.strategy === 'flagship' ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
              style={{ width: `${line.efficiency}%` }} 
            />
          </div>
        </div>

        <div className={`flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner ${line.strategy === 'discount' ? 'opacity-30 pointer-events-none' : ''}`}>
          <button 
            onClick={() => onUpdateLine(line.id, { factories: Math.max(0, line.factories - 1) })} 
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-black transition-colors"
          >-</button>
          <div className="text-xl font-black text-blue-400 w-8 text-center">{line.factories}</div>
          <button 
            onClick={() => { if (canAddFactory) onUpdateLine(line.id, { factories: line.factories + 1 }) }} 
            className={`w-8 h-8 rounded-lg font-black transition-colors ${canAddFactory ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
          >+</button>
        </div>

        <button 
          onClick={() => onRemove(line.id)} 
          className="text-slate-600 p-3 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
