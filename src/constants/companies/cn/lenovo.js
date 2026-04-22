export const lenovo = {
  name: 'Lenovo', color: 'bg-red-600', textColor: 'text-red-200',
  trait: '規模の支配者', strategy: 'cost_leader', priceTarget: 'budget', brand: 0.3,
  updateChance: 0.05, appealMod: 0.95, strongMarket: 'cn',
  prefixes: ['IdeaPad', 'ThinkPad', 'Yoga', 'Legion', 'Lenovo'],
  appearsYear: 1985, disappearsYear: 9999,
  initialMoney: 180000, initialFactories: 12, minMargin: 0.05,
  regions: { cn: 1985, na: 2005, eu: 2005, jp: 2005 },
  stockBase: 140, revenueBase: 150000,
  strengths: ['世界最大のPCシェア', 'IBMから継承したブランド力', '圧倒的なサプライチェーン'],
  eras: [
    { start: 2005, end: 9999, type: 'golden', name: 'IBM PC事業買収', buff: 1.6, desc: 'ThinkPadブランドを手に入れ、世界市場での信頼を確立。' },
  ],
  history: [
    { year: 1984, product: 'Legend PC',       desc: '北京の小さな研究所からスタート。' },
    { year: 2005, product: 'ThinkPad X',     desc: 'IBMのPC部門を買収し、世界に衝撃を与えた。' },
  ],
};
