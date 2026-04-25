import { useState, useMemo } from 'react';
import { Radio } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../ui/index.js';

export default function MarketNews({ logs }) {
  const [newsFilter, setNewsFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    if (newsFilter === 'all') return logs;
    if (newsFilter === 'alert') return logs.filter(l => l.type === 'alert' || l.type === 'error');
    if (newsFilter === 'ma') return logs.filter(l => l.msg.includes('【') && (l.msg.includes('提携') || l.msg.includes('買収') || l.msg.includes('統合') || l.msg.includes('独立') || l.msg.includes('再建') || l.msg.includes('再生') || l.msg.includes('子会社') || l.msg.includes('歴史的傑作')));
    return logs;
  }, [logs, newsFilter]);

  return (
    <>
      <Card className="flex flex-col h-96">
        <CardHeader className="flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-black text-slate-200 flex items-center gap-2 text-lg">
              <Radio size={20} className="text-blue-400" /> マーケットニュース
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">リアルタイムフィード</span>
          </div>

          <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 ml-auto">
            {[
              { id: 'all', name: 'すべて' },
              { id: 'alert', name: '重要' },
              { id: 'ma', name: 'M&A・提携' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setNewsFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                  newsFilter === f.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredLogs.map((log, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 transition-all hover:bg-slate-700/30 ${
              log.type === 'alert' || log.type === 'error'
                ? 'bg-red-900/10 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : log.type === 'warning'
                ? 'bg-amber-900/10 border-amber-500 text-amber-100'
                : 'bg-slate-900/40 border-slate-700/50 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black opacity-50 tracking-tighter uppercase">{log.time}</span>
                {(log.type === 'alert' || log.type === 'error') && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">URGENT</span>}
              </div>
              <p className={`text-xs leading-relaxed font-medium ${log.color || ''}`}>{log.msg}</p>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <Radio size={40} className="opacity-10 mb-2" />
              <div className="text-xs font-bold uppercase tracking-widest opacity-30">表示するニュースがありません</div>
            </div>
          )}
        </CardContent>
      </Card>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  );
}
