import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export default function EventModal() {
  const { activeEvent, handleEventChoice } = useGame();
  if (!activeEvent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-800 w-full max-w-2xl rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-red-600 p-6 flex items-center gap-4">
          <AlertTriangle className="text-white" size={40} />
          <h2 className="text-3xl font-black text-white">{activeEvent.title}</h2>
        </div>
        <div className="p-10 bg-slate-900">
          <p className="text-xl text-slate-300 leading-relaxed mb-10">{activeEvent.desc}</p>
          <div className="space-y-4">
            {activeEvent.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleEventChoice(opt.action)}
                className="w-full text-left p-5 bg-slate-800 hover:bg-indigo-600 border-2 border-slate-700 rounded-2xl text-lg font-black transition-all flex justify-between"
              >
                <span>{opt.label}</span>
                <ChevronRight size={24} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
