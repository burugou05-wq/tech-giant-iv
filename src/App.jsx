import React, { useState } from 'react';
import {
  FlaskConical, Wrench, Factory, TrendingUp, Trash2,
  Play, Pause, Globe, Target, AlertTriangle, ChevronRight,
  Briefcase, Landmark, RefreshCcw, ShieldCheck, Film,
  Network, AlertCircle, Scale, X,
} from 'lucide-react';

import { GameContext } from './context/GameContext.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';

import EventModal    from './components/EventModal.jsx';
import Header        from './components/Header.jsx';
import NavBar        from './components/NavBar.jsx';
import Dashboard     from './components/tabs/Dashboard.jsx';
import CorporateFocus from './components/tabs/CorporateFocus.jsx';
import Organization  from './components/tabs/Organization.jsx';
import Market        from './components/tabs/Market.jsx';
import Production    from './components/tabs/Production.jsx';
import Design        from './components/tabs/Design.jsx';
import Research      from './components/tabs/Research.jsx';
import Statistics    from './components/tabs/Statistics.jsx';
import Ranking       from './components/tabs/Ranking.jsx';

export const IconMap = { Globe, TrendingUp, Wrench, Target, AlertTriangle, AlertCircle };

// ==========================================
// メインコンポーネント
// ==========================================
export default function App() {
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [researchTab, setResearchTab]   = useState('chassis');
  const [selectedChassisId, setSelectedChassisId] = useState('ch_radio');
  const [designSlots, setDesignSlots]             = useState({});
  const [designName, setDesignName]               = useState('');

  const engine = useGameEngine();

  // ==========================================
  // Context に渡す値
  // ==========================================
  const contextValue = {
    // UI state
    activeTab, setActiveTab,
    researchTab, setResearchTab,
    selectedChassisId, setSelectedChassisId,
    designSlots, setDesignSlots,
    designName, setDesignName,
    
    // Engine state & handlers
    ...engine,
  };

  return (
    <GameContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-2 md:p-6">
        <EventModal />
        <div className="max-w-[1400px] mx-auto flex flex-col h-screen max-h-[1000px]">
          <Header />
          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
            <NavBar />
            <main className="flex-1 bg-slate-900/40 p-6 rounded-3xl border-2 border-slate-800 overflow-y-auto shadow-inner relative">
              {activeTab === 'dashboard'  && <Dashboard />}
              {activeTab === 'organization' && <Organization />}
              {activeTab === 'corporate'  && <CorporateFocus />}
              {activeTab === 'market'     && <Market />}
              {activeTab === 'statistics' && <Statistics />}
              {activeTab === 'ranking'    && <Ranking />}
              {activeTab === 'production' && <Production />}
              {activeTab === 'design'     && <Design />}
              {activeTab === 'research'   && <Research />}
            </main>
          </div>
        </div>
      </div>
    </GameContext.Provider>
  );
}
