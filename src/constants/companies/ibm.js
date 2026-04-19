export const ibm = {
  name: 'IBM', color: 'bg-blue-800', textColor: 'text-blue-300',
  trait: 'コンピュータの巨人', strategy: 'innovator', priceTarget: 'premium',
  updateChance: 0.015, appealMod: 1.1, strongMarket: 'na',
  prefixes: ['ThinkPad', 'System/360', 'IBM PC', 'Power', 'DeepBlue'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 400000, minMargin: 0.35,
  regions: { na: 1946, eu: 1955, jp: 1960 },
  stockBase: 280, revenueBase: 250000,
  strengths: ['コンピュータ業界の絶対的な標準', '強固な法人向けチャネル', '世界最高の研究開発力'],
  eras: [
    { start: 1964, end: 1980, type: 'golden', name: 'メインフレームの支配', buff: 1.8, desc: 'System/360の成功により、世界のコンピュータ市場を独占。' },
  ],
  history: [
    { year: 1964, product: 'System/360',    desc: 'コンピュータの互換性の概念を確立。' },
    { year: 1981, product: 'IBM PC',         desc: 'パーソナルコンピュータのデファクトスタンダードを創出した。' },
  ],
};
