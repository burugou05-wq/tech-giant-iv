export const tcl = {
  name: 'TCL', color: 'bg-red-600', textColor: 'text-white',
  trait: '垂直統合のTVメーカー', strategy: 'cost_leader', priceTarget: 'budget', brand: 0.35,
  updateChance: 0.06, appealMod: 0.95, strongMarket: 'cn',
  prefixes: ['TCL', 'Roku TV', 'X-Series'],
  appearsYear: 1985, disappearsYear: 9999,
  initialMoney: 10000, initialFactories: 3, minMargin: 0.04,
  regions: { cn: 1985, na: 2010, eu: 2012 },
  stockBase: 100, revenueBase: 80000,
  strengths: ['パネルから製品までの一貫生産', '北米市場での急速なシェア拡大'],
  history: [{ year: 2004, product: 'Thomson Merger', desc: 'フランスのトムソン（RCA）のTV部門を買収し、世界市場へ。' }]
};
