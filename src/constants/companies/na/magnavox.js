export const magnavox = {
  name: 'Magnavox', color: 'bg-blue-900', textColor: 'text-blue-100',
  trait: 'コンシューマー・エレクトロニクスの老舗', strategy: 'follower', priceTarget: 'budget', brand: 0.5,
  updateChance: 0.03, appealMod: 1.0, strongMarket: 'na',
  prefixes: ['Magnavox', 'Odyssey', 'Profile'],
  appearsYear: 1946, disappearsYear: 1974,
  initialMoney: 80000, initialFactories: 10, minMargin: 0.15,
  regions: { na: 1946 },
  stockBase: 100, revenueBase: 60000,
  strengths: ['世界初の家庭用ゲーム機の特許', '堅実なラジオ・テレビ製造'],
  history: [{ year: 1972, product: 'Odyssey', desc: '世界初の家庭用ビデオゲーム機。' }],
  mergerDestiny: { year: 1974, type: 'ABSORPTION', partner: 'philips' }
};
