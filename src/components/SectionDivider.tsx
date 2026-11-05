import React from 'react';

interface SectionDividerProps {
  variant?: 'warm' | 'cool';
  position?: 'top' | 'bottom';
  blend?: 'dark-to-cream' | 'cream-to-dark' | 'none';
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'warm',
  position = 'bottom',
  blend = 'none',
}) => {
  const isTop = position === 'top';
  const posClasses = isTop ? 'top-0' : 'bottom-0';

  // Hairlines leves, translúcidas e elegantes (sem linhas duras)
  const accentGradient =
    variant === 'warm'
      ? 'from-transparent via-[#EE9B00]/30 to-transparent'
      : 'from-transparent via-[#0A9396]/30 to-transparent';

  // Micro-halo etéreo ultraleve (difuso e suave, sem manchas nem barras)
  const glowGradient =
    variant === 'warm'
      ? 'from-transparent via-[#EE9B00]/10 to-transparent'
      : 'from-transparent via-[#0A9396]/10 to-transparent';

  return (
    <div className={`absolute ${posClasses} left-0 right-0 h-6 pointer-events-none z-20 overflow-hidden`}>
      {/* 1. Micro-transição de tom featherweight (máximo 8-10% opacidade, sem criar faixas escuras) */}
      {blend === 'dark-to-cream' && (
        <div
          className={`absolute ${posClasses} left-0 right-0 h-6 pointer-events-none ${
            isTop
              ? 'bg-gradient-to-b from-black/[0.08] to-transparent'
              : 'bg-gradient-to-t from-black/[0.08] to-transparent'
          }`}
        />
      )}
      {blend === 'cream-to-dark' && (
        <div
          className={`absolute ${posClasses} left-0 right-0 h-6 pointer-events-none ${
            isTop
              ? 'bg-gradient-to-b from-black/[0.06] to-transparent'
              : 'bg-gradient-to-b from-transparent to-black/[0.08]'
          }`}
        />
      )}

      {/* 2. Micro-aura suave e ampla */}
      <div
        className={`absolute ${posClasses} left-1/2 -translate-x-1/2 w-[75vw] max-w-xs h-3 bg-gradient-to-r ${glowGradient} blur-[5px] pointer-events-none`}
      />

      {/* 3. Hairline translúcida ultra-fina (1px) */}
      <div
        className={`absolute ${posClasses} left-0 right-0 h-[1px] bg-gradient-to-r ${accentGradient} pointer-events-none`}
      />
    </div>
  );
};

