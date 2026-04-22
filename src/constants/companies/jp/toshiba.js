export const toshiba = {
  name: 'Toshiba', color: 'bg-red-700', textColor: 'text-red-500',
  trait: 'バランス型', strategy: 'follower', priceTarget: 'mainstream', brand: 0.6,
  updateChance: 0.025, appealMod: 1.0, strongMarket: 'jp',
  prefixes: ['Dynabook', 'Regza', 'Toshiba', 'Satellite'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 120000, initialFactories: 12, minMargin: 0.25,
  regions: { jp: 1946, na: 1960, eu: 1965, cn: 1985 },
  stockBase: 95, revenueBase: 80000,
  strengths: ['日本市場での強いブランド', 'ノートPCの先駆者', '幅広いインフラ技術'],
  eras: [
    { start: 1985, end: 1995, type: 'golden', name: 'ラップトップの覇者', buff: 1.8, desc: 'ノートPC市場を創出し、世界トップシェアを誇った黄金時代。' },
    { start: 2003, end: 2012, type: 'dark',   name: '不適切会計・経営混迷', buff: 0.6, desc: '経営陣の混乱と粉飾決算により、ブランド力が著しく低下。' },
  ],
  history: [
    { year: 1985, product: 'Dynabook',      desc: 'ラップトップPCの先駆けとして市場をリード。' },
    { year: 2006, product: 'Regza TV',      desc: '高画質な液晶テレビでブランドを再構築。' },
  ],
};
