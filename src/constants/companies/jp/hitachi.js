export const hitachi = {
  name: 'Hitachi', color: 'bg-rose-600', textColor: 'text-rose-400',
  trait: '重厚長大・信頼型', strategy: 'follower', priceTarget: 'mainstream', brand: 0.5,
  updateChance: 0.02, appealMod: 0.95, strongMarket: 'jp',
  prefixes: ['Hitachi', 'Wooo', 'Motor', 'Infra'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 160000, initialFactories: 12, minMargin: 0.18,
  regions: { jp: 1946, na: 1965, eu: 1970, cn: 1985 },
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
