export const zenith = {
  name: 'Zenith', color: 'bg-zinc-700', textColor: 'text-zinc-200',
  trait: 'アメリカの家電王', strategy: 'cost_leader', priceTarget: 'mainstream',
  updateChance: 0.020, appealMod: 0.95, strongMarket: 'na',
  prefixes: ['Zenith', 'Space Command', 'Trans-Oceanic', 'ChromaColor'],
  appearsYear: 1946, disappearsYear: 1999,
  initialMoney: 120000, minMargin: 0.22,
  regions: { na: 1946, eu: 1960 },
  stockBase: 80, revenueBase: 90000,
  strengths: ['北米市場での高い信頼性', 'テレビのリモコンを世界で初めて実用化', '「品質」を売りにしたマーケティング'],
  eras: [
    { start: 1950, end: 1975, type: 'golden', name: '全米シェアNo.1', buff: 1.5, desc: '「The Quality Goes In Before The Name Goes On」の標語で圧倒的人気を誇った。' },
  ],
  history: [
    { year: 1956, product: 'Remote Control', desc: '世界初のテレビ用ワイヤレスリモコンを発売。' },
    { year: 1969, product: 'ChromaColor',    desc: '高輝度なカラーテレビで北米市場をリード。' },
  ],
};
