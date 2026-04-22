export const panasonic = {
  name: 'Panasonic', color: 'bg-blue-900', textColor: 'text-blue-400',
  trait: '品質・信頼型', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.75,
  updateChance: 0.030, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['Panasonic', 'National', 'Lumix', 'Technics'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 200000, initialFactories: 15, minMargin: 0.20,
  regions: { jp: 1946, na: 1970, eu: 1980, cn: 1985 },
  stockBase: 110, revenueBase: 150000,
  strengths: ['家電の王様', '強力な系列店ネットワーク', '圧倒的な量産力'],
  eras: [
    { start: 1955, end: 1980, type: 'golden', name: 'ナショナル黄金時代', buff: 1.6, desc: '「三種の神器」を日本中に普及させ、家電のトップランナーに君臨。' },
    { start: 2008, end: 2014, type: 'dark',   name: 'プラズマの敗北', buff: 0.7, desc: 'プラズマテレビへの過度な投資が裏目に出て、巨額赤字を計上。' },
  ],
  history: [
    { year: 1955, product: 'National TV',    desc: '日本中の家庭にテレビを普及させた。' },
    { year: 2000, product: 'Viera',          desc: 'プラズマテレビで一時代を築く。' },
  ],
};
