export const hitachi = {
  name: 'Hitachi', color: 'bg-rose-600', textColor: 'text-rose-400',
  trait: '重電・インフラ', strategy: 'cost_leader', priceTarget: 'mainstream',
  updateChance: 0.020, appealMod: 0.85, strongMarket: 'jp',
  prefixes: ['Hitachi', 'Wooo', 'Motor', 'Infra'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 160000, minMargin: 0.25,
  regions: { jp: 1946, na: 1965, eu: 1970 },
  stockBase: 130, revenueBase: 170000,
  strengths: ['強靭なモーター技術', 'B2B市場からの安定収益', '質実剛健な設計'],
  eras: [
    { start: 1960, end: 1985, type: 'golden', name: 'もはや戦後ではない', buff: 1.4, desc: '高度経済成長期を支え、日本最大級の製造業として君臨。' },
  ],
  history: [
    { year: 1958, product: 'Automatic Washer', desc: '白物家電ブームを牽引。' },
    { year: 1990, product: 'Wooo TV',          desc: '高品質な映像技術でシェアを獲得。' },
  ],
};
