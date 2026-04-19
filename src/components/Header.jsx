import { Globe, Play, Pause, TrendingUp, Wrench, Target, AlertTriangle, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

const IconMap = { TrendingUp, Wrench, Globe, Target, AlertTriangle, AlertCircle };

export default function Header() {
  const { money, leadershipPower, currentYear, currentMonth, isPaused, setIsPaused, currentSpirits, gameSpeed, setGameSpeed } = useGame();

  return (
    <header className="flex shrink-0 items-center justify-between bg-slate-900 p-4 md:px-8 rounded-3xl border-2 border-slate-800 mb-6 shadow-2xl">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-green-400 tracking-tighter">
          TECH GIANT IV
        </h1>
        <div className="text-[10px] font-black tracking-widest text-slate-600">ローカルPC版</div>
      </div>
      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex gap-2">
          {currentSpirits.map(s => {
            const Icon = IconMap[s.icon] || Globe;
            return (
              <div key={s.id} className={`p-2 rounded-lg bg-slate-800 ${s.color} shadow-inner cursor-help group relative`}>
                <Icon size={18} />
                <div className="absolute top-full mt-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-[9px] opacity-0 group-hover:opacity-100 transition-opacity z-[100]">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-green-400 font-black text-sm">${Math.floor(money)}k</div>
        <div className="text-indigo-400 font-black text-sm">{Math.floor(leadershipPower)} LP</div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-400">Speed</div>
          {[1,2,3,4,5].map(speed => (
            <button
              key={speed}
              onClick={() => setGameSpeed(speed)}
              className={`w-6 h-6 text-[10px] font-black rounded ${gameSpeed === speed ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              {speed}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 font-mono text-2xl font-black text-yellow-400 bg-slate-950 p-2 px-6 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-baseline gap-1">
            <span>{currentYear}</span>
            <span className="text-xs text-slate-500 font-sans">年</span>
            <span className="ml-2">{currentMonth}</span>
            <span className="text-xs text-slate-500 font-sans">月</span>
          </div>
          <button onClick={() => setIsPaused(p => !p)} className="w-8 h-8 flex items-center justify-center">
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
