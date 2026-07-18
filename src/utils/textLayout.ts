/**
 * Utilities for word-wrapping and layout computation of handwritten text blocks.
 */

// Approximate character widths relative to font size for different handwriting styles.
const FONT_WIDTH_FACTORS: Record<string, number> = {
  'neat-student': 0.52,
  'casual': 0.55,
  'messy': 0.58,
  'lecture-notes': 0.54,
  'signature': 0.65,
};

/**
 * Splits a text string into lines that fit within a maximum width.
 */
export function wrapHandwrittenText(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontStyle: string
): string[] {
  const lines = text.split('\n');
  const factor = FONT_WIDTH_FACTORS[fontStyle] || 0.55;
  const spaceWidth = fontSize * factor * 0.8;
  const wrappedLines: string[] = [];

  for (const rawLine of lines) {
    if (rawLine.trim() === '') {
      wrappedLines.push('');
      continue;
    }

    const words = rawLine.split(' ');
    let currentLineWords: string[] = [];
    let currentLineWidth = 0;

    for (const word of words) {
      const wordWidth = word.length * fontSize * factor;

      if (currentLineWords.length > 0 && currentLineWidth + spaceWidth + wordWidth > maxWidth) {
        // Line break
        wrappedLines.push(currentLineWords.join(' '));
        currentLineWords = [word];
        currentLineWidth = wordWidth;
      } else {
        currentLineWords.push(word);
        currentLineWidth += (currentLineWords.length > 1 ? spaceWidth : 0) + wordWidth;
      }
    }

    if (currentLineWords.length > 0) {
      wrappedLines.push(currentLineWords.join(' '));
    }
  }

  return wrappedLines;
}

/**
 * Calculates the width of a given text line.
 */
export function calculateLineWidth(
  line: string,
  fontSize: number,
  fontStyle: string
): number {
  const factor = FONT_WIDTH_FACTORS[fontStyle] || 0.55;
  return line.length * fontSize * factor;
}
