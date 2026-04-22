export const apple = {
  name: 'Apple', color: 'bg-zinc-300', textColor: 'text-zinc-400',
  trait: 'イノベーションの旗手', strategy: 'innovator', priceTarget: 'premium', brand: 0.85,
  updateChance: 0.04, appealMod: 1.5, strongMarket: 'na',
  prefixes: ['Apple', 'iPod', 'Mac', 'iPhone', 'iPad'],
  appearsYear: 1976, disappearsYear: 9999,
  initialMoney: 120000, initialFactories: 6, minMargin: 0.45,
  regions: { na: 1976, eu: 1980, jp: 1985, cn: 2009 },
  stockBase: 320, revenueBase: 180000,
  strengths: ['デザイン力とブランド価値', '垂直統合のエコシステム', '圧倒的な利益率'],
  eras: [
    { start: 2007, end: 2025, type: 'golden', name: 'iPhone革命', buff: 2.5, desc: 'スマートフォンの定義を再定義し、世界で最も価値のある企業へ。' },
    { start: 1990, end: 1997, type: 'dark',   name: '倒産の危機', buff: 0.6, desc: 'ジョブズ不在、製品ラインナップの迷走により倒産寸前に追い込まれた。' },
  ],
  history: [
    { year: 1977, product: 'Apple II',       desc: '個人用コンピュータの普及を決定づけた。' },
    { year: 2007, product: 'iPhone',         desc: 'スマートフォン市場を創出し、世界を変えた。' },
  ],
};
