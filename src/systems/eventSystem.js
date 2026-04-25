import { HISTORICAL_EVENTS } from '../constants/index.js';

/** 歴史イベントのチェック */
export function handleHistoricalEvents(calcYear, nextFlags) {
  const pendingEvent = HISTORICAL_EVENTS.find(e => calcYear >= e.year && !nextFlags[e.flagKey]);
  if (pendingEvent) {
    nextFlags[pendingEvent.flagKey] = true;
    return {
      type: 'EVENT',
      event: pendingEvent,
      flags: nextFlags
    };
  }
  return null;
}
