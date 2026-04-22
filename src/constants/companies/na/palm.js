export const palm = {
  name: 'Palm', color: 'bg-zinc-800', textColor: 'text-zinc-100',
  trait: 'PDAの覇者', strategy: 'innovator', priceTarget: 'premium', brand: 0.65,
  updateChance: 0.07, appealMod: 1.3, strongMarket: 'na',
  prefixes: ['Pilot', 'Tungsten', 'Zire', 'Pre'],
  appearsYear: 1992, disappearsYear: 2010,
  initialMoney: 45000, initialFactories: 3, minMargin: 0.2,
  regions: { na: 1992, eu: 1995 },
  stockBase: 130, revenueBase: 40000,
  strengths: ['独自のPalm OSによる圧倒的使いやすさ', 'シリコンバレーの革新的な文化'],
  eras: [{ start: 1996, end: 2003, type: 'golden', name: 'PDAブーム', buff: 2.5, desc: '「Palm Pilot」がビジネスマンの必須アイテムに。' }],
  history: [{ year: 1996, product: 'Palm Pilot', desc: '手書き入力「Graffiti」を備えた革新的端末。' }],
  mergerDestiny: { year: 2010, type: 'ABSORPTION', partner: 'google' }
};
