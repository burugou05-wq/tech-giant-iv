export const motorola = {
  name: 'Motorola', color: 'bg-red-500', textColor: 'text-red-400',
  trait: '通信の先駆者', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.6,
  updateChance: 0.03, appealMod: 1.1, strongMarket: 'na',
  prefixes: ['Moto', 'Dyna', 'Star', 'RAZR'],
  appearsYear: 1946, disappearsYear: 2012,
  initialMoney: 180000, initialFactories: 12, minMargin: 0.30,
  regions: { na: 1946, eu: 1980, jp: 1990 },
  stockBase: 150, revenueBase: 120000,
  strengths: ['北米の通信インフラ', '初期の携帯電話技術', '軍事・業務用の信頼性'],
  eras: [
    { start: 1983, end: 1998, type: 'golden', name: 'モバイルの先駆者', buff: 2.0, desc: '世界初の携帯電話を発売し、通信業界の絶対王者として君臨。' },
    { start: 2007, end: 2012, type: 'dark',   name: 'スマホ革命への乗り遅れ', buff: 0.5, desc: 'iPhoneの登場に対応できず、携帯電話部門が縮小。' },
  ],
  history: [
    { year: 1983, product: 'DynaTAC',        desc: '世界初の商用携帯電話。' },
    { year: 2004, product: 'RAZR',           desc: '超薄型携帯電話で世界的なヒット。' },
  ],
};
