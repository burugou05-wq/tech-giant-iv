export const blackberry = {
  name: 'BlackBerry', color: 'bg-violet-600', textColor: 'text-violet-400',
  trait: 'ビジネス・セキュリティ', strategy: 'innovator', priceTarget: 'premium', brand: 0.5,
  updateChance: 0.03, appealMod: 1.25, strongMarket: 'na',
  prefixes: ['BlackBerry', 'Curve', 'Bold', 'Passport'],
  appearsYear: 1999, disappearsYear: 2016,
  initialMoney: 80000, minMargin: 0.45,
  regions: { na: 1999, eu: 2002 },
  stockBase: 110, revenueBase: 80000,
  strengths: ['物理キーボードの快適性', '圧倒的なセキュリティ', '北米ビジネスマンの必須ツール'],
  eras: [
    { start: 2002, end: 2010, type: 'golden', name: 'ビジネススマホの覇者', buff: 2.0, desc: '世界中のビジネスマンがBlackBerryを持つ「クラックベリー」現象を巻き起こした。' },
    { start: 2012, end: 2016, type: 'dark',   name: 'フルタッチへの敗北', buff: 0.3, desc: 'iPhone型のタッチパネル操作への対応が遅れ、壊滅的な打撃を受けた。' },
  ],
  history: [
    { year: 2002, product: 'BlackBerry 5810', desc: 'メールが打てる携帯電話として大ヒット。' },
    { year: 2008, product: 'Bold',             desc: 'ビジネススマートフォンの頂点を極める。' },
  ],
};
