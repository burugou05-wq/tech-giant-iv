export const xiaomi = {
  name: 'Xiaomi', color: 'bg-orange-500', textColor: 'text-orange-100',
  trait: '格安・スピード型', strategy: 'innovator', priceTarget: 'budget', brand: 0.2,
  updateChance: 0.08, appealMod: 1.1, strongMarket: 'cn',
  prefixes: ['Mi', 'Redmi', 'Poco', 'Xiaomi'],
  appearsYear: 2010, disappearsYear: 9999,
  initialMoney: 50000, initialFactories: 9, minMargin: 0.05, // 低マージン戦略
  regions: { cn: 2010, eu: 2017, jp: 2019, na: 2020 },
  stockBase: 130, revenueBase: 120000,
  strengths: ['究極のコストパフォーマンス', 'ファンとの密接なコミュニティ', 'あらゆる家電を繋ぐエコシステム'],
  eras: [
    { start: 2014, end: 2016, type: 'golden', name: 'オンライン販売の衝撃', buff: 1.5, desc: '広告費を削り、SNSとオンライン直販で中国シェア1位を獲得。' },
  ],
  history: [
    { year: 2010, product: 'MIUI',           desc: '独自のOSカスタマイズからスタート。' },
    { year: 2011, product: 'Mi 1',           desc: '競合の半額という衝撃的な価格でスマホ市場に参入。' },
  ],
};
