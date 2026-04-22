export const atari = {
  name: 'Atari', color: 'bg-red-600', textColor: 'text-white',
  trait: 'ビデオゲームの創始者', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.7,
  updateChance: 0.08, appealMod: 1.3, strongMarket: 'na',
  prefixes: ['Atari', 'VCS', 'ST', 'Jaguar'],
  appearsYear: 1972, disappearsYear: 1984,
  initialMoney: 100000, initialFactories: 6, minMargin: 0.2,
  regions: { na: 1972, eu: 1978, jp: 1980 },
  stockBase: 150, revenueBase: 100000,
  strengths: ['世界初のビデオゲームブームの牽引', '独創的なハードウェア設計', '圧倒的な娯楽ブランド'],
  eras: [{ start: 1977, end: 1982, type: 'golden', name: 'Atariの春', buff: 2.5, desc: 'Atari 2600が全米の家庭を支配。' }],
  history: [{ year: 1972, product: 'Pong', desc: '世界初の商業的成功を収めたビデオゲーム。' }]
};
