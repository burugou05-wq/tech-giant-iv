export const kenwood = {
  name: 'Kenwood', color: 'bg-red-900', textColor: 'text-white',
  trait: '音と通信のプロ', strategy: 'innovator', priceTarget: 'premium', brand: 0.55,
  updateChance: 0.04, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['Kenwood', 'Trio', 'Kansai'],
  appearsYear: 1946, disappearsYear: 2008,
  initialMoney: 45000, initialFactories: 6, minMargin: 0.2,
  regions: { jp: 1946, na: 1975, eu: 1970 },
  stockBase: 100, revenueBase: 50000,
  strengths: ['世界トップの無線通信技術', 'スタイリッシュなデザイン', 'カーオーディオでの高いシェア'],
  history: [{ year: 1980, product: 'KRC-922', desc: 'カーオーディオの名機を次々と輩出。' }],
  mergerDestiny: { year: 2008, type: 'MERGER', partner: 'victor' }
};
