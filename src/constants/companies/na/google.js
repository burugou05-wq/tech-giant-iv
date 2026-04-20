export const google = {
  name: 'Google', color: 'bg-amber-500', textColor: 'text-amber-400',
  trait: 'デジタル覇者', strategy: 'innovator', priceTarget: 'premium', brand: 0.8,
  updateChance: 0.05, appealMod: 1.25, strongMarket: 'na',
  prefixes: ['Pixel', 'Android', 'Chrome', 'Google', 'Nest'],
  appearsYear: 1998, disappearsYear: 9999,
  initialMoney: 100000, initialFactories: 5, minMargin: 0.25,
  regions: { na: 1998, eu: 2000, jp: 2002 },
  stockBase: 175, revenueBase: 250000,
  strengths: ['インターネットの入り口を独占', '世界最大の広告プラットフォーム', 'Androidによるモバイル支配'],
  eras: [
    { start: 2008, end: 2025, type: 'golden', name: 'モバイルOSの支配', buff: 1.7, desc: 'Androidが世界シェア8割を超え、モバイル・エコシステムの中心に。' },
  ],
  history: [
    { year: 1998, product: 'Google Search',   desc: '世界を変えた検索エンジン。' },
    { year: 2008, product: 'Android OS',      desc: 'モバイルOSで世界トップシェアに。' },
  ],
};
