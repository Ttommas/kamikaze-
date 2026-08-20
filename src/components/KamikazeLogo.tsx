import React from 'react';

interface LogoProps {
  variant?: 'full' | 'reduced' | 'matrix';
  color?: string;
  bgColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

/**
 * Kamikaze brand matrix/dotted logo matching Brand Manual (Pages 1, 4, 7, 10)
 */
export const KamikazeLogo: React.FC<LogoProps> = ({
  variant = 'full',
  color = '#E52E33',
  bgColor = 'transparent',
  className = '',
  size = 'md',
}) => {
  if (variant === 'reduced') {
    // Render the iconic 'kmbz' square glyph
    const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';
    return (
      <div 
        className={`inline-flex items-center justify-center p-1 font-mono font-bold tracking-tighter ${dims} ${className}`}
        style={{ color, backgroundColor: bgColor }}
        title="KAMIKAZE — kmbz"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          {/* Matrix representation of kmbz */}
          {/* 'k' */}
          <rect x="5" y="10" width="8" height="8" />
          <rect x="5" y="22" width="8" height="8" />
          <rect x="5" y="34" width="8" height="8" />
          <rect x="5" y="46" width="8" height="8" />
          <rect x="5" y="58" width="8" height="8" />
          <rect x="5" y="70" width="8" height="8" />
          <rect x="5" y="82" width="8" height="8" />
          <rect x="25" y="46" width="8" height="8" />
          <rect x="15" y="58" width="8" height="8" />
          <rect x="25" y="70" width="8" height="8" />
          <rect x="25" y="82" width="8" height="8" />
          
          {/* 'm' */}
          <rect x="38" y="46" width="6" height="44" />
          <rect x="46" y="46" width="6" height="8" />
          <rect x="54" y="46" width="6" height="44" />
          <rect x="62" y="46" width="6" height="8" />
          <rect x="70" y="46" width="6" height="44" />
          
          {/* 'b' */}
          <rect x="80" y="22" width="6" height="68" />
          <rect x="88" y="46" width="8" height="8" />
          <rect x="88" y="82" width="8" height="8" />
        </svg>
      </div>
    );
  }

  // Full dot-matrix / terminal logo as shown on page 1 and page 4
  const sizeStyles = {
    sm: 'text-xs tracking-[0.18em]',
    md: 'text-sm tracking-[0.24em]',
    lg: 'text-xl tracking-[0.28em]',
    hero: 'text-2xl sm:text-4xl tracking-[0.3em]',
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 font-mono select-none ${className}`}
      style={{ color }}
    >
      {/* Visual dotted matrix glyph representation */}
      <span className={`font-black ${sizeStyles[size]} uppercase leading-none brand-title`}>
        k·a·m·i·k·a·z·e
      </span>
    </div>
  );
};
