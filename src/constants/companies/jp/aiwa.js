export const aiwa = {
  name: 'Aiwa', color: 'bg-red-700', textColor: 'text-white',
  trait: '若者の味方・オーディオ専門', strategy: 'follower', priceTarget: 'budget', brand: 0.35,
  updateChance: 0.05, appealMod: 1.1, strongMarket: 'jp',
  prefixes: ['Aiwa', 'Excelia', 'Strasser', 'Carry'],
  appearsYear: 1951, disappearsYear: 2002,
  initialMoney: 30000, initialFactories: 3, minMargin: 0.05,
  regions: { jp: 1951, na: 1970, eu: 1975 },
  stockBase: 40, revenueBase: 15000,
  strengths: ['低価格ながら高い音質', '若年層への圧倒的なブランド力', 'ヘッドホンステレオのヒット'],
  eras: [
    { start: 1980, end: 1995, type: 'golden', name: 'オーディオのアイワ', buff: 1.6, desc: '低価格なポータブルオーディオで世界シェアを席巻。' },
  ],
  history: [
    { year: 1964, product: 'Cassette Recorder', desc: '日本初のカセットレコーダーを発売。' },
    { year: 1980, product: 'TP-S30',           desc: '超小型のポータブル再生機。' },
  ],
  mergerDestiny: { year: 2002, type: 'ABSORPTION', partner: 'player' }, // プレイヤー(ソニー)に吸収
};
