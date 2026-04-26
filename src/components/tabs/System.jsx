import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { Card, CardHeader, CardContent } from '../ui/index.js';

const System = () => {
  const game = useGame() || {};
  const { getSlotInfo, saveGame, loadGame, deleteSlot } = game;
  const [slots, setSlots] = useState([]);

  const refreshSlots = () => {
    if (getSlotInfo) {
      setSlots(getSlotInfo());
    }
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const handleSave = (slot) => {
    if (saveGame && saveGame(slot)) {
      refreshSlots();
    }
  };

  const handleLoad = (slot) => {
    if (loadGame) loadGame(slot);
  };

  const handleDelete = (slot) => {
    if (deleteSlot) {
      deleteSlot(slot);
      refreshSlots();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          システム管理
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((s) => (
          <Card key={s.slot} className={`relative transition-all duration-300 ${s.empty ? 'opacity-60 grayscale-[0.5]' : 'border-indigo-500/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${s.slot === 'auto' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                  {s.slot === 'auto' ? <Clock size={20} /> : <Save size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {s.slot === 'auto' ? 'オートセーブ' : `セーブスロット ${s.slot}`}
                  </h3>
                  {s.empty ? (
                    <span className="text-xs text-slate-500 italic">データなし</span>
                  ) : (
                    <span className="text-xs text-indigo-400 font-mono">{s.time}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!s.empty ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ゲーム内年度:</span>
                    <span className="font-bold">{s.year}年</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">所持金:</span>
                    <span className="font-bold text-emerald-500">${Math.floor(s.money).toLocaleString()}k</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleLoad(s.slot)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <FolderOpen size={16} />
                      ロード
                    </button>
                    {s.slot !== 'auto' && (
                      <>
                        <button
                          onClick={() => handleSave(s.slot)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Save size={16} />
                          上書き
                        </button>
                        <button
                          onClick={() => handleDelete(s.slot)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <button
                    onClick={() => handleSave(s.slot)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-indigo-500/10 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500/50 rounded-2xl transition-all text-slate-400 hover:text-indigo-400 group"
                  >
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                    <span>ここに保存</span>
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="flex gap-4 p-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <p className="font-bold mb-1">ご注意</p>
            <p>
              セーブデータはブラウザの LocalStorage に保存されます。ブラウザのキャッシュクリアを実行するとデータが消去される場合がありますので、重要なデータは定期的にバックアップ（将来の実装予定）を検討してください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default System;
