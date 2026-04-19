export const casio = {
  name: 'Casio', color: 'bg-blue-400', textColor: 'text-blue-200',
  trait: 'デジタルガジェット', strategy: 'innovator', priceTarget: 'budget', brand: 0.4,
  updateChance: 0.05, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['G-Shock', 'Exilim', 'Privia', 'Casio'],
  appearsYear: 1957, disappearsYear: 9999,
  initialMoney: 80000, minMargin: 0.30,
  regions: { jp: 1957, na: 1970, eu: 1975 },
  stockBase: 120, revenueBase: 50000,
  strengths: ['究極の小型化・省電力技術', 'G-SHOCKに代表されるタフネス思想', '独自のUIと使い勝手'],
  eras: [
    { start: 1972, end: 1985, type: 'golden', name: '電卓戦争の勝者', buff: 1.6, desc: '「カシオミニ」の発売により、電卓を個人の持ち物へと変えた。' },
  ],
  history: [
    { year: 1972, product: 'Casio Mini',     desc: '世界初のパーソナル電卓。爆発的なヒット。' },
    { year: 1983, product: 'G-SHOCK',        desc: '「落としても壊れない」時計という新ジャンルを創出。' },
  ],
};
