export const grundig = {
  name: 'Grundig', color: 'bg-green-800', textColor: 'text-white',
  trait: 'ドイツの信頼・ラジオの王', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.6,
  updateChance: 0.03, appealMod: 1.1, strongMarket: 'eu',
  prefixes: ['Grundig', 'Satellit', 'Fine Arts'],
  appearsYear: 1946, disappearsYear: 2003,
  initialMoney: 75000, initialFactories: 9, minMargin: 0.15,
  regions: { eu: 1946, na: 1960 },
  stockBase: 110, revenueBase: 70000,
  strengths: ['欧州市場での強固な信頼', '高品質な短波ラジオ技術', '重厚長大な製品設計'],
  eras: [{ start: 1950, end: 1975, type: 'golden', name: '欧州の巨人', buff: 1.6, desc: '欧州最大のラジオ製造メーカーとして君臨。' }],
  history: [{ year: 1952, product: 'Television 52', desc: 'ドイツ初の量産型テレビ。' }],
  mergerDestiny: { year: 2003, type: 'ABSORPTION', partner: 'philips' }
};
