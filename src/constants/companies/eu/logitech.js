export const logitech = {
  name: 'Logitech', color: 'bg-teal-600', textColor: 'text-white',
  trait: '周辺機器の覇者', strategy: 'follower', priceTarget: 'mainstream', brand: 0.5,
  updateChance: 0.05, appealMod: 1.1, strongMarket: 'eu',
  prefixes: ['Logi', 'MouseMan', 'G-Series'],
  appearsYear: 1981, disappearsYear: 9999,
  initialMoney: 20000, initialFactories: 3, minMargin: 0.15,
  regions: { eu: 1981, na: 1985, jp: 1988 },
  stockBase: 90, revenueBase: 35000,
  strengths: ['マウス製造における世界最高の実績', '高い工業デザイン能力', 'ソフトウェアとの高度な連携'],
  eras: [{ start: 1995, end: 2010, type: 'golden', name: 'PC周辺機器の王', buff: 1.8, desc: 'PCの普及とともに、あらゆるデスクにLogitech製品が置かれる時代へ。' }],
  history: [{ year: 1982, product: 'P4 Mouse', desc: '同社初の商業用マウス。' }]
};
