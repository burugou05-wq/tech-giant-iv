export const SPIRIT_DEF = {
  startup:       { id: 'startup',       name: '野心的な企業',  icon: 'TrendingUp',    color: 'text-blue-400',   desc: '世界を制する野心を持っています。' },
  craftsmanship: { id: 'craftsmanship', name: '職人魂',        icon: 'Wrench',        color: 'text-orange-400', desc: '技術至上主義。RP獲得量が増加しますが、製造コストが重いです。' },
  userCentric:   { id: 'userCentric',   name: '体験至上主義',  icon: 'Target',        color: 'text-pink-400',   desc: '体験を重視。広告効果とシナジーが高まっています。' },
  bureaucracy:   { id: 'bureaucracy',   name: '巨大企業病',    icon: 'AlertTriangle', color: 'text-red-500',    desc: '部門間の壁が厚く、開発速度と生産効率が低下しています。' },
  oneCompany:    { id: 'oneCompany',    name: 'One Company',   icon: 'Globe',         color: 'text-indigo-400', desc: '全社一丸のエコシステム。凄まじいシナジーを生み出します。' },
  strike:        { id: 'strike',        name: 'ストライキ発生中', icon: 'AlertCircle', color: 'text-red-600',    desc: '労働争議により生産活動が深刻なダメージを受けています。' },
};

export const CORPORATE_FOCUSES = [
  // --- Main Tree (1940s-1950s) ---
  { id: 'fc_start',          tree: 'main',       name: '設立趣意書の策定',       era: 1946, lpCost: 40,  req: [],                          reqType: 'all', excl: [],               x: 650,  y: 120, desc: '「真面目ナル技術者ノ技能ヲ、最高度ニ発揮セシムベキ...」',                              effects: {} },
  { id: 'fc_tech_first',     tree: 'main',       name: '技術至上主義',          era: 1950, lpCost: 80,  req: ['fc_start'],                reqType: 'all', excl: ['fc_exp_first'], x: 420,  y: 280, desc: 'RP獲得+50%、製造コスト+20%',                                   effects: { rpMulti: 1.5, costMulti: 1.2, unlockTree: 'overseas' } },
  { id: 'fc_exp_first',      tree: 'main',       name: '体験至上主義',          era: 1950, lpCost: 80,  req: ['fc_start'],                reqType: 'all', excl: ['fc_tech_first'],x: 880,  y: 280, desc: '広告効率+30%、ソフトシナジー強化',                             effects: { marketingMulti: 1.3, synergyMulti: 1.2, unlockTree: 'overseas' } },
  { id: 'fc_transistor',     tree: 'main',       name: 'トランジスタ自社生産',  era: 1955, lpCost: 100, req: ['fc_tech_first'],           reqType: 'all', excl: [],               x: 260,  y: 500, desc: '工場の維持費（固定費）が20%減少。',                             effects: { factoryCostMulti: 0.8 } },
  
  // --- 1960s-1970s Hardware & Design ---
  { id: 'fc_color_tv_focus', tree: 'main',       name: '独自ブラウン管の開発',  era: 1965, lpCost: 150, req: ['fc_transistor'],           reqType: 'all', excl: [],               x: 260,  y: 650, desc: '高品質TVの代名詞へ。全製品の品質上限+10%、コスト+10%。',       effects: { qualityCap: 90, costMulti: 1.1 } },
  { id: 'fc_design_focus',   tree: 'main',       name: 'デザイン主導',          era: 1960, lpCost: 100, req: ['fc_exp_first'],            reqType: 'all', excl: [],               x: 1240, y: 500, desc: '全製品の基礎魅力度が永続的に+20%。',                           effects: { appealMulti: 1.2 } },
  { id: 'fc_walkman_gen',    tree: 'main',       name: 'ポータブル革命',        era: 1975, lpCost: 180, req: ['fc_design_focus'],         reqType: 'all', excl: [],               x: 1240, y: 650, desc: 'オーディオカテゴリの魅力度がさらに1.5倍に。',                  effects: { audioBuff: 1.5 } },

  // --- Standards Strategy (1970s-1980s) ---
  { id: 'fc_prop_std',       tree: 'main',       name: '独自規格の覇権',        era: 1970, lpCost: 120, req: ['fc_tech_first'],           reqType: 'all', excl: ['fc_open_std'],  x: 620,  y: 500, desc: 'シェア50%以上で利益爆増、未満で需要急減。',                    effects: { propBonus: true } },
  { id: 'fc_open_std',       tree: 'main',       name: 'オープン戦略',          era: 1970, lpCost: 120, req: ['fc_exp_first'],            reqType: 'all', excl: ['fc_prop_std'],  x: 980,  y: 500, desc: '製造コスト-20%、B2B収益確保。',                                effects: { costMulti: 0.8, openB2B: true } },

  // --- Overseas Expansion (1960s-1980s) ---
  { id: 'fc_global_entry',   tree: 'overseas',   name: '海外展開戦略',          era: 1960, lpCost: 4,   req: ['fc_exp_first','fc_tech_first'], reqType: 'any', excl: [],               x: 1540, y: 260, desc: '日本市場での技術力を武器に、北米・欧州市場へ展開する。',        effects: { openOverseas: true } },
  { id: 'fc_direct_store',   tree: 'overseas',   name: '直営店創設',            era: 1970, lpCost: 100, req: ['fc_global_entry'],        reqType: 'all', excl: [],               x: 1540, y: 420, desc: '海外で直営店ネットワークを構築し、売り上げとブランド力を強化。', effects: { allowDirectStore: true } },
  { id: 'fc_global_brand',   tree: 'overseas',   name: 'グローバルブランド化',  era: 1980, lpCost: 150, req: ['fc_direct_store'],        reqType: 'all', excl: [],               x: 1540, y: 580, desc: '海外市場でのマーケティング効率が永続的に+50%。',               effects: { marketingMulti: 1.5 } },

  // --- Content Synergy (1980s-1990s) ---
  { id: 'fc_content_acq',    tree: 'main',       name: '巨大コンテンツ買収',    era: 1985, lpCost: 200, req: ['fc_prop_std','fc_open_std'],reqType: 'any', excl: [],               x: 800,  y: 650, desc: '莫大な資金($50,000k)で海外映画スタジオを買収。シナジー激増。', effects: { instantMoney: -50000, synergyMulti: 1.5 } },

  // --- Silo Crisis (1990s-2000s) ---
  { id: 'fc_silo_crisis',    tree: 'main',       name: '巨大企業病への対処',    era: 1990, lpCost: 50,  req: ['fc_content_acq'],          reqType: 'all', excl: [],               x: 800,  y: 800, desc: 'サイロ化問題の解決策の検討に入る。',                            effects: {} },
  { id: 'fc_divisional',     tree: 'main',       name: 'カンパニー制導入',      era: 1994, lpCost: 160, req: ['fc_silo_crisis'],          reqType: 'all', excl: ['fc_one_comp'],  x: 550,  y: 950, desc: '【解決策A】即時資金獲得。スマホ開発コストが5倍に。',           effects: { smartphoneCostMulti: 5.0, instantMoney: 500000, siloFix: true } },
  { id: 'fc_one_comp',       tree: 'main',       name: 'One Company',           era: 2005, lpCost: 260, req: ['fc_silo_crisis'],          reqType: 'all', excl: ['fc_divisional'],x: 1050, y: 950, desc: '【解決策B】完了後、魅力度+30%、スマホ開発コスト-30%',         effects: { appealMulti: 1.3, smartphoneCostMulti: 0.7, siloFix: true } },

  // --- Bubble Burst (1990s) ---
  { id: 'fc_bubble_start',   tree: 'bubble',     name: '失われた10年',          era: 1992, lpCost: 40,  req: [],                          reqType: 'all', excl: [],               x: 1100, y: 80,  desc: 'バブル崩壊。不況の時代をどう生き残るか。',                      effects: {} },
  { id: 'fc_restructure',    tree: 'bubble',     name: 'リストラ断行',          era: 1994, lpCost: 80,  req: ['fc_bubble_start'],         reqType: 'all', excl: ['fc_domestic'],  x: 950,  y: 200, desc: '資金を捻出するが、品質上限が低下する。',                        effects: { instantMoney: 300000, qualityCap: 80 } },
  { id: 'fc_domestic',       tree: 'bubble',     name: '内需偏重',              era: 1994, lpCost: 80,  req: ['fc_bubble_start'],         reqType: 'all', excl: ['fc_restructure'],x: 1250,y: 200, desc: '日本市場の需要が増すが、海外シェアが下がる。',                  effects: { jpBonus: true, globalPenalty: true } },

  // --- Smartphone Shock (2000s) ---
  { id: 'fc_sp_shock',       tree: 'smartphone', name: '黒船への回答',          era: 2007, lpCost: 50,  req: [],                          reqType: 'all', excl: [],               x: 1100, y: 480, desc: '競合のデバイスに対し、会社としての回答を出す。',                effects: {} },
  { id: 'fc_ignore_sp',      tree: 'smartphone', name: '従来型を維持',          era: 2007, lpCost: 80,  req: ['fc_sp_shock'],             reqType: 'all', excl: ['fc_catch_up'],  x: 950,  y: 600, desc: 'オーディオ機器に集中。オーディオ魅力度+50%。',                effects: { audioBuff: 1.5 } },
  { id: 'fc_catch_up',       tree: 'smartphone', name: '緊急スマホ開発',        era: 2007, lpCost: 150, req: ['fc_sp_shock'],             reqType: 'all', excl: ['fc_ignore_sp'], x: 1250, y: 600, desc: '莫大なリソースを投じる。スマホ開発コストの大幅減。',            effects: { smartphoneCostMulti: 0.5 } },

  // --- 2010s-2020s Recurring / Semiconductors ---
  { id: 'fc_service_shift',  tree: 'main',       name: 'リカーリングモデルへ',  era: 2012, lpCost: 200, req: ['fc_divisional', 'fc_one_comp'], reqType: 'any', excl: [],          x: 550,  y: 1100, desc: 'ハード売り切りから継続課金へ。B2B・定額収益が爆発的に増加。',effects: { openB2B: true, synergyMulti: 1.6 } },
  { id: 'fc_semi_dominance', tree: 'main',       name: 'イメージセンサー覇権',  era: 2015, lpCost: 250, req: ['fc_service_shift'],        reqType: 'all', excl: [],               x: 800,  y: 1250, desc: '半導体分野で世界を制覇。製造コスト-30%。',                    effects: { costMulti: 0.7 } },
  { id: 'fc_mobility',       tree: 'main',       name: '次世代モビリティ参入',  era: 2020, lpCost: 350, req: ['fc_semi_dominance'],       reqType: 'all', excl: [],               x: 1050, y: 1100, desc: 'EV事業へ参入。全ブランド力(魅力度)+50%。',                   effects: { appealMulti: 1.5 } },
];
