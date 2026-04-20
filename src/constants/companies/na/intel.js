export const intel = {
  name: 'Intel', color: 'bg-blue-400', textColor: 'text-blue-100',
  trait: '半導体の絶対王者', strategy: 'innovator', priceTarget: 'premium', brand: 0.75,
  updateChance: 0.04, appealMod: 1.1, strongMarket: 'na',
  prefixes: ['Pentium', 'Core', 'Centrino', 'Celeron', 'Xeon'],
  appearsYear: 1968, disappearsYear: 9999,
  initialMoney: 250000, initialFactories: 8, minMargin: 0.50, // 高い利益率
  regions: { na: 1968, eu: 1975, jp: 1980 },
  stockBase: 190, revenueBase: 180000,
  strengths: ['マイクロプロセッサの世界標準', '圧倒的な製造プロセス技術', 'Intel Insideによるブランド戦略'],
  eras: [
    { start: 1991, end: 2010, type: 'golden', name: 'Intel Inside', buff: 1.7, desc: 'PC市場の成長とともに、すべてのコンピュータの頭脳として君臨。' },
  ],
  history: [
    { year: 1971, product: '4004',           desc: '世界初のマイクロプロセッサを開発。' },
    { year: 1993, product: 'Pentium',        desc: 'PCの性能を飛躍的に向上させ、一般家庭に普及させた。' },
  ],
};
