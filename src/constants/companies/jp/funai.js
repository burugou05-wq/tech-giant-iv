export const funai = {
  name: 'Funai', color: 'bg-blue-600', textColor: 'text-white',
  trait: 'OEMの魔術師・格安王', strategy: 'cost_leader', priceTarget: 'budget', brand: 0.2,
  updateChance: 0.05, appealMod: 0.9, strongMarket: 'na',
  prefixes: ['Funai', 'Symphonic', 'Magnavox', 'Emerson'],
  appearsYear: 1961, disappearsYear: 2024,
  initialMoney: 20000, initialFactories: 4, minMargin: 0.03,
  regions: { jp: 1961, na: 1980 },
  stockBase: 30, revenueBase: 25000,
  strengths: ['圧倒的なコスト競争力', '北米大手小売との強力なパイプ', '無駄を削ぎ落とした設計'],
  eras: [{ start: 1990, end: 2005, type: 'golden', name: '北米シェアトップ', buff: 1.5, desc: '格安テレビで北米市場のシェアを独占。' }],
  history: [{ year: 1980, product: 'Compact VCR', desc: '世界最小のビデオレコーダーを開発。' }]
};
