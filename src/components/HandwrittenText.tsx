import React from 'react';
import type { HandwritingFontStyle, PenType } from '../types';
import { wrapHandwrittenText, calculateLineWidth } from '../utils/textLayout';

interface HandwrittenTextProps {
  content: string;
  fontSize: number;
  color: string;
  fontStyle: HandwritingFontStyle;
  penType: PenType;
  lineSpacing: number; // e.g. 1.2
  slant: number; // degrees
  jitter: number; // 0 to 1
  bold: boolean;
  underlineType: 'none' | 'straight' | 'wavy' | 'double' | 'dotted' | 'hand-drawn';
  underlineColor: string;
  highlightColor: string;
  alignment: 'left' | 'center' | 'right';
  width: number;
}

// Maps our handwriting styles to specific combinations of Google fonts for realistic glyph variation
const FONT_PACKS: Record<HandwritingFontStyle, string[]> = {
  'neat-student': ["'Kalam'"],
  'casual': ["'Kalam'"],
  'messy': ["'Kalam'"],
  'lecture-notes': ["'Patrick Hand'"],
  'signature': ["'Caveat'"]
};

// SVG Filters for different pen inks
export const SVG_INK_FILTERS = (
  <defs>
    {/* Pencil texture - simulates rough graphite tooth */}
    <filter id="pen-pencil-filter" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    
    {/* Fountain pen - wet ink bleed simulation */}
    <filter id="pen-fountain-filter" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="0.4" result="blur" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="bleed" />
      <feComposite in="SourceGraphic" in2="bleed" operator="over" />
    </filter>

    {/* Marker - slight edge soaking */}
    <filter id="pen-marker-filter" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="0.6" result="blur" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 10 -3.5" result="bleed" />
      <feComposite in="SourceGraphic" in2="bleed" operator="over" />
    </filter>
  </defs>
);

export const HandwrittenText: React.FC<HandwrittenTextProps> = ({
  content,
  fontSize,
  color,
  fontStyle,
  penType,
  lineSpacing,
  slant,
  jitter,
  bold,
  underlineType,
  underlineColor,
  highlightColor,
  alignment,
  width
}) => {
  // Wrap the text to lines
  const lines = wrapHandwrittenText(content, fontSize, width, fontStyle);
  const fontOptions = FONT_PACKS[fontStyle] || ["'Caveat'"];
  const lineHeight = fontSize * lineSpacing * 1.3;

  // Stable pseudo-random generator for line-level properties
  const getLineNoise = (lineIdx: number, seedOffset: number) => {
    const seed = (lineIdx * 79 + seedOffset * 31) % 1000;
    const hash = Math.sin(seed) * 43758.5453;
    return hash - Math.floor(hash); // Float between 0.0 and 1.0
  };

  // Helper to draw hand-drawn styled underlines
  const renderUnderlinePath = (yPos: number, lineWidth: number, startX: number, lineIdx: number, forceType?: string): React.ReactNode => {
    const activeType = forceType || underlineType;
    if (activeType === 'none' || lineWidth <= 0) return null;

    const uColor = underlineColor || color;
    const endX = startX + lineWidth;
    const midYOffset = (getLineNoise(lineIdx, 10) - 0.5) * 3 * jitter;
    
    // Draw paths based on underline selection
    if (activeType === 'straight' || activeType === 'hand-drawn') {
      const wobble = 1.5 * jitter;
      const cp1y = yPos + (getLineNoise(lineIdx, 11) - 0.5) * wobble;
      const cp2y = yPos + (getLineNoise(lineIdx, 12) - 0.5) * wobble;
      const overshoot = Math.min(10, lineWidth * 0.05);

      const d = `M ${startX - overshoot * 0.2} ${yPos + midYOffset} C ${startX + lineWidth * 0.3} ${cp1y}, ${startX + lineWidth * 0.7} ${cp2y}, ${endX + overshoot * 0.6} ${yPos + (getLineNoise(lineIdx, 13) - 0.5) * wobble}`;
      return <path d={d} stroke={uColor} strokeWidth={Math.max(1, fontSize * 0.06)} fill="none" strokeLinecap="round" opacity="0.8" />;
    }

    if (activeType === 'wavy') {
      const waveFreq = 12; // wavelength in pixels
      const waveAmp = Math.max(1.8, fontSize * 0.055);
      let d = `M ${startX} ${yPos}`;
      // Calculate high-resolution step points for a smooth organic sine wave
      for (let x = 2; x <= lineWidth; x += 3) {
        const cx = startX + x;
        const cy = yPos + Math.sin((x / waveFreq) * Math.PI * 2) * waveAmp * (0.95 + getLineNoise(lineIdx + x, 14) * 0.15 * jitter);
        d += ` L ${cx} ${cy}`;
      }
      return <path d={d} stroke={uColor} strokeWidth={Math.max(1.2, fontSize * 0.055)} fill="none" strokeLinecap="round" opacity="0.85" />;
    }

    if (activeType === 'dotted') {
      return (
        <line
          x1={startX}
          y1={yPos}
          x2={endX}
          y2={yPos}
          stroke={uColor}
          strokeWidth={Math.max(1.5, fontSize * 0.08)}
          strokeDasharray="2 4"
          strokeLinecap="round"
          opacity="0.8"
        />
      );
    }

    if (activeType === 'double') {
      const spacing = Math.max(3, fontSize * 0.1);
      const line1 = renderUnderlinePath(yPos - spacing / 2, lineWidth, startX, lineIdx, 'straight');
      const line2 = renderUnderlinePath(yPos + spacing / 2, lineWidth, startX, lineIdx + 500, 'straight');
      return (
        <>
          {line1}
          {line2}
        </>
      );
    }

    return null;
  };

  // Determine filter to use
  let penFilter = '';
  if (penType === 'pencil') penFilter = 'url(#pen-pencil-filter)';
  else if (penType === 'fountain-pen') penFilter = 'url(#pen-fountain-filter)';
  else if (penType === 'marker') penFilter = 'url(#pen-marker-filter)';

  // Determine stroke thickness addition (boldness / gel pen ink thickness)
  let strokeWidth = '0';
  if (bold) {
    strokeWidth = (fontSize * 0.06).toFixed(1);
  } else if (penType === 'gel-pen' || penType === 'marker') {
    strokeWidth = (fontSize * 0.03).toFixed(1);
  } else if (penType === 'pencil') {
    strokeWidth = (fontSize * 0.015).toFixed(1);
  }

  return (
    <g style={{ userSelect: 'none' }}>
      {/* SVG Ink bleeding Filters definitions rendered globally or here */}
      {SVG_INK_FILTERS}

      {lines.map((line, lineIdx) => {
        if (line === '') return null;

        const lineWidth = calculateLineWidth(line, fontSize, fontStyle);
        const yPos = (lineIdx + 1) * lineHeight;

        // Alignment horizontal offsets
        let startX = 0;
        if (alignment === 'center') {
          startX = Math.max(0, (width - lineWidth) / 2);
        } else if (alignment === 'right') {
          startX = Math.max(0, width - lineWidth);
        }

        // Render transparent highlight block behind text if highlighted
        const highlightElement = highlightColor && highlightColor !== 'transparent' && (
          <path
            d={`M ${startX - 5} ${yPos - fontSize * 0.8} L ${startX + lineWidth + 5} ${yPos - fontSize * 0.8 + (getLineNoise(lineIdx, 15) - 0.5) * 2} L ${startX + lineWidth + 3} ${yPos + fontSize * 0.2} L ${startX - 3} ${yPos + fontSize * 0.2 + (getLineNoise(lineIdx, 16) - 0.5) * 2} Z`}
            fill={highlightColor}
            opacity="0.4"
            style={{ mixBlendMode: 'multiply' }}
          />
        );

        // Render underline path
        const underlineElement = renderUnderlinePath(yPos + fontSize * 0.22, lineWidth, startX, lineIdx);

        // Render line-level organic variations (subtle tilt and vertical shift based on jitter)
        const lineRot = (getLineNoise(lineIdx, 17) - 0.5) * 0.4 * jitter;
        const lineDy = (getLineNoise(lineIdx, 18) - 0.5) * 1.0 * jitter;
        const fontFamily = fontOptions[0] || "'Kalam'";

        const lineElement = (
          <text
            x={startX}
            y={yPos}
            dx="0"
            dy={lineDy.toFixed(1)}
            fontFamily={fontFamily}
            fontSize={`${fontSize}px`}
            fill={color}
            stroke={bold || penType === 'marker' ? color : 'none'}
            strokeWidth={strokeWidth}
            filter={penFilter || undefined}
            transform={`rotate(${lineRot.toFixed(2)}, ${startX + lineWidth / 2}, ${yPos - fontSize / 2}) skewX(${slant})`}
            style={{
              fontStyle: 'normal',
              fontWeight: bold ? 'bold' : 'normal',
              whiteSpace: 'pre'
            }}
          >
            {line}
          </text>
        );

        return (
          <g key={lineIdx}>
            {highlightElement}
            {lineElement}
            {underlineElement}
          </g>
        );
      })}
    </g>
  );
};
