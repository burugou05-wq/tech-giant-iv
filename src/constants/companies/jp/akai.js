export const akai = {
  name: 'Akai', color: 'bg-red-800', textColor: 'text-white',
  trait: '磁気テープの極地', strategy: 'innovator', priceTarget: 'premium', brand: 0.5,
  updateChance: 0.03, appealMod: 1.15, strongMarket: 'jp',
  prefixes: ['Akai', 'GX', 'MPC', 'Professional'],
  appearsYear: 1946, disappearsYear: 2000,
  initialMoney: 25000, initialFactories: 4, minMargin: 0.25,
  regions: { jp: 1946, na: 1960, eu: 1965 },
  stockBase: 110, revenueBase: 28000,
  strengths: ['耐摩耗性に優れたGXヘッド技術', '音楽制作（ヒップホップ）への多大な貢献', '欧州・北米での高いブランド認知度'],
  eras: [{ start: 1970, end: 1985, type: 'golden', name: 'テープの赤井', buff: 1.4, desc: 'オープンリールデッキで世界シェアトップを誇る。' }],
  history: [{ year: 1988, product: 'MPC60', desc: 'ヒップホップ制作を一変させた伝説のサンプラー。' }]
};
