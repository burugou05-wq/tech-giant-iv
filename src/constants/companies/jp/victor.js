export const victor = {
  name: 'Victor', color: 'bg-zinc-800', textColor: 'text-yellow-400',
  trait: '映像の先駆者・VHSの父', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.65,
  updateChance: 0.03, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['JVC', 'Victor', 'VHS', 'Dynastron'],
  appearsYear: 1946, disappearsYear: 2008,
  initialMoney: 60000, initialFactories: 8, minMargin: 0.15,
  regions: { jp: 1946, na: 1960, eu: 1965 },
  stockBase: 120, revenueBase: 80000,
  strengths: ['VHSによる世界標準の獲得', '高画質・高音質へのこだわり', 'スタジオ用機材の信頼性'],
  eras: [{ start: 1976, end: 1990, type: 'golden', name: 'VHS覇権', buff: 2.0, desc: '規格争いに勝利し、ビデオ文化の頂点に立つ。' }],
  history: [{ year: 1976, product: 'HR-3300', desc: '世界初の家庭用VHSビデオレコーダー。' }],
  mergerDestiny: { year: 2008, type: 'MERGER', partner: 'kenwood' }
};
