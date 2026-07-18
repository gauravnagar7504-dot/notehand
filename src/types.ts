export type ThemeMode = 'light' | 'dark' | 'sepia' | 'night' | 'classic';

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdDate: number;
}

export type NotebookCover = 
  | 'leather-brown' 
  | 'vintage-green' 
  | 'modern-blue' 
  | 'pastel-pink' 
  | 'spiral-black';

export interface Notebook {
  id: string;
  folderId: string | null;
  name: string;
  coverStyle: NotebookCover;
  colorLabel: string;
  pinned: boolean;
  passwordProtected?: string; // Optional simple password hash
  isArchived: boolean;
  createdDate: number;
  updatedDate: number;
}

export type PaperType = 
  | 'plain' 
  | 'ruled' 
  | 'college-ruled' 
  | 'narrow-ruled' 
  | 'graph' 
  | 'dot-grid' 
  | 'engineering' 
  | 'vintage' 
  | 'legal-pad' 
  | 'pastel-blue'
  | 'pastel-pink';

export interface PaperStyle {
  type: PaperType;
  color: string;
  lineColor: string;
  lineSpacing: number; // in pixels
  gridDensity: number; // in pixels
  marginLine: boolean;
  paperTextureStrength: number; // 0 to 1
  pageShadow: boolean;
  pageTilt: boolean;
  paperGrain: boolean;
  spiralBinding: 'none' | 'left' | 'top';
  paperClip: boolean;
  cornerFold: boolean;
  edgeVisible: boolean;
}

export type ElementType = 
  | 'text' 
  | 'shape' 
  | 'sticker' 
  | 'image' 
  | 'drawing' 
  | 'table' 
  | 'checkbox';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number;
  layerOrder: number;
  locked: boolean;
}

export type HandwritingFontStyle = 'neat-student' | 'casual' | 'messy' | 'lecture-notes' | 'signature';
export type PenType = 'ball-pen' | 'gel-pen' | 'fountain-pen' | 'pencil' | 'marker' | 'fineliner';

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  fontStyle: HandwritingFontStyle;
  penType: PenType;
  lineSpacing: number; // multiplier e.g. 1.2
  paragraphSpacing?: number; // spacing in pixels
  slant: number; // skew/slant degrees
  jitter: number; // 0 to 1 range
  bold: boolean;
  underlineType: 'none' | 'straight' | 'wavy' | 'double' | 'dotted' | 'hand-drawn';
  underlineColor: string;
  highlightColor: string; // transparent highlight behind text
  alignment: 'left' | 'center' | 'right';
}

export type ShapeType = 
  | 'line' 
  | 'arrow' 
  | 'rect' 
  | 'circle' 
  | 'ellipse' 
  | 'triangle' 
  | 'diamond' 
  | 'cloud' 
  | 'bracket' 
  | 'brace';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  roughness: number; // hand-drawn jitter
  label?: string; // text centered in shape
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerId: string; // references built-in list or custom ID
  isCustom: boolean;
  customDataUrl?: string; // base64 image data
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // base64 or url
  aspectRatio: number;
  caption?: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  headers: boolean;
  cells: string[][];
  colWidths: number[];
  rowHeights: number[];
  color: string;
  headerColor: string;
  borderColor: string;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  points: { x: number; y: number }[];
  strokeWidth: number;
  color: string;
  isHighlighter: boolean;
}

export interface CheckboxElement extends BaseElement {
  type: 'checkbox';
  label: string;
  checked: boolean;
}

export type PageElement = 
  | TextElement 
  | ShapeElement 
  | StickerElement 
  | ImageElement 
  | TableElement 
  | DrawingElement 
  | CheckboxElement;

export interface Page {
  id: string;
  notebookId: string;
  title: string;
  pageNumber: number;
  paperStyle: PaperStyle;
  elements: PageElement[];
  tags: string[];
  createdDate: number;
  updatedDate: number;
}

export interface PageVersion {
  id: string;
  pageId: string;
  title: string;
  elements: PageElement[];
  paperStyle: PaperStyle;
  timestamp: number;
}

export interface CustomSticker {
  id: string;
  name: string;
  collection: string;
  dataUrl: string;
  tags: string[];
}

export interface HistoryItem {
  pages: Page[];
  activePageId: string | null;
}
