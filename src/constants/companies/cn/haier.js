export const haier = {
  name: 'Haier', color: 'bg-blue-600', textColor: 'text-white',
  trait: '品質の破壊者・家電の巨人', strategy: 'cost_leader', priceTarget: 'budget', brand: 0.4,
  updateChance: 0.05, appealMod: 1.0, strongMarket: 'cn',
  prefixes: ['Haier', 'Casarte', 'AQUA'],
  appearsYear: 1985, disappearsYear: 9999,
  initialMoney: 15000, initialFactories: 2, minMargin: 0.05,
  regions: { cn: 1985, na: 2000, eu: 2005, jp: 2010 },
  stockBase: 120, revenueBase: 100000,
  strengths: ['徹底した品質管理（ハンマー事件）', '圧倒的な生産規模', 'グローバルな買収戦略'],
  eras: [{ start: 2005, end: 2025, type: 'golden', name: '白物家電の王', buff: 1.8, desc: '冷蔵庫・洗濯機で世界シェアNo.1を長年維持。' }],
  history: [{ year: 1985, product: 'Hammer Incident', desc: '不良品を社員の前でハンマーで叩き壊し、品質意識を改革。' }]
};
