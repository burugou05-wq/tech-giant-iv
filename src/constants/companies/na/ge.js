export const ge = {
  name: 'GE', color: 'bg-slate-400', textColor: 'text-slate-300',
  trait: '巨大複合企業', strategy: 'cost_leader', priceTarget: 'mainstream', brand: 0.65,
  updateChance: 0.02, appealMod: 0.95, strongMarket: 'na',
  prefixes: ['GE', 'General', 'Electric', 'Hotpoint'],
  appearsYear: 1946, disappearsYear: 2004,
  initialMoney: 500000, initialFactories: 25, minMargin: 0.22,
  regions: { na: 1946, eu: 1960 },
  stockBase: 250, revenueBase: 300000,
  strengths: ['圧倒的な資本力', '北米家電市場の支配', 'インフラとの相乗効果'],
  eras: [
    { start: 1946, end: 1970, type: 'golden', name: '世界最強のコングロマリット', buff: 1.4, desc: 'あらゆる産業を支配した、アメリカ資本主義の象徴。' },
  ],
  history: [
    { year: 1950, product: 'GE Fridge',      desc: '北米の家庭に普及した白物家電。' },
    { year: 1980, product: 'CT Scanner',     desc: '医療・産業分野での高い技術力。' },
  ],
};
