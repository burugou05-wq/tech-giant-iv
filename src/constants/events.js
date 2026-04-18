export const HISTORICAL_EVENTS = [
  {
    id: 'korean_war_boom',
    year: 1950,
    flagKey: 'koreanWarBoom',
    title: '朝鮮戦争特需',
    desc: '朝鮮戦争による米軍の調達需要が急増しています。この機会を活かして資金を調達しますか？',
    options: [{ label: '軍需品を受注する (+$8,000k)', action: 'korean_war_money' }],
  },
  {
    id: 'tokyo_olympics_tv',
    year: 1964,
    flagKey: 'tokyoOlympics',
    title: '東京オリンピック開催',
    desc: '東京オリンピックに向け、カラーテレビの需要が国内で急増しています！この好機を掴みますか？',
    options: [{ label: 'テレビ需要を最大化する', action: 'tokyo_olympics_demand' }],
  },
  {
    id: 'oil_shock',
    year: 1973,
    flagKey: 'oilShock',
    title: 'オイルショック発生',
    desc: '中東紛争による石油危機が発生。製造コストが全世界で急騰しています。',
    options: [{ label: '省エネ生産体制へ転換', action: 'oil_shock_adapt' }],
  },
  {
    id: 'plaza_accord',
    year: 1985,
    flagKey: 'plazaAccord',
    title: 'プラザ合意',
    desc: 'G5諸国がドル高是正に合意。急激な円高が進行し、輸出競争力が激減します。',
    options: [
      { label: '海外生産移転を検討する',   action: 'plaza_overseas' },
      { label: '国内高品質路線を維持する', action: 'plaza_quality' },
    ],
  },
  {
    id: 'bubble_burst_event',
    year: 1992,
    flagKey: 'bubbleBurst',
    title: 'バブルの崩壊',
    desc: '日本市場の異常な好景気が終わりました。不況に対応するための「危機対応ツリー」が企業方針に追加されました。',
    options: [{ label: '方針を確認する', action: 'unlock_bubble_tree' }],
  },
  {
    id: 'dot_com_bubble',
    year: 2000,
    flagKey: 'dotComBubble',
    title: 'ITバブル崩壊',
    desc: 'インターネットバブルが崩壊し、ハイテク株が暴落。北米・欧州市場での需要が一時的に急減します。',
    options: [{ label: '嵐が過ぎるのを待つ', action: 'dot_com_wait' }],
  },
  {
    id: 'smartphone_shock',
    year: 2007,
    flagKey: 'spShocked',
    title: '黒船の襲来',
    desc: '競合Pineapple社が「スマートフォン」を発表。新ツリーが解放されました。',
    options: [{ label: '緊急会議を開く', action: 'unlock_smartphone_tree' }],
  },
  {
    id: 'lehman_shock',
    year: 2008,
    flagKey: 'lehmanShock',
    title: 'リーマンショック',
    desc: '米大手投資銀行の破綻により、世界同時不況が到来。全市場での需要が急減し、株価が暴落します。',
    options: [
      { label: 'コスト削減を徹底する', action: 'lehman_cut_cost' },
      { label: '逆張り投資を行う',     action: 'lehman_invest' },
    ],
  },
];

export const RANDOM_EVENTS = [
  {
    id: 'yen_appreciation',
    title: '円高ドル安の進行',
    desc: '急激な円高が進行し、国外からの売上収益が大幅に減少します。',
    options: [{ label: '耐え抜く', action: 'macro_yen_high' }],
    condition: (state, calcYear) => !state.markets.na.locked && calcYear >= 1971, // ニクソン・ショック以降
  },
  {
    id: 'eu_reg',
    title: '欧州環境規制の強化',
    desc: '欧州市場で製品を販売するには追加のコンプライアンス費用が必要です。',
    options: [{ label: '規制に対応 ($5/個コスト増)', action: 'macro_eu_cost' }],
    condition: (state, calcYear) => !state.markets.eu.locked && calcYear >= 1993,
  },
  {
    id: 'labor_strike',
    title: '工場労働者のストライキ',
    desc: '待遇改善を求めて労働者がストライキを起こしました。生産効率が大幅に低下します。',
    options: [{ label: '対応を急ぐ', action: 'start_strike' }],
  },
  {
    id: 'patent_lawsuit',
    title: '特許紛争の勃発',
    desc: '競合他社が技術特許を主張し、あなたの製品ラインに圧力がかかっています。タイミングよく対応する必要があります。',
    options: [
      { label: '法務戦略で戦う (LP30 + $12,000k)', action: 'fight_patent' },
      { label: '和解して先行投資 ( $18,000k )', action: 'settle_patent' },
    ],
  },
];
