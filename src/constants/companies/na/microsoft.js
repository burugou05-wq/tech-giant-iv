export const microsoft = {
  name: 'Microsoft', color: 'bg-emerald-500', textColor: 'text-emerald-400',
  trait: 'ソフトウェア帝国', strategy: 'innovator', priceTarget: 'premium', brand: 0.85,
  updateChance: 0.03, appealMod: 1.3, strongMarket: 'na',
  prefixes: ['Surface', 'Windows', 'Xbox', 'Office', 'Azure'],
  appearsYear: 1975, disappearsYear: 9999,
  initialMoney: 150000, minMargin: 0.32,
  regions: { na: 1975, eu: 1980, jp: 1985 },
  stockBase: 415, revenueBase: 200000,
  strengths: ['ソフトウェアの事実上の標準', '法人市場の強力な基盤', 'プラットフォーム戦略'],
  eras: [
    { start: 1990, end: 2005, type: 'golden', name: 'Windowsの覇権', buff: 1.8, desc: 'PC用OS市場を独占し、IT業界の圧倒的リーダーとなった。' },
  ],
  history: [
    { year: 1985, product: 'Windows',        desc: 'GUIオペレーティングシステムの普及。' },
    { year: 2001, product: 'Xbox',           desc: '家庭用ゲーム機市場への参入。' },
  ],
};
