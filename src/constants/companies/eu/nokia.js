export const nokia = {
  name: 'Nokia', color: 'bg-sky-400', textColor: 'text-sky-300',
  trait: '北欧の携帯王者', strategy: 'innovator', priceTarget: 'mainstream', brand: 0.65,
  updateChance: 0.04, appealMod: 1.2, strongMarket: 'eu',
  prefixes: ['Nokia', 'Lumia', 'Communicator', 'N-Gage'],
  appearsYear: 1980, disappearsYear: 2014,
  initialMoney: 160000, minMargin: 0.28,
  regions: { eu: 1980, na: 1995, jp: 2000 },
  stockBase: 130, revenueBase: 160000,
  strengths: ['圧倒的な携帯電話シェア', '頑丈なハードウェア', '欧州市場の絶対的支配'],
  eras: [
    { start: 1998, end: 2007, type: 'golden', name: '携帯電話の王', buff: 2.2, desc: '世界の携帯電話シェアの4割を独占し、フィンランド経済を牽引した。' },
    { start: 2010, end: 2014, type: 'dark',   name: '燃えるプラットフォーム', buff: 0.4, desc: 'スマホへの転換に失敗し、王座から転落。' },
  ],
  history: [
    { year: 1998, product: 'Nokia 3210',     desc: '世界で最も売れた携帯電話の一つ。' },
    { year: 2007, product: 'Symbian OS',     desc: '一時代を築いたモバイルOSの王。' },
  ],
};
