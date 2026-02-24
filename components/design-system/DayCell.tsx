import React from 'react';
import { colors, radius } from './tokens';

interface DayCellProps {
  day: number | null;
  selected?: boolean;
  disabled?: boolean;
  isToday?: boolean;
  onClick?: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({
  day,
  selected = false,
  disabled = false,
  isToday = false,
  onClick,
}) => {
  if (!day) {
    return <div />;
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        aspectRatio: '1',
        borderRadius: radius.md,
        fontWeight: 600,
        background: selected ? colors.brand[600] : 'transparent',
        color: selected
          ? '#fff'
          : disabled
          ? colors.neutral[300]
          : colors.neutral[700],
        border: isToday && !selected ? `2px solid ${colors.brand[600]}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {day}
    </button>
  );
};
