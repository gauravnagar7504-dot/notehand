import React from 'react';
import type { Page, PageElement, PaperStyle, PaperType, HandwritingFontStyle, PenType, ShapeType, TextElement, ShapeElement, TableElement, ImageElement } from '../types';
import {
  Lock,
  Unlock,
  Trash2,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  BookOpen,
  Plus,
  Settings,
  X,
  ChevronDown
} from 'lucide-react';

interface PropertiesPanelProps {
  page: Page;
  selectedElementId: string | null;
  updatePageElements: (elements: PageElement[]) => void;
  updatePaperStyle: (style: PaperStyle) => void;
  onDeleteElement: (id: string) => void;
  onDeselect?: () => void;
  updatePageTags: (tags: string[]) => void;
  captureHistoryState: () => void;
}

const PAPER_PRESETS: { type: PaperType; name: string; bg: string }[] = [
  { type: 'plain', name: 'Plain Cotton', bg: '#FCFAF2' },
  { type: 'ruled', name: 'Ruled Cream', bg: '#FFFCEE' },
  { type: 'college-ruled', name: 'College Ivory', bg: '#FAF8F0' },
  { type: 'narrow-ruled', name: 'Narrow Amber', bg: '#FAF7DE' },
  { type: 'graph', name: 'Graph Paper', bg: '#F3F6F8' },
  { type: 'dot-grid', name: 'Dotted Cream', bg: '#F8F6EF' },
  { type: 'engineering', name: 'Engineering Sage', bg: '#E9F5EB' },
  { type: 'vintage', name: 'Vintage Oak', bg: '#F5ECD8' },
  { type: 'legal-pad', name: 'Legal Yellow', bg: '#FFF59D' },
  { type: 'pastel-blue', name: 'Pastel Blue', bg: '#EBF3FE' },
  { type: 'pastel-pink', name: 'Pastel Pink', bg: '#FDF0F6' }
];

const HIGHLIGHT_COLORS = [
  { name: 'None', hex: 'transparent' },
  { name: 'Yellow', hex: 'rgba(253, 224, 71, 0.4)' },
  { name: 'Green', hex: 'rgba(110, 231, 183, 0.4)' },
  { name: 'Pink', hex: 'rgba(244, 114, 182, 0.4)' },
  { name: 'Blue', hex: 'rgba(96, 165, 250, 0.4)' },
  { name: 'Orange', hex: 'rgba(251, 146, 60, 0.4)' },
  { name: 'Purple', hex: 'rgba(196, 181, 253, 0.4)' }
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  page,
  selectedElementId,
  updatePageElements,
  updatePaperStyle,
  onDeleteElement,
  onDeselect,
  updatePageTags,
  captureHistoryState
}) => {
  const selectedElement = page.elements.find(el => el.id === selectedElementId);
  const [advancedExpanded, setAdvancedExpanded] = React.useState(false);

  // Update specific element property
  const updateElementProp = (propName: string, value: any, category?: string) => {
    if (!selectedElementId) return;
    captureHistoryState();
    const updated = page.elements.map(el => {
      if (el.id !== selectedElementId) return el;
      if (category) {
        return {
          ...el,
          [category]: {
            // @ts-ignore
            ...(el[category] || {}),
            [propName]: value
          }
        };
      } else {
        return {
          ...el,
          [propName]: value
        };
      }
    });
    updatePageElements(updated);
  };

  const shiftLayer = (direction: 'front' | 'back') => {
    if (!selectedElement) return;
    captureHistoryState();
    
    // Sort all elements
    let sorted = [...page.elements].sort((a, b) => a.layerOrder - b.layerOrder);
    const idx = sorted.findIndex(el => el.id === selectedElement.id);
    if (idx === -1) return;

    if (direction === 'front' && idx < sorted.length - 1) {
      // Swap with next
      const temp = sorted[idx].layerOrder;
      sorted[idx].layerOrder = sorted[idx + 1].layerOrder;
      sorted[idx + 1].layerOrder = temp;
    } else if (direction === 'back' && idx > 0) {
      // Swap with prev
      const temp = sorted[idx].layerOrder;
      sorted[idx].layerOrder = sorted[idx - 1].layerOrder;
      sorted[idx - 1].layerOrder = temp;
    }

    updatePageElements(sorted);
  };

  // RENDER CANVAS DEFAULT PROPERTIES (When nothing selected)
  const renderCanvasProperties = () => {
    const style = page.paperStyle;
    return (
      <div className="panel-section">
        <h3 className="section-title"><Settings size={14} style={{ marginRight: '6px' }} /> Paper Settings</h3>
        
        {/* Paper Presets */}
        <div className="prop-control">
          <label className="prop-label">Paper Template</label>
          <select
            className="prop-select"
            value={style.type}
            onChange={(e) => {
              const type = e.target.value as PaperType;
              const preset = PAPER_PRESETS.find(p => p.type === type);
              updatePaperStyle({
                ...style,
                type,
                color: preset ? preset.bg : style.color
              });
            }}
          >
            {PAPER_PRESETS.map(p => (
              <option key={p.type} value={p.type}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Paper Background Color */}
        <div className="prop-control">
          <label className="prop-label">Custom Page Color</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              className="prop-color-input"
              value={style.color}
              onChange={(e) => updatePaperStyle({ ...style, color: e.target.value })}
            />
            <input
              type="text"
              className="prop-text-input"
              value={style.color}
              onChange={(e) => updatePaperStyle({ ...style, color: e.target.value })}
              maxLength={7}
            />
          </div>
        </div>

        {/* Line Spacing */}
        {(style.type === 'ruled' || style.type === 'college-ruled' || style.type === 'narrow-ruled') && (
          <div className="prop-control">
            <label className="prop-label">Line Spacing: {style.lineSpacing}px</label>
            <input
              type="range"
              min="20"
              max="50"
              value={style.lineSpacing}
              onChange={(e) => updatePaperStyle({ ...style, lineSpacing: parseInt(e.target.value) })}
            />
          </div>
        )}

        {/* Grid density */}
        {(style.type === 'graph' || style.type === 'engineering' || style.type === 'dot-grid') && (
          <div className="prop-control">
            <label className="prop-label">Grid Size: {style.gridDensity}px</label>
            <input
              type="range"
              min="15"
              max="45"
              value={style.gridDensity}
              onChange={(e) => updatePaperStyle({ ...style, gridDensity: parseInt(e.target.value) })}
            />
          </div>
        )}

        {/* Margin line toggle */}
        <div className="prop-toggle-row">
          <span className="prop-label">Margin Line</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.marginLine}
              onChange={(e) => updatePaperStyle({ ...style, marginLine: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        {/* Texture Strength */}
        <div className="prop-control">
          <span className="prop-label">Paper Grain Texture: {Math.round(style.paperTextureStrength * 100)}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={style.paperTextureStrength}
            onChange={(e) => updatePaperStyle({ ...style, paperTextureStrength: parseFloat(e.target.value) })}
          />
        </div>

        <hr className="prop-divider" />

        {/* Notebook Aesthetics decorations */}
        <h3 className="section-title"><BookOpen size={14} style={{ marginRight: '6px' }} /> Notebook Aesthetics</h3>

        <div className="prop-control">
          <label className="prop-label">Spiral Binder Coil</label>
          <select
            className="prop-select"
            value={style.spiralBinding}
            onChange={(e) => updatePaperStyle({ ...style, spiralBinding: e.target.value as any })}
          >
            <option value="none">None</option>
            <option value="left">Left Coils</option>
            <option value="top">Top Coils</option>
          </select>
        </div>

        <div className="prop-toggle-row">
          <span className="prop-label">Page Shadow Depth</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.pageShadow}
              onChange={(e) => updatePaperStyle({ ...style, pageShadow: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <div className="prop-toggle-row">
          <span className="prop-label">Organic Desk Tilt</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.pageTilt}
              onChange={(e) => updatePaperStyle({ ...style, pageTilt: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <div className="prop-toggle-row">
          <span className="prop-label">Folded Page Corner</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.cornerFold}
              onChange={(e) => updatePaperStyle({ ...style, cornerFold: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <div className="prop-toggle-row">
          <span className="prop-label">Paper Clip Pinned</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.paperClip}
              onChange={(e) => updatePaperStyle({ ...style, paperClip: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <div className="prop-toggle-row">
          <span className="prop-label">Stacked Pages Stack</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={style.edgeVisible}
              onChange={(e) => updatePaperStyle({ ...style, edgeVisible: e.target.checked })}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <hr className="prop-divider" />

        {/* Page Tags Editor */}
        <div className="tag-editor-section">
          <div className="tag-editor-label">Page Tags</div>
          <div className="tag-pills-container">
            {(page.tags || []).map(t => (
              <span key={t} className="tag-pill">
                #{t}
                <button 
                  className="tag-remove-btn" 
                  onClick={() => updatePageTags(page.tags.filter(tag => tag !== t))}
                >
                  ×
                </button>
              </span>
            ))}
            {(!page.tags || page.tags.length === 0) && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No tags</span>
            )}
          </div>
          <div className="tag-input-row">
            <input
              type="text"
              placeholder="Add tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim().toLowerCase();
                  if (val && !page.tags.includes(val)) {
                    updatePageTags([...page.tags, val]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          </div>
        </div>

      </div>
    );
  };

  // RENDER SELECTED TEXT ELEMENT PROPERTIES
  const renderTextProperties = (el: PageElement) => {
    const tx = el as TextElement;
    
    const writingStyles = [
      { id: 'neat-student', label: 'Neat Student', font: 'Kalam' },
      { id: 'casual', label: 'Natural Print', font: 'Kalam' },
      { id: 'messy', label: 'Exam Notes', font: 'Kalam' },
      { id: 'lecture-notes', label: 'Teacher', font: 'Patrick Hand' },
      { id: 'casual-bold', label: 'Marker', font: 'Kalam' },
      { id: 'messy-notes', label: 'Fast Notes', font: 'Kalam' }
    ];

    const handleStyleClick = (styleId: string) => {
      if (styleId === 'casual-bold') {
        updatePageElements(page.elements.map(e => e.id === el.id ? {
          ...e,
          fontStyle: 'casual',
          penType: 'marker',
          bold: true
        } as TextElement : e));
      } else if (styleId === 'messy-notes') {
        updatePageElements(page.elements.map(e => e.id === el.id ? {
          ...e,
          fontStyle: 'messy',
          jitter: 0.5
        } as TextElement : e));
      } else {
        updateElementProp('fontStyle', styleId as HandwritingFontStyle);
      }
    };

    const inkColors = [
      { hex: '#0F172A', name: 'Black' },
      { hex: '#1D4ED8', name: 'Blue' },
      { hex: '#7C3AED', name: 'Purple' },
      { hex: '#047857', name: 'Green' },
      { hex: '#DC2626', name: 'Red' },
      { hex: '#EA580C', name: 'Orange' }
    ];

    const defaultRecent = ['#0F172A', '#1D4ED8', '#DC2626'];
    const pageColors = page.elements
      .filter(el => el.type === 'text')
      .map(el => (el as TextElement).color);
    const recentColors = Array.from(new Set([...pageColors, ...defaultRecent])).slice(0, 5);

    const underlineStyles = [
      { id: 'straight', label: 'Straight' },
      { id: 'double', label: 'Double' },
      { id: 'hand-drawn', label: 'Marker' },
      { id: 'wavy', label: 'Wavy' }
    ];

    return (
      <div className="panel-section text-inspector-content">
        {/* Writing Style */}
        <div className="prop-control">
          <label className="prop-label">Writing Style</label>
          <div className="writing-style-grid">
            {writingStyles.map(st => {
              const isActive = (st.id === 'casual-bold' && tx.fontStyle === 'casual' && tx.penType === 'marker') ||
                               (st.id === 'messy-notes' && tx.fontStyle === 'messy' && tx.jitter >= 0.5) ||
                               (st.id === tx.fontStyle && tx.penType !== 'marker' && tx.jitter < 0.5);
              return (
                <div
                  key={st.id}
                  className={`writing-style-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleStyleClick(st.id)}
                >
                  <span className="style-card-preview" style={{ fontFamily: `'${st.font}', cursive` }} data-font-family={st.font}>Aa Bb Cc</span>
                  <span className="style-card-label">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pen Select with stroke preview line */}
        <div className="prop-control">
          <label className="prop-label">Pen</label>
          <div className="pen-select-container">
            <select
              className="prop-select"
              value={tx.penType}
              onChange={(e) => updateElementProp('penType', e.target.value as PenType)}
            >
              <option value="ball-pen">Ball Pen</option>
              <option value="gel-pen">Gel Pen</option>
              <option value="fountain-pen">Fountain Pen</option>
              <option value="pencil">Pencil</option>
              <option value="marker">Marker</option>
              <option value="fineliner">Fine Liner</option>
            </select>
            <div className="pen-stroke-preview">
              <svg width="60" height="8">
                <path
                  d="M 5 4 Q 30 1 55 4"
                  stroke={tx.color}
                  strokeWidth={tx.penType === 'marker' ? 4 : tx.penType === 'pencil' ? 1.5 : 2.5}
                  fill="none"
                  strokeLinecap="round"
                  style={{ opacity: tx.penType === 'pencil' ? 0.7 : 1 }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Ink Color dots */}
        <div className="prop-control">
          <label className="prop-label">Ink Color</label>
          <div className="ink-colors-row-container">
            <div className="ink-color-dots-grid">
              {inkColors.map(c => (
                <button
                  key={c.hex}
                  className={`ink-color-dot-btn ${tx.color === c.hex ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => updateElementProp('color', c.hex)}
                  title={c.name}
                />
              ))}
              <div className="custom-color-picker-dot-btn">
                <input
                  type="color"
                  value={tx.color}
                  onChange={(e) => updateElementProp('color', e.target.value)}
                  className="hidden-picker"
                />
                <span>+</span>
              </div>
            </div>
            
            <div className="recently-used-sublabel">Recently Used</div>
            <div className="recently-used-dots-row">
              {recentColors.map((hex, index) => (
                <button
                  key={index}
                  className={`recent-color-dot-btn ${tx.color === hex ? 'active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => updateElementProp('color', hex)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Writing Size slider with labels */}
        <div className="prop-control">
          <label className="prop-label">Writing Size</label>
          <div className="writing-size-slider-wrapper">
            <span className="size-label-a small-a">A</span>
            <input
              type="range"
              min="12"
              max="48"
              value={tx.fontSize}
              onChange={(e) => updateElementProp('fontSize', parseInt(e.target.value))}
              className="size-slider-input"
            />
            <span className="size-label-a large-a">A</span>
            <span className="writing-size-badge-new">{tx.fontSize}px</span>
          </div>
        </div>

        {/* Highlighter dots */}
        <div className="prop-control">
          <label className="prop-label">Highlight</label>
          <div className="highlight-picker-grid-new">
            {HIGHLIGHT_COLORS.map(hc => (
              <button
                key={hc.hex}
                className={`highlight-dot-btn-new ${tx.highlightColor === hc.hex ? 'active' : ''}`}
                style={{ backgroundColor: hc.hex === 'transparent' ? '#333333' : hc.hex }}
                onClick={() => updateElementProp('highlightColor', hc.hex)}
                title={hc.name}
              >
                {hc.hex === 'transparent' && '×'}
              </button>
            ))}
          </div>
        </div>

        {/* Underline Style Grid */}
        <div className="prop-control">
          <label className="prop-label">Underline</label>
          <div className="underline-cards-grid">
            {underlineStyles.map(st => {
              const isActive = tx.underlineType === st.id;
              return (
                <div
                  key={st.id}
                  className={`underline-style-card ${isActive ? 'active' : ''}`}
                  onClick={() => updateElementProp('underlineType', isActive ? 'none' : st.id)}
                >
                  <span className={`underline-card-preview-text type-${st.id}`}>abc</span>
                  <span className="underline-card-label">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alignment segmented horizontal control */}
        <div className="prop-control">
          <label className="prop-label">Alignment</label>
          <div className="segmented-align-row-new">
            <button
              className={`align-segment-btn ${tx.alignment === 'left' ? 'active' : ''}`}
              onClick={() => updateElementProp('alignment', 'left')}
              title="Align Left"
            >
              <AlignLeft size={15} />
            </button>
            <button
              className={`align-segment-btn ${tx.alignment === 'center' ? 'active' : ''}`}
              onClick={() => updateElementProp('alignment', 'center')}
              title="Align Center"
            >
              <AlignCenter size={15} />
            </button>
            <button
              className={`align-segment-btn ${tx.alignment === 'right' ? 'active' : ''}`}
              onClick={() => updateElementProp('alignment', 'right')}
              title="Align Right"
            >
              <AlignRight size={15} />
            </button>
          </div>
        </div>

        {/* Spacing dropdown selectors */}
        <div className="prop-control spacing-section-new">
          <label className="prop-label">Spacing</label>
          
          <div className="spacing-row-new">
            <span className="spacing-row-label">Line Spacing</span>
            <select
              className="spacing-select-dropdown"
              value={tx.lineSpacing}
              onChange={(e) => updateElementProp('lineSpacing', parseFloat(e.target.value))}
            >
              <option value="1.0">1.0</option>
              <option value="1.2">1.2</option>
              <option value="1.5">1.5</option>
              <option value="2.0">2.0</option>
            </select>
          </div>

          <div className="spacing-row-new">
            <span className="spacing-row-label">Paragraph Spacing</span>
            <select
              className="spacing-select-dropdown"
              value={tx.paragraphSpacing || 6}
              onChange={(e) => updateElementProp('paragraphSpacing', parseInt(e.target.value))}
            >
              <option value="4">4 px</option>
              <option value="6">6 px</option>
              <option value="8">8 px</option>
              <option value="12">12 px</option>
            </select>
          </div>
        </div>

        {/* Advanced Settings Accordion */}
        <div className="advanced-accordion-new" style={{ marginTop: '12px', borderTop: '1px solid #242424', paddingTop: '12px' }}>
          <div 
            className="advanced-header-row-new" 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#888888', fontSize: '12.5px' }}
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
          >
            <span>Advanced Settings</span>
            <ChevronDown size={14} style={{ transform: advancedExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </div>
          
          {advancedExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div className="prop-control">
                <label className="prop-label">Natural Jitter: {tx.jitter}</label>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={tx.jitter}
                  onChange={(e) => updateElementProp('jitter', parseFloat(e.target.value))}
                />
              </div>
              <div className="prop-control">
                <label className="prop-label">Hand Slant: {tx.slant}°</label>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="1"
                  value={tx.slant}
                  onChange={(e) => updateElementProp('slant', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };


  // RENDER SHAPE PROPERTIES
  const renderShapeProperties = (el: PageElement) => {
    const sh = el as ShapeElement;
    return (
      <div className="panel-section">
        <h3 className="section-title"><Settings size={14} style={{ marginRight: '6px' }} /> Shape settings</h3>

        <div className="prop-control">
          <label className="prop-label">Shape Type</label>
          <select
            className="prop-select"
            value={sh.shapeType}
            onChange={(e) => updateElementProp('shapeType', e.target.value as ShapeType)}
          >
            <option value="rect">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="ellipse">Ellipse</option>
            <option value="line">Line</option>
            <option value="arrow">Arrow</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
            <option value="cloud">Cloud</option>
            <option value="bracket">Square Bracket</option>
            <option value="brace">Curly Bracket</option>
          </select>
        </div>

        <div className="prop-control">
          <label className="prop-label">Stroke Color</label>
          <input
            type="color"
            className="prop-color-input"
            value={sh.strokeColor}
            onChange={(e) => updateElementProp('strokeColor', e.target.value)}
          />
        </div>

        <div className="prop-control">
          <label className="prop-label">Fill Color</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              className="prop-color-input"
              value={sh.fillColor === 'transparent' ? '#FFFFFF' : sh.fillColor}
              onChange={(e) => updateElementProp('fillColor', e.target.value)}
              disabled={sh.fillColor === 'transparent'}
            />
            <button
              className="transparent-toggle-btn"
              onClick={() => updateElementProp('fillColor', sh.fillColor === 'transparent' ? '#FEE2E2' : 'transparent')}
            >
              {sh.fillColor === 'transparent' ? 'Set Fill Color' : 'Make Transparent'}
            </button>
          </div>
        </div>

        <div className="prop-control">
          <label className="prop-label">Stroke Width: {sh.strokeWidth}px</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={sh.strokeWidth}
            onChange={(e) => updateElementProp('strokeWidth', parseFloat(e.target.value))}
          />
        </div>

        <div className="prop-control">
          <label className="prop-label">Sketch Roughness (Wobble): {sh.roughness}</label>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.1"
            value={sh.roughness}
            onChange={(e) => updateElementProp('roughness', parseFloat(e.target.value))}
          />
        </div>

        {/* Centered Shape Label */}
        <div className="prop-control">
          <label className="prop-label">Label inside shape</label>
          <textarea
            className="prop-text-input text-area-prop"
            value={sh.label || ''}
            onChange={(e) => updateElementProp('label', e.target.value)}
            placeholder="Type text label..."
          />
        </div>
      </div>
    );
  };

  // RENDER TABLE PROPERTIES
  const renderTableProperties = (el: PageElement) => {
    const tb = el as TableElement;
    
    const handleAddRow = () => {
      const updated = page.elements.map(el => {
        if (el.id !== tb.id) return el;
        const currentTable = el as TableElement;
        return {
          ...currentTable,
          cells: [...currentTable.cells, Array(currentTable.cols).fill('')],
          rows: currentTable.rows + 1,
          rowHeights: [...currentTable.rowHeights, 50],
          height: currentTable.height + 50
        };
      });
      updatePageElements(updated);
    };

    const handleAddCol = () => {
      const updated = page.elements.map(el => {
        if (el.id !== tb.id) return el;
        const currentTable = el as TableElement;
        return {
          ...currentTable,
          cells: currentTable.cells.map(row => [...row, '']),
          cols: currentTable.cols + 1,
          colWidths: [...currentTable.colWidths, 100],
          width: currentTable.width + 100
        };
      });
      updatePageElements(updated);
    };

    return (
      <div className="panel-section">
        <h3 className="section-title"><Settings size={14} style={{ marginRight: '6px' }} /> Table settings</h3>
        
        <div className="prop-toggle-row">
          <span className="prop-label">Header Colored Row</span>
          <label className="prop-switch">
            <input
              type="checkbox"
              checked={tb.headers}
              onChange={(e) => updateElementProp('headers', e.target.checked)}
            />
            <span className="prop-slider"></span>
          </label>
        </div>

        <div className="prop-control">
          <label className="prop-label">Grid Border Color</label>
          <input
            type="color"
            className="prop-color-input"
            value={tb.borderColor}
            onChange={(e) => updateElementProp('borderColor', e.target.value)}
          />
        </div>

        <div className="prop-control">
          <label className="prop-label">Header Row Color</label>
          <input
            type="color"
            className="prop-color-input"
            value={tb.headerColor}
            onChange={(e) => updateElementProp('headerColor', e.target.value)}
          />
        </div>

        <div className="prop-control">
          <label className="prop-label">Text Ink Color</label>
          <input
            type="color"
            className="prop-color-input"
            value={tb.color}
            onChange={(e) => updateElementProp('color', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="prop-action-btn" onClick={handleAddRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <Plus size={12} /> Add Row
          </button>
          <button className="prop-action-btn" onClick={handleAddCol} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <Plus size={12} /> Add Column
          </button>
        </div>
      </div>
    );
  };

  // RENDER IMAGE / STICKER / DEFAULT DRAWING LAYER PROPERTIES
  const renderStickerProperties = (el: PageElement) => {
    return (
      <div className="panel-section">
        <h3 className="section-title"><Settings size={14} style={{ marginRight: '6px' }} /> Layout & placement</h3>

        <div className="prop-control">
          <label className="prop-label">Opacity: {Math.round(el.opacity * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={el.opacity}
            onChange={(e) => updateElementProp('opacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="prop-control">
          <label className="prop-label">Angle Rotation: {el.rotation}°</label>
          <input
            type="range"
            min="-180"
            max="180"
            value={el.rotation}
            onChange={(e) => updateElementProp('rotation', parseInt(e.target.value))}
          />
        </div>

        {el.type === 'image' && (
          <div className="prop-control">
            <label className="prop-label">Handwritten Caption</label>
            <input
              type="text"
              className="prop-text-input"
              value={(el as ImageElement).caption || ''}
              onChange={(e) => updateElementProp('caption', e.target.value)}
              placeholder="Add photo label..."
            />
          </div>
        )}
      </div>
    );
  };

  // RENDER DYNAMIC COMPONENT PANEL MATCHING SELECTION
  const renderPanelDetails = () => {
    if (!selectedElement) return renderCanvasProperties();

    const titleMap: Record<string, string> = {
      text: 'Text Inspector',
      shape: 'Shape Inspector',
      table: 'Table Inspector',
      sticker: 'Sticker Inspector',
      image: 'Image Inspector',
      drawing: 'Sketch Inspector'
    };

    return (
      <>
        {/* Element specific headers */}
        <div className="selection-item-header">
          <span className="item-inspector-title">
            {titleMap[selectedElement.type] || 'Element Inspector'}
          </span>
          <div className="item-top-actions">
            {/* Lock Toggles */}
            <button
              onClick={() => updateElementProp('locked', !selectedElement.locked)}
              className="item-badge-btn"
              title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
            >
              {selectedElement.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button
              onClick={() => onDeleteElement(selectedElement.id)}
              className="item-badge-btn text-red"
              title="Delete Element"
            >
              <Trash2 size={13} />
            </button>
            {onDeselect && (
              <button
                onClick={onDeselect}
                className="item-badge-btn close-btn-inspector"
                title="Close Inspector"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Specific Element control panels */}
        {selectedElement.type === 'text' && renderTextProperties(selectedElement)}
        {selectedElement.type === 'shape' && renderShapeProperties(selectedElement)}
        {selectedElement.type === 'table' && renderTableProperties(selectedElement)}
        {(selectedElement.type === 'sticker' || selectedElement.type === 'image' || selectedElement.type === 'drawing') && renderStickerProperties(selectedElement)}

        {/* Global Layer Position tools */}
        {!selectedElement.locked && (
          <div className="panel-section border-top">
            <h3 className="section-title">Arrange Layer</h3>
            <div className="layer-shift-row">
              <button className="prop-action-btn-mini" onClick={() => shiftLayer('front')} title="Bring Layer Forward">
                <ChevronsUp size={14} /> Bring Forward
              </button>
              <button className="prop-action-btn-mini" onClick={() => shiftLayer('back')} title="Send Layer Backward">
                <ChevronsDown size={14} /> Send Backward
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="app-properties-panel">
      {renderPanelDetails()}
    </div>
  );
};
