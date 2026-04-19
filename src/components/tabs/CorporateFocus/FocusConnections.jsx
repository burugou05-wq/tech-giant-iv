import React from 'react';
import { CORPORATE_FOCUSES } from '../../../constants/index.js';

export const FocusConnections = ({ unlockedTrees, completedFocuses }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {CORPORATE_FOCUSES.filter(f => unlockedTrees.includes(f.tree)).map(focus =>
        focus.req.map(reqId => {
          const parent = CORPORATE_FOCUSES.find(p => p.id === reqId);
          if (!parent) return null;
          
          // 特別な例外処理（グローバル展開の線引き）
          if (focus.id === 'fc_global_entry' && (parent.id === 'fc_exp_first' || parent.id === 'fc_tech_first')) {
            return null;
          }

          const isParentCompleted = completedFocuses.includes(parent.id);

          return (
            <line
              key={`${parent.id}-${focus.id}`}
              x1={parent.x} y1={parent.y + 40}
              x2={focus.x}  y2={focus.y - 40}
              stroke={isParentCompleted ? '#334155' : '#1e293b'} 
              strokeWidth="2"
              strokeDasharray={isParentCompleted ? "0" : "4 4"}
              className="transition-all duration-1000"
            />
          );
        })
      )}
    </svg>
  );
};
