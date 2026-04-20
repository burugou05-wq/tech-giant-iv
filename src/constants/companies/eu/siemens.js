export const siemens = {
  name: 'Siemens', color: 'bg-teal-500', textColor: 'text-teal-400',
  trait: '質実剛健・ドイツの雄', strategy: 'follower', priceTarget: 'premium', brand: 0.6,
  updateChance: 0.02, appealMod: 0.95, strongMarket: 'eu',
  prefixes: ['Siemens', 'Nixdorf', 'Gigaset', 'Euro'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 220000, initialFactories: 15, minMargin: 0.24,
  regions: { eu: 1946, na: 1960, jp: 1970 },
  stockBase: 200, revenueBase: 250000,
  strengths: ['欧州の通信インフラ支配', '産業用機器との連携', 'ドイツの精密技術'],
  eras: [
    { start: 1950, end: 1975, type: 'golden', name: '欧州復興の担い手', buff: 1.3, desc: '戦後欧州のインフラ整備と通信網構築で巨大な利益を上げた。' },
  ],
  history: [
    { year: 1955, product: 'Tele Radio',      desc: '欧州で広く普及した通信機。' },
    { year: 1995, product: 'Siemens Mobile',  desc: '初期の携帯電話市場で一定のシェア。' },
  ],
};
