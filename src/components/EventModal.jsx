import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Newspaper, Tv } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';

export default function EventModal() {
  const { activeEvent, handleEventChoice, currentYear } = useGame();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activeEvent]);

  if (!activeEvent || !isVisible) return null;

  const isModern = currentYear >= 1990;
  const bgImage = isModern 
    ? '/news_breaking.png'
    : '/news_extra.png';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden">
      {/* 背景エフェクト */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000 scale-110"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />
      
      {/* 走査線・ノイズ (TV用) */}
      {isModern && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10" />}

      {/* メインカード */}
      <div className={`relative w-full max-w-4xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-75 duration-500 flex flex-col md:flex-row
        ${isModern 
          ? 'bg-slate-900 border-y-4 border-red-600 shadow-red-900/20' 
          : 'bg-[#f4f1ea] border-double border-8 border-stone-800'
        }`}
      >
        {/* 見出しセクション */}
        <div className={`flex-1 p-8 flex flex-col justify-center relative
          ${isModern ? 'bg-gradient-to-br from-red-700 to-red-900 text-white' : 'bg-transparent text-stone-900'}
        `}>
          {!isModern && (
            <div className="absolute top-4 left-4 border-b-2 border-stone-800 text-[10px] font-serif font-bold uppercase tracking-widest text-stone-600">
              Tech Giant Times - Extra Edition
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full ${isModern ? 'bg-white text-red-700' : 'bg-stone-900 text-white'}`}>
              {isModern ? <Tv size={32} /> : <Newspaper size={32} />}
            </div>
            <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isModern ? 'text-red-200' : 'text-stone-500'}`}>
              {isModern ? 'Breaking News Report' : '号外 - 号外'}
            </h3>
          </div>

          <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-tight 
            ${isModern ? 'drop-shadow-lg italic' : 'font-serif vertical-rl tracking-tighter'}
          `}>
            {activeEvent.title}
          </h2>

          <p className={`text-lg md:text-xl font-bold leading-relaxed
            ${isModern ? 'text-white/90' : 'font-serif text-stone-800 border-l-4 border-stone-800 pl-6'}
          `}>
            {activeEvent.desc}
          </p>
        </div>

        {/* アクションセクション */}
        <div className={`w-full md:w-80 p-8 flex flex-col justify-center gap-4
          ${isModern ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-[#e9e6dd] border-l-4 border-stone-300'}
        `}>
          <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isModern ? 'text-slate-500' : 'text-stone-500'}`}>
            社長の決断
          </div>
          
          {activeEvent.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => handleEventChoice(opt.action), 300);
              }}
              className={`group w-full text-left p-5 transition-all duration-300 flex items-center justify-between
                ${isModern 
                  ? 'bg-slate-800 hover:bg-red-600 text-white border border-slate-700 rounded-xl shadow-lg' 
                  : 'bg-white hover:bg-stone-900 hover:text-white text-stone-900 border-2 border-stone-800 shadow-[4px_4px_0_rgba(0,0,0,0.1)]'
                }`}
            >
              <span className="font-black text-sm">{opt.label}</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          ))}
          
          <div className="mt-4 pt-4 border-t border-slate-800 text-[9px] text-slate-500 italic">
            選択により、その後の歴史が大きく変わる可能性があります。
          </div>
        </div>
      </div>
      
      {/* サウンドや振動のような視覚効果 (擬似) */}
      <div className="fixed inset-0 pointer-events-none bg-red-500/5 animate-pulse" />
    </div>
  );
}
