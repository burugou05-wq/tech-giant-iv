import { AI_COMPANIES } from './companies/index.js';

export { AI_COMPANIES };

export const CONTENT_INVESTMENTS = [
  { id: 'music_label',       name: 'ソニー・ミュージック設立', cost: 15000, target: 'audio',        appealBuff: 1.3, desc: 'オーディオ機器の魅力度UP' },
  { id: 'game_dev',          name: 'プレイステーション展開',  cost: 25000, target: 'digital',      appealBuff: 1.4, desc: 'デジタル機器の魅力度UP' },
  { id: 'movie_studio',      name: 'コロンビア・ピクチャーズ買収', cost: 40000, target: 'video',        appealBuff: 1.2, desc: '全カテゴリの魅力度UP' },
  { id: 'streaming_service', name: 'ソニー・ピクチャーズ・コア',    cost: 80000, target: 'smart_device', appealBuff: 1.5, desc: 'スマートデバイスの魅力度UP' },
];
