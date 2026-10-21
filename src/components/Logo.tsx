import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'colored' | 'light' | 'black';
  useImage?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = 'h-12', 
  variant = 'colored',
  useImage = false 
}) => {
  if (useImage) {
    return (
      <img 
        src="/images/logos/logo.webp" 
        alt="El Floripa Chicano Mexican Food" 
        className={`${className} w-auto object-contain`} 
      />
    );
  }

  const isLight = variant === 'light';
  const isBlack = variant === 'black';

  // High-contrast, bold Mexican typography palette
  const textColor = isBlack ? '#001219' : '#FFFFFF';
  const yellowColor = isBlack ? '#CA6702' : '#EE9B00';
  const bannerColor = '#EE9B00';
  const strokeColor = isBlack ? '#FAF5E8' : '#001219';
  const bannerTextColor = '#001219';

  return (
    <svg 
      viewBox="0 0 420 220" 
      className={`${className} w-auto shrink-0`}
      style={{ overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg" 
      role="img" 
      aria-label="El Floripa Chicano Mexican Food Logo"
    >
      {/* EL Shadow & Text */}
      <text 
        x="100" 
        y="94" 
        fill={yellowColor} 
        style={{
          fontFamily: "'Lilita One', 'Outfit', sans-serif",
          fontSize: '76px',
          fontWeight: 900,
          textAnchor: 'middle',
          transform: 'rotate(-6deg)',
          transformOrigin: '95px 90px',
          userSelect: 'none'
        }}
      >
        EL
      </text>
      <text 
        x="95" 
        y="89" 
        fill={textColor} 
        stroke={strokeColor} 
        strokeWidth={isLight ? 0 : 5} 
        strokeLinejoin="round" 
        paintOrder="stroke fill"
        style={{
          fontFamily: "'Lilita One', 'Outfit', sans-serif",
          fontSize: '76px',
          fontWeight: 900,
          textAnchor: 'middle',
          transform: 'rotate(-6deg)',
          transformOrigin: '95px 90px',
          userSelect: 'none'
        }}
      >
        EL
      </text>

      {/* FLORIPA Ribbon Banner Shadow & Fill */}
      <path 
        d={`M 155,42 
           C 165,42 165,38 175,38
           L 330,38
           C 340,38 340,42 350,42
           C 345,52 345,62 350,72
           L 350,82
           C 345,92 345,102 350,112
           L 175,112
           C 165,112 165,108 155,108
           C 160,98 160,88 155,78
           L 155,68
           C 160,58 160,48 155,42 Z`}
        fill="#001219" 
        transform="translate(4, 4)" 
      />
      <path 
        d={`M 155,42 
           C 165,42 165,38 175,38
           L 330,38
           C 340,38 340,42 350,42
           C 345,52 345,62 350,72
           L 350,82
           C 345,92 345,102 350,112
           L 175,112
           C 165,112 165,108 155,108
           C 160,98 160,88 155,78
           L 155,68
           C 160,58 160,48 155,42 Z`}
        fill={bannerColor} 
        stroke={isLight ? '#001219' : '#FAF5E8'} 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
        paintOrder="stroke fill" 
      />
      <text 
        x="253" 
        y="83" 
        fill={bannerTextColor} 
        style={{
          fontFamily: "'Sora', 'Outfit', sans-serif",
          fontSize: '25px',
          fontWeight: 900,
          textAnchor: 'middle',
          letterSpacing: '4px',
          userSelect: 'none'
        }}
      >
        FLORIPA
      </text>

      {/* CHICANO Shadow & Text */}
      <text 
        x="214" 
        y="173" 
        fill={yellowColor} 
        style={{
          fontFamily: "'Lilita One', 'Outfit', sans-serif",
          fontSize: '86px',
          fontWeight: 900,
          textAnchor: 'middle',
          letterSpacing: '1.5px',
          userSelect: 'none'
        }}
      >
        CHICANO
      </text>
      <text 
        x="210" 
        y="169" 
        fill={textColor} 
        stroke={strokeColor} 
        strokeWidth={isLight ? 0 : 5} 
        strokeLinejoin="round" 
        paintOrder="stroke fill"
        style={{
          fontFamily: "'Lilita One', 'Outfit', sans-serif",
          fontSize: '86px',
          fontWeight: 900,
          textAnchor: 'middle',
          letterSpacing: '1.5px',
          userSelect: 'none'
        }}
      >
        CHICANO
      </text>

      {/* MEXICAN FOOD subtitle */}
      <text 
        x="210" 
        y="210" 
        fill="#EE9B00" 
        style={{
          fontFamily: "'Sora', 'Outfit', sans-serif",
          fontSize: '17px',
          fontWeight: 900,
          textAnchor: 'middle',
          letterSpacing: '8px',
          userSelect: 'none'
        }}
      >
        MEXICAN FOOD
      </text>
    </svg>
  );
};
