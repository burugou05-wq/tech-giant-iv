export type Category = 'home_appliance' | 'audio' | 'video' | 'digital' | 'smart_device' | 'game_console';

export interface Chassis {
  id: string;
  name: string;
  era: number;
  cost: number;
  req: string[];
  peakYear: number;
  decay: number;
  slots: string[];
  baseAppeal: number;
  baseCost: number;
  category: Category;
}

export interface Component {
  id: string;
  name: string;
  era: number;
  cost: number;
  req: string[];
  type: string;
  appeal: number;
  costVal: number;
}

export interface Blueprint {
  id: string;
  name: string;
  chassisId: string;
  moduleIds: Record<string, string>;
  cost: number;
  appeal: number;
}

export interface ProductionLine {
  id: number;
  blueprintId: string | null;
  factories: number;
  efficiency: number;
}

export interface Market {
  name: string;
  demand: number;
  shares: {
    player: number;
    pineapple: number;
    mony: number;
    samstar: number;
    [key: string]: number;
  };
  marketing: number;
  stores: number;
  locked: boolean;
}

export interface CorporateFocus {
  id: string;
  tree: string;
  name: string;
  era: number;
  lpCost: number;
  req: string[];
  reqType: 'all' | 'any';
  excl: string[];
  x: number;
  y: number;
  desc: string;
  effects: {
    rpMulti?: number;
    costMulti?: number;
    marketingMulti?: number;
    synergyMulti?: number;
    factoryCostMulti?: number;
    propBonus?: boolean;
    openOverseas?: boolean;
    allowDirectStore?: boolean;
    openB2B?: boolean;
    appealMulti?: number;
    instantMoney?: number;
    siloFix?: boolean;
    qualityCap?: number;
    jpBonus?: boolean;
    globalPenalty?: boolean;
    audioBuff?: number;
    smartphoneCostMulti?: number;
    unlockTree?: string;
  };
}

export interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'warning' | 'error';
  color?: string | null;
}

export interface GameEffects {
  rpMulti: number;
  costMulti: number;
  marketingMulti: number;
  synergyMulti: number;
  factoryCostMulti: number;
  propBonus: boolean;
  openOverseas: boolean;
  openB2B: boolean;
  appealMulti: number;
  qualityCap: number;
  jpBonus: boolean;
  globalPenalty: boolean;
  audioBuff: number;
  smartphoneCostMulti: number;
  siloFix: boolean;
}
