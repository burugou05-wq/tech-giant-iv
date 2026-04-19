export const samsung = {
  name: 'Samsung', color: 'bg-blue-600', textColor: 'text-blue-400',
  trait: '巨大コングロマリット', strategy: 'cost_leader', priceTarget: 'budget', brand: 0.4,
  updateChance: 0.06, appealMod: 1.0, strongMarket: 'eu',
  prefixes: ['Galaxy', 'Wave', 'Samsung', 'OLED', 'Z-Fold'],
  appearsYear: 1969, disappearsYear: 9999,
  initialMoney: 250000, minMargin: 0.18,
  regions: { eu: 1969, na: 1980, jp: 2000 },
  stockBase: 70, revenueBase: 210000,
  strengths: ['圧倒的な量産・コスト競争力', '欧州・新興国市場での普及率', '垂直統合によるスピード'],
  eras: [
    { start: 2010, end: 2025, type: 'golden', name: 'Galaxy帝国の構築', buff: 1.9, desc: 'スマホ市場で世界トップシェアを獲得し、アジアを代表する巨人に成長。' },
  ],
  history: [
    { year: 1969, product: 'Samsung TV',     desc: '白黒テレビの量産で家電市場に参入。' },
    { year: 2011, product: 'Galaxy S',       desc: 'スマートフォンで世界トップシェアを獲得。' },
  ],
};
