import { Globe, Play, Pause, TrendingUp, Wrench, Target, AlertTriangle, AlertCircle, Sun, Moon, FlaskConical, ClipboardList } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH } from '../constants/index.js';

const IconMap = { TrendingUp, Wrench, Globe, Target, AlertTriangle, AlertCircle };

export default function Header() {
  const { 
    money, leadershipPower, currentYear, currentMonth, 
    isPaused, setIsPaused, currentSpirits, gameSpeed, setGameSpeed,
    theme, setTheme, researchPoints, unlockedChassis, unlockedModules,
    completedFocuses, activeFocus, setActiveTab
  } = useGame();

  // 通知判定ロジック
  const allUnlocked = [...unlockedChassis, ...unlockedModules];
  const canResearch = [...CHASSIS_TECH, ...COMPONENT_TECH].some(tech => {
    if (allUnlocked.includes(tech.id)) return false;
    if (researchPoints < tech.cost) return false;
    return !tech.req || tech.req.length === 0 || tech.req.every(r => (
      allUnlocked.includes(r) || completedFocuses.includes(r)
    ));
  });

  const canSelectFocus = !activeFocus;

  return (
    <header className="flex shrink-0 items-center justify-between bg-white dark:bg-slate-900 p-4 md:px-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 mb-6 shadow-2xl transition-colors relative overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-green-400 tracking-tighter">
            TECH GIANT IV
          </h1>
          <div className="text-[10px] font-black tracking-widest text-slate-600">ローカルPC版</div>
        </div>

        {/* 通知エリア */}
        <div className="hidden lg:flex items-center gap-3">
          {canResearch && (
            <button 
              onClick={() => setActiveTab('research')}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 animate-pulse hover:bg-amber-500/20 transition-colors"
            >
              <FlaskConical size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-wider">技術開発可能</span>
            </button>
          )}
          {canSelectFocus && (
            <button 
              onClick={() => setActiveTab('focus')}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-500 animate-pulse hover:bg-indigo-500/20 transition-colors"
            >
              <ClipboardList size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-wider">方針未選択</span>
            </button>
          )}
        </div>
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
        <div className="flex items-center gap-4 font-mono text-2xl font-black text-yellow-600 dark:text-yellow-400 bg-slate-50 dark:bg-slate-950 p-2 px-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <div className="flex items-baseline gap-1">
            <span>{currentYear}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">年</span>
            <span className="ml-2">{currentMonth}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">月</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 ml-2 pl-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all active:scale-90"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsPaused(p => !p)} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
