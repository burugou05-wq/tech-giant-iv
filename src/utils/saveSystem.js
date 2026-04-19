/**
 * セーブシステム・ユーティリティ
 */
const SAVE_PREFIX = 'tech_giant_save_';

export const saveSystem = {
  /**
   * スロットに保存
   */
  saveToSlot: (slot, state) => {
    try {
      const saveData = {
        timestamp: Date.now(),
        version: '1.0',
        state: state
      };
      localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  /**
   * スロットから読み込み
   */
  loadFromSlot: (slot) => {
    try {
      const raw = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.state;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  /**
   * スロット情報の取得（UI表示用）
   */
  getSlotInfo: () => {
    const slots = [1, 2, 3, 'auto'];
    return slots.map(s => {
      const raw = localStorage.getItem(`${SAVE_PREFIX}${s}`);
      if (!raw) return { slot: s, empty: true };
      const data = JSON.parse(raw);
      const year = 1946 + Math.floor((data.state.ticks || 0) * 14 / 365.25);
      return {
        slot: s,
        empty: false,
        time: new Date(data.timestamp).toLocaleString(),
        year: year,
        money: data.state.money
      };
    });
  },

  /**
   * スロットの削除
   */
  deleteSlot: (slot) => {
    localStorage.removeItem(`${SAVE_PREFIX}${slot}`);
  }
};
