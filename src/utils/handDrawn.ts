// Hand-drawn vector path generators
// These functions return SVG path strings ('d' attribute) that look wobbly and hand-sketched.

/**
 * Generates a wobbly line with overshoot at the ends.
 */
export function getHandDrawnLinePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number = 1
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const rx = -dy / len; // Perpendicular unit vector
  const ry = dx / len;

  // Max jitter based on line length and roughness
  const jitterAmount = Math.max(1, len * 0.008) * roughness;
  const overshoot = Math.min(8, len * 0.05) * roughness;

  // Random control points
  const r1 = (Math.random() - 0.5) * jitterAmount;
  const r2 = (Math.random() - 0.5) * jitterAmount;

  const cp1x = x1 + dx * 0.33 + rx * r1;
  const cp1y = y1 + dy * 0.33 + ry * r1;

  const cp2x = x1 + dx * 0.67 + rx * r2;
  const cp2y = y1 + dy * 0.67 + ry * r2;

  // Overshoot offsets
  const ux = dx / len;
  const uy = dy / len;
  
  const startX = x1 - ux * overshoot * (Math.random() * 0.4);
  const startY = y1 - uy * overshoot * (Math.random() * 0.4);
  
  const endX = x2 + ux * overshoot * (Math.random() * 0.6 + 0.4);
  const endY = y2 + uy * overshoot * (Math.random() * 0.6 + 0.4);

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

/**
 * Generates two slightly different wobbly lines overlaid to simulate multiple pencil strokes.
 */
export function getDoubleStrokeLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number = 1
): string {
  const stroke1 = getHandDrawnLinePath(x1, y1, x2, y2, roughness);
  const stroke2 = getHandDrawnLinePath(x1, y1, x2, y2, roughness * 0.8);
  return `${stroke1} ${stroke2}`;
}

/**
 * Generates a hand-drawn rectangle (4 distinct wobbly lines with corner overshoots).
 */
export function getHandDrawnRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number = 1
): string {
  // Top edge
  const top = getHandDrawnLinePath(x, y, x + w, y, roughness);
  // Right edge
  const right = getHandDrawnLinePath(x + w, y, x + w, y + h, roughness);
  // Bottom edge
  const bottom = getHandDrawnLinePath(x + w, y + h, x, y + h, roughness);
  // Left edge
  const left = getHandDrawnLinePath(x, y + h, x, y, roughness);

  return `${top} ${right} ${bottom} ${left}`;
}

/**
 * Generates a hand-drawn circle/ellipse using overlapping wobbly arcs.
 */
export function getHandDrawnCirclePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  roughness: number = 1
): string {
  const points: { x: number; y: number }[] = [];
  const steps = 12;
  // Overlap by 385 degrees to create a realistic handwritten circle overlap
  const totalAngle = Math.PI * 2 * 1.07;
  const stepAngle = totalAngle / steps;

  for (let i = 0; i <= steps; i++) {
    const angle = i * stepAngle;
    // Jitter radius slightly
    const radialJitter = 1 + (Math.random() - 0.5) * 0.05 * roughness;
    const px = cx + Math.cos(angle) * rx * radialJitter;
    const py = cy + Math.sin(angle) * ry * radialJitter;
    points.push({ x: px, y: py });
  }

  // Generate cubic bezier path through the points
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    // Control points between p0 and p1
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    const cp1x = p0.x + dx * 0.33 + (Math.random() - 0.5) * len * 0.1 * roughness;
    const cp1y = p0.y + dy * 0.33 + (Math.random() - 0.5) * len * 0.1 * roughness;
    const cp2x = p0.x + dx * 0.67 + (Math.random() - 0.5) * len * 0.1 * roughness;
    const cp2y = p0.y + dy * 0.67 + (Math.random() - 0.5) * len * 0.1 * roughness;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  // Draw a second lighter overlay path for pencil/ink realism
  let path2 = ` M ${points[0].x + (Math.random() - 0.5) * 2} ${points[0].y + (Math.random() - 0.5) * 2}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offset = (Math.random() - 0.5) * 2;
    const cp1x = p0.x + dx * 0.33 + (Math.random() - 0.5) * len * 0.08 * roughness + offset;
    const cp1y = p0.y + dy * 0.33 + (Math.random() - 0.5) * len * 0.08 * roughness + offset;
    const cp2x = p0.x + dx * 0.67 + (Math.random() - 0.5) * len * 0.08 * roughness + offset;
    const cp2y = p0.y + dy * 0.67 + (Math.random() - 0.5) * len * 0.08 * roughness + offset;

    path2 += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x + (Math.random() - 0.5) * 2} ${p1.y + (Math.random() - 0.5) * 2}`;
  }

  return `${path} ${path2}`;
}

/**
 * Generates a hand-drawn triangle path.
 */
export function getHandDrawnTrianglePath(
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number = 1
): string {
  const p1 = { x: x + w / 2, y }; // Top tip
  const p2 = { x: x + w, y: y + h }; // Bottom right
  const p3 = { x, y: y + h }; // Bottom left

  const edge1 = getHandDrawnLinePath(p1.x, p1.y, p2.x, p2.y, roughness);
  const edge2 = getHandDrawnLinePath(p2.x, p2.y, p3.x, p3.y, roughness);
  const edge3 = getHandDrawnLinePath(p3.x, p3.y, p1.x, p1.y, roughness);

  return `${edge1} ${edge2} ${edge3}`;
}

/**
 * Generates a hand-drawn diamond path.
 */
export function getHandDrawnDiamondPath(
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number = 1
): string {
  const p1 = { x: x + w / 2, y }; // Top mid
  const p2 = { x: x + w, y: y + h / 2 }; // Right mid
  const p3 = { x: x + w / 2, y: y + h }; // Bottom mid
  const p4 = { x, y: y + h / 2 }; // Left mid

  const edge1 = getHandDrawnLinePath(p1.x, p1.y, p2.x, p2.y, roughness);
  const edge2 = getHandDrawnLinePath(p2.x, p2.y, p3.x, p3.y, roughness);
  const edge3 = getHandDrawnLinePath(p3.x, p3.y, p4.x, p4.y, roughness);
  const edge4 = getHandDrawnLinePath(p4.x, p4.y, p1.x, p1.y, roughness);

  return `${edge1} ${edge2} ${edge3} ${edge4}`;
}

/**
 * Generates a hand-drawn arrow.
 */
export function getHandDrawnArrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number = 1
): string {
  // Main shaft line
  const shaft = getHandDrawnLinePath(x1, y1, x2, y2, roughness);

  // Arrow head calculations
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return shaft;

  const headSize = Math.max(12, Math.min(25, len * 0.15)) * roughness;
  const angle = Math.atan2(dy, dx);

  // Standard 30 degrees arrowhead angles
  const arrowAngle1 = angle - Math.PI / 6;
  const arrowAngle2 = angle + Math.PI / 6;

  const headX1 = x2 - Math.cos(arrowAngle1) * headSize;
  const headY1 = y2 - Math.sin(arrowAngle1) * headSize;

  const headX2 = x2 - Math.cos(arrowAngle2) * headSize;
  const headY2 = y2 - Math.sin(arrowAngle2) * headSize;

  const leftFlange = getHandDrawnLinePath(x2, y2, headX1, headY1, roughness);
  const rightFlange = getHandDrawnLinePath(x2, y2, headX2, headY2, roughness);

  return `${shaft} ${leftFlange} ${rightFlange}`;
}

/**
 * Generates a hand-drawn curly bracket (brace).
 * orientation: 'left' | 'right'
 */
export function getHandDrawnBracePath(
  x: number,
  y: number,
  w: number,
  h: number,
  orientation: 'left' | 'right' = 'left',
  _roughness: number = 1
): string {
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Draws a brace with 4 bezier segments meeting at the center point (cx, cy)
  if (orientation === 'left') {
    // Left Brace {
    // Segment 1: top edge turning inward
    const s1 = `M ${x + w} ${y} Q ${cx} ${y}, ${cx} ${y + h * 0.25}`;
    // Segment 2: curve out to meet center tip
    const s2 = `M ${cx} ${y + h * 0.25} Q ${cx} ${cy}, ${x} ${cy}`;
    // Segment 3: center tip curve out
    const s3 = `M ${x} ${cy} Q ${cx} ${cy}, ${cx} ${y + h * 0.75}`;
    // Segment 4: bottom edge turning inward
    const s4 = `M ${cx} ${y + h * 0.75} Q ${cx} ${y + h}, ${x + w} ${y + h}`;

    return `${s1} ${s2} ${s3} ${s4}`;
  } else {
    // Right Brace }
    const s1 = `M ${x} ${y} Q ${cx} ${y}, ${cx} ${y + h * 0.25}`;
    const s2 = `M ${cx} ${y + h * 0.25} Q ${cx} ${cy}, ${x + w} ${cy}`;
    const s3 = `M ${x + w} ${cy} Q ${cx} ${cy}, ${cx} ${y + h * 0.75}`;
    const s4 = `M ${cx} ${y + h * 0.75} Q ${cx} ${y + h}, ${x} ${y + h}`;

    return `${s1} ${s2} ${s3} ${s4}`;
  }
}

/**
 * Generates a hand-drawn bracket [ or ]
 */
export function getHandDrawnBracketPath(
  x: number,
  y: number,
  w: number,
  h: number,
  orientation: 'left' | 'right' = 'left',
  roughness: number = 1
): string {
  if (orientation === 'left') {
    const spine = getHandDrawnLinePath(x + w, y, x + w, y + h, roughness);
    const top = getHandDrawnLinePath(x + w, y, x, y, roughness);
    const bottom = getHandDrawnLinePath(x + w, y + h, x, y + h, roughness);
    return `${spine} ${top} ${bottom}`;
  } else {
    const spine = getHandDrawnLinePath(x, y, x, y + h, roughness);
    const top = getHandDrawnLinePath(x, y, x + w, y, roughness);
    const bottom = getHandDrawnLinePath(x, y + h, x + w, y + h, roughness);
    return `${spine} ${top} ${bottom}`;
  }
}

/**
 * Generates a hand-drawn cloud perimeter path.
 */
export function getHandDrawnCloudPath(
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number = 1
): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;
  const numPuffs = 10;
  const angleStep = (Math.PI * 2) / numPuffs;
  let path = '';

  for (let i = 0; i < numPuffs; i++) {
    const angle1 = i * angleStep;
    const angle2 = (i + 1) * angleStep;
    
    const p1x = cx + Math.cos(angle1) * rx;
    const p1y = cy + Math.sin(angle1) * ry;
    const p2x = cx + Math.cos(angle2) * rx;
    const p2y = cy + Math.sin(angle2) * ry;

    // Control point pulled outwards to create the "puff" arc
    const midAngle = (angle1 + angle2) / 2;
    const puffRadius = 1.25 + (Math.random() - 0.5) * 0.1 * roughness;
    const cpx = cx + Math.cos(midAngle) * rx * puffRadius;
    const cpy = cy + Math.sin(midAngle) * ry * puffRadius;

    if (i === 0) {
      path += `M ${p1x} ${p1y}`;
    }
    path += ` Q ${cpx} ${cpy}, ${p2x} ${p2y}`;
  }

  // Add overlap
  const overlapAngle = numPuffs * angleStep + 0.3;
  const p1x = cx + Math.cos(overlapAngle) * rx;
  const p1y = cy + Math.sin(overlapAngle) * ry;
  path += ` Q ${cx + Math.cos(overlapAngle - 0.15) * rx * 1.3} ${cy + Math.sin(overlapAngle - 0.15) * ry * 1.3}, ${p1x} ${p1y}`;

  return path;
}
