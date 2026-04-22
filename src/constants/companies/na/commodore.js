export const commodore = {
  name: 'Commodore', color: 'bg-indigo-900', textColor: 'text-indigo-100',
  targetCategory: 'digital',
  trait: 'PC革命の旗手', strategy: 'innovator', priceTarget: 'budget', brand: 0.4,
  updateChance: 0.06, appealMod: 1.2, strongMarket: 'na',
  prefixes: ['PET', 'VIC', 'C64', 'Amiga'],
  appearsYear: 1954, disappearsYear: 1994,
  initialMoney: 50000, initialFactories: 4, minMargin: 0.1,
  regions: { na: 1954, eu: 1960 },
  stockBase: 60, revenueBase: 30000,
  strengths: ['垂直統合による低コスト生産', 'ホビーユーザーからの熱狂的支持', 'Amigaによる先進的なマルチメディア技術'],
  eras: [
    { start: 1982, end: 1988, type: 'golden', name: 'C64の天下', buff: 2.2, desc: '「C64」が世界で最も売れたコンピュータとして歴史に名を刻む。' },
  ],
  history: [
    { year: 1977, product: 'PET 2001',        desc: '世界初のオールインワンPCの一つ。' },
    { year: 1982, product: 'Commodore 64',    desc: '爆発的なヒットを記録したホームコンピュータ。' },
  ],
};
