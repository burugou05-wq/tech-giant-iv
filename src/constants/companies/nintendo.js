export const nintendo = {
  name: 'Nintendo', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-400',
  trait: '娯楽特化', strategy: 'innovator', priceTarget: 'budget',
  updateChance: 0.030, appealMod: 1.4, strongMarket: 'jp',
  prefixes: ['GameBoy', 'NES', 'SNES', 'N64', 'Switch'],
  appearsYear: 1977, disappearsYear: 9999,
  regions: { jp: 1977, na: 1985, eu: 1990 },
  stockBase: 140, revenueBase: 90000,
  strengths: ['ゲーム機の圧倒的ブランド', '強力な自社ソフトIP', '独自の遊びの哲学'],
  eras: [
    { start: 1983, end: 1995, type: 'golden', name: 'ファミコン・ブーム', buff: 2.0, desc: 'ビデオゲーム市場を崩壊から救い、家庭用ゲーム機の標準を確立した。' },
    { start: 2012, end: 2016, type: 'dark',   name: 'Wii Uの苦戦', buff: 0.7, desc: '次世代機の不振により、経営的に厳しい時期を過ごした。' },
  ],
  history: [
    { year: 1983, product: 'Famicom',        desc: '家庭用ゲーム機市場を爆発的に拡大させた。' },
    { year: 1989, product: 'GameBoy',        desc: '携帯ゲーム機という新市場を創出。' },
  ],
};
