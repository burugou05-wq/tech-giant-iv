export const sharp = {
  name: 'Sharp', color: 'bg-rose-600', textColor: 'text-rose-400',
  trait: '液晶・技術先駆', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.55,
  updateChance: 0.025, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['Aquos', 'Zaurus', 'Plasmacluster', 'Sharp'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 110000, minMargin: 0.15,
  regions: { jp: 1946, na: 1970, eu: 1975 },
  stockBase: 105, revenueBase: 75000,
  strengths: ['世界をリードする液晶技術', '唯一無二のユニークな製品開発', '白物家電の安定したブランド'],
  eras: [
    { start: 2001, end: 2010, type: 'golden', name: '液晶の世紀', buff: 1.9, desc: '「世界の亀山モデル」として、大型液晶テレビで世界を席巻。' },
    { start: 2012, end: 2016, type: 'dark',   name: 'パネル投資の重圧', buff: 0.5, desc: '堺工場への巨額投資が裏目に出て、経営危機に直面。' },
  ],
  history: [
    { year: 1973, product: 'LCD Calculator', desc: '世界初の液晶表示電卓を発売。' },
    { year: 2001, product: 'Aquos TV',       desc: '液晶テレビブランドを確立し、ブラウン管を過去のものへ。' },
  ],
};
