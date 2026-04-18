import { createContext, useContext } from 'react';

export const GameContext = createContext(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameContext.Provider');
  return ctx;
};
