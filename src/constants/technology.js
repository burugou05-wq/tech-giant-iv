export const START_DATE = new Date('1946-05-07');
export const ERAS = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export const CHASSIS_TECH = [
  { id: 'ch_rice_cooker',  name: '木製電気炊飯器',     era: 1940, cost: 0,     req: [],                peakYear: 1948, decay: 0.1,  slots: ['circuit','mechanic'], baseAppeal: 2,   baseCost: 1,  category: 'home_appliance' },
  { id: 'ch_megaphone',    name: '電気メガホン',       era: 1940, cost: 200,   req: [],                peakYear: 1950, decay: 0.05, slots: ['circuit','mechanic'], baseAppeal: 4,   baseCost: 2,  category: 'audio' },
  { id: 'ch_tape_recorder',name: 'G型テープコーダー',   era: 1950, cost: 500,   req: ['ch_megaphone'],  peakYear: 1958, decay: 0.04, slots: ['circuit','media','mechanic'], baseAppeal: 12,  baseCost: 4,  category: 'audio' },
  { id: 'ch_tr_radio',     name: 'トランジスタラジオ',   era: 1950, cost: 800,   req: ['ch_tape_recorder'], peakYear: 1965, decay: 0.03, slots: ['circuit','media','mechanic'], baseAppeal: 25,  baseCost: 5,  category: 'audio' },
  { id: 'ch_color_tv',     name: 'カラーテレビ',        era: 1960, cost: 1500,  req: ['ch_tr_radio'],   peakYear: 1978, decay: 0.02, slots: ['circuit','media','mechanic'], baseAppeal: 40,  baseCost: 15, category: 'video' },
  { id: 'ch_walkman',      name: 'ポータブルカセット',   era: 1970, cost: 2500,  req: ['ch_color_tv'],   peakYear: 1985, decay: 0.04, slots: ['circuit','media','mechanic'], baseAppeal: 65,  baseCost: 10, category: 'audio' },
  { id: 'ch_cd',           name: 'CDプレーヤー',        era: 1980, cost: 3500,  req: ['ch_walkman'],    peakYear: 1995, decay: 0.05, slots: ['circuit','media','mechanic'], baseAppeal: 90,  baseCost: 15, category: 'audio' },
  { id: 'ch_playstation',  name: '家庭用ゲーム機',      era: 1990, cost: 6000,  req: ['ch_cd'],         peakYear: 2005, decay: 0.04, slots: ['circuit','media','mechanic'], baseAppeal: 150, baseCost: 35, category: 'game_console' },
  { id: 'ch_mp3',          name: 'デジタルプレーヤー',   era: 1990, cost: 4500,  req: ['ch_cd'],         peakYear: 2008, decay: 0.06, slots: ['circuit','media','mechanic'], baseAppeal: 120, baseCost: 20, category: 'digital' },
  { id: 'ch_smartphone',   name: 'スマートフォン',       era: 2010, cost: 10000, req: ['ch_playstation', 'ch_mp3'], peakYear: 2018, decay: 0.05, slots: ['circuit','media','mechanic'], baseAppeal: 250, baseCost: 45, category: 'smart_device' },
  { id: 'ch_wearable',     name: '次世代ウェアラブル',   era: 2020, cost: 20000, req: ['ch_smartphone'], peakYear: 2028, decay: 0.04, slots: ['circuit','media','mechanic'], baseAppeal: 400, baseCost: 70, category: 'smart_device' },
];

export const COMPONENT_TECH = [
  { id: 'mod_wood_box',     name: '木製筐体',              era: 1940, cost: 0,     req: [],                     type: 'mechanic', appeal: 1,   costVal: 1  },
  { id: 'mod_heater_wire',  name: '電熱線',                era: 1940, cost: 0,     req: [],                     type: 'circuit',  appeal: 1,   costVal: 1  },
  { id: 'mod_vacuum_tube',  name: '真空管',                era: 1940, cost: 100,   req: [],                     type: 'circuit',  appeal: 5,   costVal: 3  },
  { id: 'mod_paper_cone',   name: '紙コーンスピーカー',     era: 1940, cost: 100,   req: ['mod_wood_box'],      type: 'mechanic', appeal: 3,   costVal: 2  },
  { id: 'mod_mag_tape',     name: '磁気テープヘッド',       era: 1950, cost: 300,   req: ['mod_vacuum_tube'],   type: 'media',    appeal: 10,  costVal: 4  },
  { id: 'mod_transistor',   name: '自社製トランジスタ',     era: 1950, cost: 500,   req: ['mod_vacuum_tube'],   type: 'circuit',  appeal: 20,  costVal: 6  },
  { id: 'mod_crt_tube',     name: 'ブラウン管',            era: 1960, cost: 800,   req: ['mod_transistor'],    type: 'media',    appeal: 25,  costVal: 10 },
  { id: 'mod_trinitron',    name: 'アパーチャーグリル管',   era: 1960, cost: 1200,  req: ['mod_crt_tube'],      type: 'media',    appeal: 45,  costVal: 15 },
  { id: 'mod_compact_motor',name: '超小型モーター',        era: 1970, cost: 1500,  req: ['mod_paper_cone'],    type: 'mechanic', appeal: 30,  costVal: 5  },
  { id: 'mod_stereo_hp',    name: 'ステレオヘッドホン',     era: 1970, cost: 1800,  req: ['mod_compact_motor'], type: 'mechanic', appeal: 45,  costVal: 8  },
  { id: 'mod_ic_board',     name: '集積回路(IC)基板',      era: 1970, cost: 2000,  req: ['mod_transistor'],    type: 'circuit',  appeal: 50,  costVal: 10 },
  { id: 'mod_optical_pickup',name:'光学ピックアップ(CD)',  era: 1980, cost: 2500,  req: ['mod_mag_tape'],      type: 'media',    appeal: 70,  costVal: 12 },
  { id: 'mod_lsi_chip',     name: '専用LSIチップ',         era: 1980, cost: 3000,  req: ['mod_ic_board'],      type: 'circuit',  appeal: 85,  costVal: 15 },
  { id: 'mod_cd_rom',       name: 'CD-ROMドライブ',        era: 1990, cost: 4000,  req: ['mod_optical_pickup'],type: 'media',    appeal: 110, costVal: 20 },
  { id: 'mod_flash_mem',    name: 'フラッシュメモリ',       era: 1990, cost: 4500,  req: ['mod_cd_rom'],        type: 'media',    appeal: 130, costVal: 25 },
  { id: 'mod_cpu_chip',     name: '独自アーキテクチャCPU',  era: 1990, cost: 5000,  req: ['mod_lsi_chip'],      type: 'circuit',  appeal: 160, costVal: 35 },
  { id: 'mod_lithium_batt', name: 'リチウムイオン電池',     era: 1990, cost: 4000,  req: ['mod_compact_motor'], type: 'mechanic', appeal: 100, costVal: 18 },
  { id: 'mod_mobile_soc',   name: 'モバイルSoC',           era: 2000, cost: 8000,  req: ['mod_cpu_chip'],      type: 'circuit',  appeal: 250, costVal: 45 },
  { id: 'mod_cloud_sync',   name: 'クラウド通信モジュール', era: 2010, cost: 7000,  req: ['mod_flash_mem'],     type: 'media',    appeal: 200, costVal: 30 },
  { id: 'mod_oled_touch',   name: '有機EL/タッチパネル',    era: 2010, cost: 9000,  req: ['mod_lithium_batt'],  type: 'mechanic', appeal: 220, costVal: 35 },
  { id: 'mod_ai_chip',      name: 'AI推論特化チップ',      era: 2020, cost: 18000, req: ['mod_mobile_soc'],    type: 'circuit',  appeal: 450, costVal: 70 },
  { id: 'mod_5g_comm',      name: '5G/6G超高速通信',       era: 2020, cost: 15000, req: ['mod_cloud_sync'],    type: 'media',    appeal: 350, costVal: 45 },
];
