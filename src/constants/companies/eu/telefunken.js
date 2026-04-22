export const telefunken = {
  name: 'Telefunken', color: 'bg-blue-700', textColor: 'text-white',
  trait: 'ドイツ放送技術の父', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.6,
  updateChance: 0.03, appealMod: 1.1, strongMarket: 'eu',
  prefixes: ['Telefunken', 'Palcolor', 'Magnetophon'],
  appearsYear: 1946, disappearsYear: 1985,
  initialMoney: 60000, initialFactories: 7, minMargin: 0.2,
  regions: { eu: 1946 },
  stockBase: 100, revenueBase: 45000,
  strengths: ['PAL方式（欧州TV規格）の開発', '業務用スタジオ機器の標準', '真空管・半導体の高度な技術'],
  history: [{ year: 1963, product: 'PAL System', desc: '欧州のカラーテレビ標準方式を開発。' }],
  mergerDestiny: { year: 1985, type: 'ABSORPTION', partner: 'siemens' }
};
