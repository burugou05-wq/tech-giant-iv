export const huawei = {
  name: 'Huawei', color: 'bg-red-700', textColor: 'text-red-100',
  trait: '技術の壁', strategy: 'innovator', priceTarget: 'premium',
  updateChance: 0.040, appealMod: 1.2, strongMarket: 'cn',
  prefixes: ['Mate', 'P series', 'Honor', 'Nova'],
  appearsYear: 1987, disappearsYear: 9999,
  initialMoney: 300000, minMargin: 0.30,
  regions: { cn: 1987, eu: 2005, na: 2010 },
  stockBase: 220, revenueBase: 200000,
  strengths: ['世界トップクラスのR&D投資', '垂直統合による最適化', '5Gインフラとの強い連動'],
  eras: [
    { start: 2015, end: 2019, type: 'golden', name: 'スマホ世界2位', buff: 1.8, desc: 'カメラ性能で他社を圧倒し、世界ブランドとしての地位を確立。' },
  ],
  history: [
    { year: 2015, product: 'Mate 8',         desc: '独自チップKirinを搭載し、ハイエンド市場へ参入。' },
    { year: 2018, product: 'P20 Pro',        desc: 'ライカとの提携により、カメラ性能で世界一を記録。' },
  ],
};
