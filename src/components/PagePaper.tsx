import React from 'react';
import type { PaperStyle } from '../types';

interface PagePaperProps {
  paperStyle: PaperStyle;
  width: number;
  height: number;
  children: React.ReactNode;
}

const getRgbaColor = (hex: string, alpha: number) => {
  if (!hex) return 'transparent';
  if (hex.startsWith('#')) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export const PagePaper: React.FC<PagePaperProps> = ({
  paperStyle,
  width,
  height,
  children
}) => {
  const {
    type,
    color,
    lineColor,
    lineSpacing,
    gridDensity,
    marginLine,
    paperTextureStrength,
    pageShadow,
    pageTilt,
    paperGrain,
    spiralBinding,
    paperClip,
    cornerFold,
    edgeVisible
  } = paperStyle;

  // Render spiral coil bindings
  const renderSpiralCoils = () => {
    if (spiralBinding === 'none') return null;

    const coils: React.ReactNode[] = [];
    const step = 32;

    if (spiralBinding === 'left') {
      const count = Math.floor((height - 40) / step);
      for (let i = 0; i < count; i++) {
        const y = 30 + i * step;
        coils.push(
          <g key={i} className="spiral-coil-loop">
            {/* Sheet hole inner shadow */}
            <circle cx="20" cy={y} r="3.5" fill="#000000" opacity="0.3" />
            <circle cx="20" cy={y} r="2.2" fill="#1a1c1e" />
            <circle cx="20" cy={y + 0.8} r="2.2" fill="#ffffff" opacity="0.12" /> {/* Rim highlight */}
            
            {/* Metal coil ring with realistic reflection shading */}
            <path
              d={`M 15 ${y - 3} C 2 ${y - 8}, -2 ${y + 8}, 19 ${y + 3}`}
              stroke="url(#spiral-metal-gradient)"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              filter="drop-shadow(1px 2px 2px rgba(0,0,0,0.45))"
            />
          </g>
        );
      }
    } else if (spiralBinding === 'top') {
      const count = Math.floor((width - 40) / step);
      for (let i = 0; i < count; i++) {
        const x = 30 + i * step;
        coils.push(
          <g key={i} className="spiral-coil-loop">
            {/* Sheet hole inner shadow */}
            <circle cx={x} cy="20" r="3.5" fill="#000000" opacity="0.3" />
            <circle cx={x} cy="20" r="2.2" fill="#1a1c1e" />
            <circle cx={x} cy="20.8" r="2.2" fill="#ffffff" opacity="0.12" /> {/* Rim highlight */}
            
            {/* Metal coil ring */}
            <path
              d={`M ${x - 3} 15 C ${x - 8} 2, ${x + 8} -2, ${x + 3} 19`}
              stroke="url(#spiral-metal-gradient)"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              filter="drop-shadow(2px 1px 2px rgba(0,0,0,0.45))"
            />
          </g>
        );
      }
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <defs>
          <linearGradient id="spiral-metal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#f1f5f9" /> {/* Shine */}
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        {coils}
      </svg>
    );
  };

  // Render paper clip decoration
  const renderPaperClip = () => {
    if (!paperClip) return null;
    return (
      <svg
        width="35"
        height="80"
        viewBox="0 0 35 80"
        style={{
          position: 'absolute',
          top: '-15px',
          right: '50px',
          zIndex: 11,
          pointerEvents: 'none',
          filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.4))'
        }}
      >
        {/* Metal Paperclip shape with custom gradient stroke */}
        <path
          d="M 17 75 L 17 25 C 17 12, 28 12, 28 25 L 28 55 C 28 63, 21 63, 21 55 L 21 30 C 21 25, 14 25, 14 30 L 14 62 C 14 74, 5 74, 5 62 L 5 28 C 5 8, 25 8, 25 28"
          fill="none"
          stroke="url(#spiral-metal-gradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 17 75 L 17 25 C 17 12, 28 12, 28 25 L 28 55 C 28 63, 21 63, 21 55 L 21 30 C 21 25, 14 25, 14 30 L 14 62 C 14 74, 5 74, 5 62 L 5 28 C 5 8, 25 8, 25 28"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    );
  };

  // Render paper corner fold
  const renderCornerFold = () => {
    if (!cornerFold) return null;
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '35px',
          height: '35px',
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.12) 100%)`,
          pointerEvents: 'none',
          zIndex: 4,
          borderBottomRightRadius: '4px'
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 35px 35px',
            borderColor: `transparent transparent ${color} transparent`,
            filter: 'drop-shadow(-2px -2px 3px rgba(0,0,0,0.15))',
            transform: 'scaleY(-1) rotate(90deg) translateX(-35px)'
          }}
        />
      </div>
    );
  };

  // Set up container styles
  const baseTilt = pageTilt ? 'rotate(-0.35deg)' : 'none';
  const pageClass = `notebook-page ${paperGrain ? 'paper-grain' : ''}`;
  const noiseOpacity = 0.02 + paperTextureStrength * 0.05;

  // Build CSS gradients for page patterns (so html2canvas can render them correctly)
  let backgroundStyles: React.CSSProperties = {
    backgroundColor: color,
  };

  if (type !== 'plain') {
    let backgroundImage = '';
    let backgroundSize = '';
    let backgroundPosition = '';

    if (type === 'ruled' || type === 'college-ruled' || type === 'narrow-ruled') {
      const marginX = type === 'college-ruled' ? 100 : 85;
      const lineSpacingVal = lineSpacing || 28;
      const strokeColor = getRgbaColor(lineColor || '#C0D5E4', 0.6);
      const lineG = `linear-gradient(to bottom, transparent, transparent ${lineSpacingVal - 1}px, ${strokeColor} ${lineSpacingVal - 1}px, ${strokeColor} ${lineSpacingVal}px)`;
      
      if (marginLine) {
        const marginColor = 'rgba(232, 167, 161, 0.85)'; // Pastel pink/red margin line
        const marginG = `linear-gradient(to right, transparent ${marginX}px, ${marginColor} ${marginX}px, ${marginColor} ${marginX + 1.5}px, transparent ${marginX + 1.5}px)`;
        backgroundImage = `${marginG}, ${lineG}`;
        backgroundSize = `100% 100%, 100% ${lineSpacingVal}px`;
      } else {
        backgroundImage = lineG;
        backgroundSize = `100% ${lineSpacingVal}px`;
      }
    } else if (type === 'graph' || type === 'engineering') {
      const density = gridDensity || 25;
      const strokeColor = getRgbaColor(lineColor || '#C0D5E4', 0.5);
      const gridG = `
        linear-gradient(to right, ${strokeColor} 0.8px, transparent 0.8px),
        linear-gradient(to bottom, ${strokeColor} 0.8px, transparent 0.8px)
      `;
      backgroundImage = gridG;
      backgroundSize = `${density}px ${density}px`;
    } else if (type === 'dot-grid') {
      const density = gridDensity || 25;
      const strokeColor = getRgbaColor(lineColor || '#C0D5E4', 0.7);
      backgroundImage = `radial-gradient(circle, ${strokeColor} 1.2px, transparent 1.2px)`;
      backgroundSize = `${density}px ${density}px`;
      backgroundPosition = 'center';
    }

    backgroundStyles = {
      ...backgroundStyles,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
    };
  }

  return (
    <div 
      className="notebook-page-wrapper" 
      style={{ 
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        margin: '0 auto'
      }}
    >
      {/* stacked sheets effect underneath */}
      {edgeVisible && (
        <>
          <div
            className="stacked-page-edge edge-1"
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: color,
              boxShadow: '1px 2px 4px rgba(0,0,0,0.08)',
              transform: pageTilt ? 'rotate(0.2deg)' : 'none',
              filter: 'brightness(0.97) contrast(1.01)',
              zIndex: 1,
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          />
          <div
            className="stacked-page-edge edge-2"
            style={{
              position: 'absolute',
              top: '8px',
              left: '-2px',
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: color,
              boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
              transform: pageTilt ? 'rotate(-0.15deg)' : 'none',
              filter: 'brightness(0.94) contrast(1.02)',
              zIndex: 2,
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
          />
        </>
      )}

      {/* Main page container */}
      <div
        className={pageClass}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '4px',
          boxShadow: pageShadow ? '0 1px 3px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.09), 0 20px 40px rgba(0,0,0,0.12)' : 'none',
          transform: baseTilt,
          transformOrigin: 'top left',
          transition: 'transform 0.3s ease',
          zIndex: 3,
          overflow: 'hidden',
          filter: paperGrain ? 'url(#paper-noise-filter)' : 'none',
          ...backgroundStyles
        }}
      >
        {/* Paper Grain SVG filter layer */}
        {paperGrain && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            <defs>
              <filter id="paper-noise-filter" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" values={`0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 ${noiseOpacity} 0`} result="coloredNoise" />
                <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
              </filter>
            </defs>
          </svg>
        )}

        {/* Page Content children */}
        <div style={{ position: 'relative', zIndex: 6, width: '100%', height: '100%' }}>
          {children}
        </div>

        {/* Corner fold */}
        {renderCornerFold()}
      </div>

      {/* Spiral binding rings */}
      {renderSpiralCoils()}

      {/* Pinned Paperclip */}
      {renderPaperClip()}
    </div>
  );
};
