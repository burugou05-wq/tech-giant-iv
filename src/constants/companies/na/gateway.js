export const gateway = {
  name: 'Gateway', color: 'bg-white', textColor: 'text-black',
  trait: '牛柄のPC直販', strategy: 'follower', priceTarget: 'mainstream', brand: 0.45,
  updateChance: 0.05, appealMod: 1.1, strongMarket: 'na',
  prefixes: ['Gateway', 'Performance', 'Solo'],
  appearsYear: 1985, disappearsYear: 2007,
  initialMoney: 60000, initialFactories: 5, minMargin: 0.1,
  regions: { na: 1985, eu: 1990 },
  stockBase: 80, revenueBase: 45000,
  strengths: ['直販モデルによるコスト削減', '親しみやすいブランド戦略'],
  eras: [{ start: 1990, end: 1998, type: 'golden', name: 'PC直販の旗手', buff: 1.8, desc: '低価格な高性能PCを武器に急成長。' }],
  history: [{ year: 1991, product: 'Cow Box PC', desc: '独特の牛柄デザインで一躍有名に。' }],
  mergerDestiny: { year: 2007, type: 'ABSORPTION', partner: 'lenovo' }
};
