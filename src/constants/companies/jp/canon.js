export const canon = {
  name: 'Canon', color: 'bg-red-700', textColor: 'text-red-500',
  trait: '精密・光学特化', strategy: 'innovator', priceTarget: 'premium', brand: 0.5,
  updateChance: 0.03, appealMod: 1.15, strongMarket: 'jp',
  prefixes: ['EOS', 'IXY', 'PowerShot', 'Pixus'],
  appearsYear: 1946, disappearsYear: 9999,
  initialMoney: 150000, minMargin: 0.35,
  regions: { jp: 1946, na: 1955, eu: 1960 },
  stockBase: 160, revenueBase: 110000,
  strengths: ['世界屈指の光学・レンズ技術', 'レーザープリンタの圧倒的シェア', '高い自己資本比率と健全経営'],
  eras: [
    { start: 1987, end: 2005, type: 'golden', name: 'EOSの衝撃', buff: 1.7, desc: '電子マウントAF一眼レフで、プロからアマチュアまで市場を独占。' },
  ],
  history: [
    { year: 1987, product: 'EOS 650',        desc: '完全電子マウントの一眼レフでカメラの歴史を変えた。' },
    { year: 2000, product: 'Digital IXY',    desc: 'デジカメ市場でも圧倒的なブランド力を発揮。' },
  ],
};
