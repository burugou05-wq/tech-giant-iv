export const philips = {
  name: 'Philips', color: 'bg-blue-500', textColor: 'text-blue-400',
  trait: '手堅い欧州企業', strategy: 'follower', priceTarget: 'premium', brand: 0.75,
  updateChance: 0.020, appealMod: 0.9, strongMarket: 'eu',
  prefixes: ['Philips', 'Senseo', 'Sonic', 'Euro'],
  appearsYear: 1946, disappearsYear: 2015,
  initialMoney: 150000, initialFactories: 13, minMargin: 0.35,
  regions: { eu: 1946, na: 1950, jp: 1970 },
  stockBase: 120, revenueBase: 100000,
  strengths: ['欧州市場の絶対的支配', '音響・照明技術の先駆者', '安定した製品供給'],
  eras: [
    { start: 1960, end: 1985, type: 'golden', name: '欧州家電の巨人', buff: 1.5, desc: 'カセットテープやCDの規格を策定し、世界のデファクトスタンダードを握った。' },
  ],
  history: [
    { year: 1950, product: 'Phil Radio',     desc: '欧州中に普及した高品質なラジオ受信機。' },
    { year: 1982, product: 'Compact Disc',   desc: 'ソニー社と共同でCD規格を策定。' },
  ],
};
