import { FlaskConical, Wrench, Factory, Globe, Landmark, Network, Briefcase, BarChart2, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',  icon: Landmark,     label: 'ダッシュボード' },
  { id: 'organization',icon: Network,     label: '事業部・組織 (Org)' },
  { id: 'corporate',  icon: Briefcase,    label: '企業方針 (Focus)' },
  { id: 'market',     icon: Globe,        label: 'グローバル市場' },
  { id: 'statistics', icon: BarChart2,    label: '統計・分析' },
  { id: 'ranking',    icon: Trophy,       label: '世界ランキング' },
  { id: 'production', icon: Factory,      label: '生産工場' },
  { id: 'design',     icon: Wrench,       label: '製品設計' },
  { id: 'research',   icon: FlaskConical, label: '技術開発' },
];

export default function NavBar() {
  const { activeTab, setActiveTab } = useGame();
  return (
    <nav className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center gap-4 p-4 rounded-2xl text-xs font-black transition-all border-2 ${
            activeTab === item.id 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-500 border-transparent dark:hover:bg-slate-800'
          }`}
        >
          <item.icon size={18} />
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
