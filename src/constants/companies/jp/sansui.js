export const sansui = {
  name: 'Sansui', color: 'bg-black', textColor: 'text-zinc-400',
  trait: 'アンプの至宝', strategy: 'innovator', priceTarget: 'premium', brand: 0.6,
  updateChance: 0.02, appealMod: 1.2, strongMarket: 'jp',
  prefixes: ['Sansui', 'AU-', 'Alpha', 'Diamond'],
  appearsYear: 1947, disappearsYear: 2014,
  initialMoney: 35000, initialFactories: 3, minMargin: 0.35,
  regions: { jp: 1947, na: 1965, eu: 1970 },
  stockBase: 140, revenueBase: 30000,
  strengths: ['世界最高峰のアンプ回路技術', 'オーディオマニアからの絶大な信頼', '妥協のない物量投入'],
  eras: [{ start: 1970, end: 1985, type: 'golden', name: 'オーディオ御三家', buff: 1.5, desc: 'サンスイのアンプがステレオの最高峰として君臨。' }],
  history: [{ year: 1976, product: 'AU-D907', desc: '伝説的な名機として語り継がれるアンプ。' }]
};
