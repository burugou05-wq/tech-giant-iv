export const sanyo = {
  name: 'Sanyo', color: 'bg-red-500', textColor: 'text-red-300',
  trait: 'コストパフォーマンス型', strategy: 'follower', priceTarget: 'budget', brand: 0.45,
  updateChance: 0.04, appealMod: 1.0, strongMarket: 'jp',
  prefixes: ['Sanyo', 'Eneloop', 'Gorilla', 'Xacti'],
  appearsYear: 1947, disappearsYear: 2011,
  initialMoney: 90000, minMargin: 0.08,
  regions: { jp: 1947, na: 1965, eu: 1970 },
  stockBase: 85, revenueBase: 60000,
  strengths: ['世界シェアトップの電池技術', '圧倒的なコストパフォーマンス', 'OEM供給での広範な存在感'],
  eras: [
    { start: 1960, end: 1980, type: 'golden', name: '家電の三洋', buff: 1.4, desc: '洗濯機やテレビでヒットを連発し、家電御三家の一角として急成長。' },
  ],
  history: [
    { year: 1953, product: 'Jet Washer',     desc: '噴流式洗濯機で大ヒットし、家庭の家事負担を激減させた。' },
    { year: 2005, product: 'Eneloop',        desc: '充電式電池のデファクトスタンダードを確立。' },
  ],
};
