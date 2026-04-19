import React from 'react';
import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

export const FocusZoomControls = ({ zoom, setZoom }) => {
  return (
    <div className="absolute right-6 top-6 z-30 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="flex gap-1">
        <button
          onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
          title="縮小"
        ><ZoomOut size={16} /></button>
        <button
          onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
          title="拡大"
        ><ZoomIn size={16} /></button>
        <button
          onClick={() => setZoom(1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-90"
          title="リセット"
        ><RefreshCcw size={16} /></button>
      </div>
      <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-black text-blue-400 min-w-[50px] text-center">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
