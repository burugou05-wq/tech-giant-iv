import React from 'react';

export const TechEraColumn = ({ era, children }) => {
  return (
    <div className="w-72 shrink-0 flex flex-col gap-8 group">
      <div className="relative">
        <div className="text-center font-black text-slate-500 group-hover:text-slate-400 transition-colors tracking-[0.3em] text-2xl uppercase italic">
          {era}s
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-800 rounded-full group-hover:w-20 group-hover:bg-blue-500/50 transition-all duration-500" />
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
