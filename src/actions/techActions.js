/**
 * 技術・製品開発関連のアクションを作成
 */
export const createTechActions = (state, addLog, currentYear) => {
  const { money, setMoney, setBlueprints, blueprints } = state;

  return {
    deleteBlueprint: (id) => {
      setBlueprints(prev => prev.filter(b => b.id !== id));
    },

    refreshBlueprint: (bpId) => {
      const template = blueprints.find(b => b.id === bpId);
      if (!template) return;
      const refreshCost = Math.max(8000, template.cost * 3);
      if (money < refreshCost) {
        alert('資金不足');
        return;
      }
      setMoney(prev => prev - refreshCost);
      const newGen = (template.generation || 1) + 1;
      const baseName = template.name.replace(/ Mk\d+$/, '');
      const newName = `${baseName} Mk${newGen}`;
      
      setBlueprints(prev => [...prev, {
        ...template,
        id: `bp_${Date.now()}`,
        name: newName,
        launchYear: currentYear,
        generation: newGen,
      }]);
      addLog(`製品「${template.name}」の新世代バージョンを公開しました。`, 'info', 'text-cyan-300');
    }
  };
};
