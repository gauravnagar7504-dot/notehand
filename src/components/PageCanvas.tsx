import React, { useState, useRef, useEffect } from 'react';
import type { Page, PageElement, ShapeType, PenType, HandwritingFontStyle, TextElement } from '../types';
import { Trash2 } from 'lucide-react';
import { HandwrittenText } from './HandwrittenText';
import { getHandDrawnLinePath, getHandDrawnRectPath, getHandDrawnCirclePath, getHandDrawnTrianglePath, getHandDrawnDiamondPath, getHandDrawnArrowPath, getHandDrawnBracketPath, getHandDrawnBracePath, getHandDrawnCloudPath } from '../utils/handDrawn';
import { STICKER_PRESETS } from '../data/stickers';
import { generateId } from '../utils/storage';

interface PageCanvasProps {
  page: Page;
  activeTool: string; // 'select' | 'text' | 'pen' | 'highlighter' | 'eraser' | 'shape' | 'sticker' | 'table' | 'checkbox'
  selectedShapeType: ShapeType;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  updatePageElements: (elements: PageElement[]) => void;
  zoom: number;
  penColor: string;
  penThickness: number;
  penType: PenType;
  fontStyle: HandwritingFontStyle;
  fontSize: number;
  highlightColor: string;
  captureHistoryState: () => void;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  page,
  activeTool,
  selectedShapeType,
  selectedElementId,
  setSelectedElementId,
  updatePageElements,
  zoom,
  penColor,
  penThickness,
  penType,
  fontStyle,
  fontSize,
  captureHistoryState
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  
  // Dragging/resizing/rotating state
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'resize-br' | 'resize-tr' | 'resize-bl' | 'resize-tl' | 'rotate'>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });
  
  // Inline text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextVal, setEditingTextVal] = useState('');
  
  // Shape preview coordinates (when drawing a shape)
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapePreviewRect, setShapePreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Table cell editing
  const [editingTableCell, setEditingTableCell] = useState<{ elementId: string; row: number; col: number } | null>(null);
  const [editingTableCellVal, setEditingTableCellVal] = useState('');

  const selectedElement = page.elements.find(el => el.id === selectedElementId);

  // Keyboard shortcut listener for deleting selected elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if we are not editing text in inputs/textareas
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          selectedElementId &&
          !editingTextId &&
          !editingTableCell
        ) {
          updatePageElements(page.elements.filter(el => el.id !== selectedElementId));
          setSelectedElementId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, page.elements, editingTextId, editingTableCell]);

  // Translate client coordinates to canvas space
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  };

  const startDrag = (e: React.MouseEvent, mode: typeof dragMode) => {
    e.stopPropagation();
    if (!selectedElement) return;
    captureHistoryState();
    setDragMode(mode);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStartPos({
      x: selectedElement.x,
      y: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height,
      rotation: selectedElement.rotation
    });
  };

  // MOUSE DOWN HANDLER
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    
    // Blur any active textareas if clicking on canvas
    if (editingTextId && e.target === containerRef.current) {
      finishTextEditing();
    }
    if (editingTableCell && e.target === containerRef.current) {
      finishTableCellEditing();
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);

    // DRAWING MODE (PEN / HIGHLIGHTER)
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setDrawingPoints([coords]);
      return;
    }

    // SHAPE DRAWING MODE
    if (activeTool === 'shape') {
      setShapeStart(coords);
      setShapePreviewRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
      return;
    }

    // SELECT TOOL / DRAGGING & TRANSFORMATIONS
    if (activeTool === 'select') {
      // If clicking inside a resize handle or rotation trackball, those have separate events.
      // We will check if the user clicked directly on an element
      const clickedElement = [...page.elements]
        .sort((a, b) => b.layerOrder - a.layerOrder) // Check top elements first
        .find(el => {
          // A rough bounding box check
          const cx = coords.x;
          const cy = coords.y;
          // Account for rotation by checking non-rotated box for simple hit test
          // For high fidelity, we can just do a bounding box check
          return cx >= el.x && cx <= el.x + el.width && cy >= el.y && cy <= el.y + el.height;
        });

      if (clickedElement) {
        if (clickedElement.locked) {
          setSelectedElementId(clickedElement.id);
          return;
        }
        setSelectedElementId(clickedElement.id);
        captureHistoryState();
        setDragMode('move');
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStartPos({
          x: clickedElement.x,
          y: clickedElement.y,
          width: clickedElement.width,
          height: clickedElement.height,
          rotation: clickedElement.rotation
        });
      } else {
        setSelectedElementId(null);
      }
    }
  };

  // MOUSE MOVE HANDLER
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // DRAWING
    if (isDrawing && (activeTool === 'pen' || activeTool === 'highlighter')) {
      setDrawingPoints(prev => [...prev, coords]);
      return;
    }

    // SHAPE PREVIEW
    if (shapeStart && shapePreviewRect) {
      const dx = coords.x - shapeStart.x;
      const dy = coords.y - shapeStart.y;
      setShapePreviewRect({
        x: dx < 0 ? coords.x : shapeStart.x,
        y: dy < 0 ? coords.y : shapeStart.y,
        w: Math.abs(dx),
        h: Math.abs(dy)
      });
      return;
    }

    // TRANSFORMING SELECT ELEMENT
    if (dragMode !== 'none' && selectedElement && !selectedElement.locked) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      const updated = page.elements.map(el => {
        if (el.id !== selectedElement.id) return el;

        if (dragMode === 'move') {
          return {
            ...el,
            x: Math.round(elementStartPos.x + dx),
            y: Math.round(elementStartPos.y + dy)
          };
        }

        if (dragMode === 'resize-br') {
          return {
            ...el,
            width: Math.max(20, Math.round(elementStartPos.width + dx)),
            height: Math.max(20, Math.round(elementStartPos.height + dy))
          };
        }
        
        if (dragMode === 'resize-bl') {
          const newWidth = Math.max(20, Math.round(elementStartPos.width - dx));
          return {
            ...el,
            x: Math.round(elementStartPos.x + (elementStartPos.width - newWidth)),
            width: newWidth,
            height: Math.max(20, Math.round(elementStartPos.height + dy))
          };
        }

        if (dragMode === 'resize-tr') {
          const newHeight = Math.max(20, Math.round(elementStartPos.height - dy));
          return {
            ...el,
            y: Math.round(elementStartPos.y + (elementStartPos.height - newHeight)),
            width: Math.max(20, Math.round(elementStartPos.width + dx)),
            height: newHeight
          };
        }

        if (dragMode === 'resize-tl') {
          const newWidth = Math.max(20, Math.round(elementStartPos.width - dx));
          const newHeight = Math.max(20, Math.round(elementStartPos.height - dy));
          return {
            ...el,
            x: Math.round(elementStartPos.x + (elementStartPos.width - newWidth)),
            y: Math.round(elementStartPos.y + (elementStartPos.height - newHeight)),
            width: newWidth,
            height: newHeight
          };
        }

        if (dragMode === 'rotate') {
          // Calculate angle from element center to mouse pointer
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);
          // Adjust for starting angle
          return {
            ...el,
            rotation: Math.round(angle - 90) // Offset rotation handle being at the top
          };
        }

        return el;
      });

      updatePageElements(updated);
    }
  };

  // MOUSE UP HANDLER
  const handleMouseUp = (_e: React.MouseEvent) => {

    // SAVE DRAWING
    if (isDrawing && (activeTool === 'pen' || activeTool === 'highlighter')) {
      setIsDrawing(false);
      if (drawingPoints.length > 1) {
        // Calculate bounding box of drawing points
        const xs = drawingPoints.map(p => p.x);
        const ys = drawingPoints.map(p => p.y);
        const minX = Math.min(...xs) - 5;
        const maxX = Math.max(...xs) + 5;
        const minY = Math.min(...ys) - 5;
        const maxY = Math.max(...ys) + 5;

        // Translate points relative to bounding box top-left
        const translatedPoints = drawingPoints.map(p => ({
          x: Math.round(p.x - minX),
          y: Math.round(p.y - minY)
        }));

        const newDrawingElement: PageElement = {
          id: generateId(),
          type: 'drawing',
          x: Math.round(minX),
          y: Math.round(minY),
          width: Math.round(maxX - minX),
          height: Math.round(maxY - minY),
          rotation: 0,
          opacity: activeTool === 'highlighter' ? 0.65 : 1.0,
          layerOrder: page.elements.length + 1,
          locked: false,
          points: translatedPoints,
          strokeWidth: penThickness,
          color: penColor,
          isHighlighter: activeTool === 'highlighter'
        };

        captureHistoryState();
        updatePageElements([...page.elements, newDrawingElement]);
      }
      setDrawingPoints([]);
      return;
    }

    // SAVE SHAPE DRAWING
    if (shapeStart && shapePreviewRect) {
      if (shapePreviewRect.w > 10 || shapePreviewRect.h > 10) {
        const newShapeElement: PageElement = {
          id: generateId(),
          type: 'shape',
          x: Math.round(shapePreviewRect.x),
          y: Math.round(shapePreviewRect.y),
          width: Math.round(shapePreviewRect.w),
          height: Math.round(shapePreviewRect.h),
          rotation: 0,
          opacity: 1,
          layerOrder: page.elements.length + 1,
          locked: false,
          shapeType: selectedShapeType,
          strokeWidth: Math.max(1.5, penThickness * 0.4),
          strokeColor: penColor,
          fillColor: 'transparent',
          roughness: 1.2
        };
        captureHistoryState();
        updatePageElements([...page.elements, newShapeElement]);
        setSelectedElementId(newShapeElement.id);
      }
      setShapeStart(null);
      setShapePreviewRect(null);
      return;
    }

    // RESET DRAGS
    if (dragMode !== 'none') {
      setDragMode('none');
    }
  };

  // DOUBLE CLICK HANDLER
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // If double clicking in selection mode, find if text element clicked
    if (activeTool === 'select') {
      const clickedText = [...page.elements]
        .sort((a, b) => b.layerOrder - a.layerOrder)
        .find(el => {
          return el.type === 'text' && coords.x >= el.x && coords.x <= el.x + el.width && coords.y >= el.y && coords.y <= el.y + el.height;
        });

      if (clickedText && clickedText.type === 'text') {
        startTextEditing(clickedText.id, clickedText.content);
        return;
      }
    }

    // In select/text tools, double clicking blank canvas creates a new text block
    if (activeTool === 'select' || activeTool === 'text') {
      const newTextElement: PageElement = {
        id: generateId(),
        type: 'text',
        x: Math.round(coords.x),
        y: Math.round(coords.y),
        width: 350,
        height: 80,
        rotation: 0,
        opacity: 1.0,
        layerOrder: page.elements.length + 1,
        locked: false,
        content: 'Double click to edit note.',
        fontSize: fontSize,
        color: penColor,
        fontStyle: fontStyle,
        penType: penType,
        lineSpacing: 1.3,
        slant: 0,
        jitter: 0.3,
        bold: false,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      };

      captureHistoryState();
      updatePageElements([...page.elements, newTextElement]);
      setSelectedElementId(newTextElement.id);
      startTextEditing(newTextElement.id, newTextElement.content);
    }
  };

  // Erase tool click eraser
  const handleEraserClick = (elId: string) => {
    if (activeTool === 'eraser') {
      captureHistoryState();
      updatePageElements(page.elements.filter(el => el.id !== elId));
      if (selectedElementId === elId) {
        setSelectedElementId(null);
      }
    }
  };

  // TEXT BLOCK INLINE EDITING START
  const startTextEditing = (id: string, text: string) => {
    setEditingTextId(id);
    setEditingTextVal(text);
  };

  // TEXT BLOCK INLINE EDITING SAVE
  const finishTextEditing = () => {
    if (!editingTextId) return;
    const textVal = editingTextVal.trim();
    const original = page.elements.find(el => el.id === editingTextId);
    
    if (original && original.type === 'text' && original.content !== editingTextVal) {
      captureHistoryState();
    }

    if (textVal === '') {
      // Remove empty text boxes
      updatePageElements(page.elements.filter(el => el.id !== editingTextId));
      setSelectedElementId(null);
    } else {
      updatePageElements(
        page.elements.map(el => {
          if (el.id === editingTextId && el.type === 'text') {
            return {
              ...el,
              content: editingTextVal
            };
          }
          return el;
        })
      );
    }
    setEditingTextId(null);
  };

  // TABLE CELL EDITING
  const startTableCellEditing = (elId: string, rowIdx: number, colIdx: number, val: string) => {
    setEditingTableCell({ elementId: elId, row: rowIdx, col: colIdx });
    setEditingTableCellVal(val);
  };

  const finishTableCellEditing = () => {
    if (!editingTableCell) return;
    const { elementId, row, col } = editingTableCell;

    const original = page.elements.find(el => el.id === elementId);
    if (original && original.type === 'table') {
      const originalVal = original.cells[row]?.[col];
      if (originalVal !== editingTableCellVal) {
        captureHistoryState();
      }
    }

    updatePageElements(
      page.elements.map(el => {
        if (el.id === elementId && el.type === 'table') {
          const cells = el.cells.map((r, rIdx) => 
            r.map((c, cIdx) => (rIdx === row && cIdx === col ? editingTableCellVal : c))
          );
          return {
            ...el,
            cells
          };
        }
        return el;
      })
    );

    setEditingTableCell(null);
  };

  // Render elements logic
  const renderElement = (el: PageElement) => {
    const isEditingText = el.id === editingTextId;

    // Outer div for base position, sizes, rotations
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: `rotate(${el.rotation}deg)`,
      transformOrigin: 'center center',
      opacity: el.opacity,
      zIndex: el.layerOrder,
      cursor: activeTool === 'select' ? 'move' : activeTool === 'eraser' ? 'pointer' : 'default',
      userSelect: 'none'
    };

    if (el.locked) {
      style.cursor = 'not-allowed';
    }

    const handleEraserOrSelect = () => {
      if (activeTool === 'eraser') {
        handleEraserClick(el.id);
      } else if (activeTool === 'select') {
        setSelectedElementId(el.id);
      }
    };

    // RENDER CHECKBOX
    if (el.type === 'checkbox') {
      const cb = el;
      return (
        <div key={el.id} style={style} onClick={handleEraserOrSelect}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', height: '100%' }}>
            {/* Hand-drawn checkbox box */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={(e) => {
                if (activeTool !== 'eraser') {
                  e.stopPropagation();
                  captureHistoryState();
                  updatePageElements(
                    page.elements.map(item => (item.id === cb.id ? { ...item, checked: !cb.checked } : item))
                  );
                }
              }}
            >
              {/* Box */}
              <path
                d={getHandDrawnRectPath(2, 2, 20, 20, 1.2)}
                stroke={penColor}
                strokeWidth="2"
                fill="none"
              />
              {/* Check checkmark */}
              {cb.checked && (
                <path
                  d="M 5 12 L 10 17 L 19 6"
                  stroke="#10B981" // Green checkmark
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </svg>
            {/* Label in handwriting style */}
            <svg width={el.width - 32} height={el.height} style={{ overflow: 'visible' }}>
              <HandwrittenText
                content={cb.label}
                fontSize={fontSize}
                color={cb.checked ? '#94A3B8' : colorOverride(penColor)}
                fontStyle={fontStyle}
                penType={penType}
                lineSpacing={1}
                slant={0}
                jitter={0.2}
                bold={false}
                underlineType={cb.checked ? 'straight' : 'none'}
                underlineColor="#94A3B8"
                highlightColor="transparent"
                alignment="left"
                width={el.width - 32}
              />
            </svg>
          </div>
        </div>
      );
    }

    // RENDER DRAWING
    if (el.type === 'drawing') {
      const dw = el;
      let pathData = '';
      if (dw.points.length > 0) {
        pathData = `M ${dw.points[0].x} ${dw.points[0].y}`;
        // Apply smooth bezier points
        for (let i = 1; i < dw.points.length; i++) {
          const xc = (dw.points[i].x + dw.points[i - 1].x) / 2;
          const yc = (dw.points[i].y + dw.points[i - 1].y) / 2;
          pathData += ` Q ${dw.points[i - 1].x} ${dw.points[i - 1].y}, ${xc} ${yc}`;
        }
      }

      return (
        <svg
          key={el.id}
          style={{
            ...style,
            pointerEvents: activeTool === 'eraser' || activeTool === 'select' ? 'auto' : 'none',
            overflow: 'visible'
          }}
          onClick={handleEraserOrSelect}
        >
          <path
            d={pathData}
            stroke={dw.color}
            strokeWidth={dw.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={dw.isHighlighter ? 0.65 : 1}
            style={{ mixBlendMode: dw.isHighlighter ? 'multiply' : 'normal' }}
          />
        </svg>
      );
    }

    // RENDER TEXT ELEMENT
    if (el.type === 'text') {
      const tx = el;
      return (
        <div
          key={el.id}
          style={style}
          onClick={handleEraserOrSelect}
          onDoubleClick={handleDoubleClick}
        >
          {isEditingText ? (
            <textarea
              className="canvas-text-editor"
              value={editingTextVal}
              onChange={(e) => setEditingTextVal(e.target.value)}
              onBlur={finishTextEditing}
              autoFocus
              style={{
                width: '100%',
                height: '100%',
                fontFamily: FONT_PACKS[tx.fontStyle][0],
                fontSize: `${tx.fontSize}px`,
                color: tx.color,
                lineHeight: tx.lineSpacing * 1.5,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                colorScheme: 'light',
                userSelect: 'text'
              }}
            />
          ) : (
            <svg
              width="100%"
              height="100%"
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <HandwrittenText
                content={tx.content}
                fontSize={tx.fontSize}
                color={tx.color}
                fontStyle={tx.fontStyle}
                penType={tx.penType}
                lineSpacing={tx.lineSpacing}
                slant={tx.slant}
                jitter={tx.jitter}
                bold={tx.bold}
                underlineType={tx.underlineType}
                underlineColor={tx.underlineColor}
                highlightColor={tx.highlightColor}
                alignment={tx.alignment}
                width={tx.width}
              />
            </svg>
          )}
        </div>
      );
    }

    // RENDER STICKER
    if (el.type === 'sticker') {
      const st = el;
      const preset = STICKER_PRESETS.find(p => p.id === st.stickerId);
      
      let imageContent = null;
      if (st.isCustom && st.customDataUrl) {
        imageContent = <img src={st.customDataUrl} alt="custom-sticker" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
      } else if (preset) {
        imageContent = (
          <svg
            width="100%"
            height="100%"
            viewBox={preset.viewBox}
            dangerouslySetInnerHTML={{ __html: preset.path }}
            style={{ overflow: 'visible' }}
          />
        );
      }

      return (
        <div key={el.id} style={style} onClick={handleEraserOrSelect}>
          <div style={{ width: '100%', height: '100%', opacity: preset?.opacity }}>
            {imageContent}
          </div>
        </div>
      );
    }

    // RENDER IMAGE
    if (el.type === 'image') {
      const img = el;
      return (
        <div key={el.id} style={style} onClick={handleEraserOrSelect}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <img
              src={img.src}
              alt="canvas-upload"
              style={{
                width: '100%',
                height: img.caption ? 'calc(100% - 30px)' : '100%',
                objectFit: 'contain',
                borderRadius: '2px',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            {img.caption && (
              <svg width="100%" height="30" style={{ overflow: 'visible', marginTop: '4px' }}>
                <HandwrittenText
                  content={img.caption}
                  fontSize={14}
                  color="#475569"
                  fontStyle="casual"
                  penType="pencil"
                  lineSpacing={1}
                  slant={1}
                  jitter={0.2}
                  bold={false}
                  underlineType="none"
                  underlineColor=""
                  highlightColor="transparent"
                  alignment="center"
                  width={el.width}
                />
              </svg>
            )}
          </div>
        </div>
      );
    }

    // RENDER SHAPE
    if (el.type === 'shape') {
      const sh = el;
      let pathData = '';

      switch (sh.shapeType) {
        case 'rect':
          pathData = getHandDrawnRectPath(1, 1, sh.width - 2, sh.height - 2, sh.roughness);
          break;
        case 'circle':
          pathData = getHandDrawnCirclePath(sh.width / 2, sh.height / 2, sh.width / 2 - 3, sh.height / 2 - 3, sh.roughness);
          break;
        case 'ellipse':
          pathData = getHandDrawnCirclePath(sh.width / 2, sh.height / 2, sh.width / 2 - 4, sh.height / 2 - 4, sh.roughness);
          break;
        case 'line':
          pathData = getHandDrawnLinePath(2, 2, sh.width - 4, sh.height - 4, sh.roughness);
          break;
        case 'arrow':
          pathData = getHandDrawnArrowPath(2, 2, sh.width - 4, sh.height - 4, sh.roughness);
          break;
        case 'triangle':
          pathData = getHandDrawnTrianglePath(2, 2, sh.width - 4, sh.height - 4, sh.roughness);
          break;
        case 'diamond':
          pathData = getHandDrawnDiamondPath(2, 2, sh.width - 4, sh.height - 4, sh.roughness);
          break;
        case 'bracket':
          pathData = getHandDrawnBracketPath(2, 2, sh.width - 4, sh.height - 4, 'left', sh.roughness);
          break;
        case 'brace':
          pathData = getHandDrawnBracePath(2, 2, sh.width - 4, sh.height - 4, 'left', sh.roughness);
          break;
        case 'cloud':
          pathData = getHandDrawnCloudPath(2, 2, sh.width - 4, sh.height - 4, sh.roughness);
          break;
        default:
          pathData = '';
      }

      return (
        <div key={el.id} style={style} onClick={handleEraserOrSelect}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg
              width="100%"
              height="100%"
              style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}
            >
              {/* Fill shape background cleanly */}
              {sh.fillColor && sh.fillColor !== 'transparent' && (
                <path
                  d={pathData}
                  fill={sh.fillColor}
                  stroke="none"
                />
              )}
              {/* Stroke */}
              <path
                d={pathData}
                stroke={sh.strokeColor}
                strokeWidth={sh.strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Shape labels rendered center */}
            {sh.label && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  right: '12px',
                  bottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <svg width={sh.width - 24} height={sh.height - 24} style={{ overflow: 'visible' }}>
                  <HandwrittenText
                    content={sh.label}
                    fontSize={Math.max(12, fontSize - 2)}
                    color={sh.strokeColor}
                    fontStyle="casual"
                    penType="gel-pen"
                    lineSpacing={1.1}
                    slant={0}
                    jitter={0.2}
                    bold={false}
                    underlineType="none"
                    underlineColor=""
                    highlightColor="transparent"
                    alignment="center"
                    width={sh.width - 24}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    }

    // RENDER TABLE
    if (el.type === 'table') {
      const tb = el;
      return (
        <div key={el.id} style={style} onClick={handleEraserOrSelect}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateRows: tb.rowHeights.map(h => `${h}px`).join(' '),
              gridTemplateColumns: tb.colWidths.map(w => `${w}px`).join(' '),
              border: `2px solid ${tb.borderColor}`,
              borderRadius: '2px',
              backgroundColor: 'white',
              boxShadow: '1px 2px 4px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
          >
            {tb.cells.map((row, rIdx) => 
              row.map((cellText, cIdx) => {
                const cellId = `${tb.id}-${rIdx}-${cIdx}`;
                const isCellEditing = editingTableCell?.elementId === tb.id && editingTableCell.row === rIdx && editingTableCell.col === cIdx;
                const isHeader = tb.headers && rIdx === 0;

                return (
                  <div
                    key={cellId}
                    onDoubleClick={(e) => {
                      if (activeTool === 'select') {
                        e.stopPropagation();
                        startTableCellEditing(tb.id, rIdx, cIdx, cellText);
                      }
                    }}
                    style={{
                      borderBottom: rIdx < tb.rows - 1 ? `1px solid ${tb.borderColor}` : 'none',
                      borderRight: cIdx < tb.cols - 1 ? `1px solid ${tb.borderColor}` : 'none',
                      backgroundColor: isHeader ? tb.headerColor : 'transparent',
                      padding: '4px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {isCellEditing ? (
                      <input
                        type="text"
                        value={editingTableCellVal}
                        onChange={(e) => setEditingTableCellVal(e.target.value)}
                        onBlur={finishTableCellEditing}
                        onKeyDown={(e) => { if (e.key === 'Enter') finishTableCellEditing(); }}
                        autoFocus
                        style={{
                          width: '100%',
                          height: '100%',
                          fontFamily: FONT_PACKS[fontStyle][0],
                          fontSize: '15px',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <HandwrittenText
                          content={cellText}
                          fontSize={14}
                          color={isHeader ? '#1E293B' : tb.color}
                          fontStyle={fontStyle}
                          penType={penType}
                          lineSpacing={1}
                          slant={0}
                          jitter={0.1}
                          bold={isHeader}
                          underlineType="none"
                          underlineColor=""
                          highlightColor="transparent"
                          alignment="center"
                          width={tb.colWidths[cIdx] - 12}
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const colorOverride = (c: string) => c === 'transparent' ? '#1E293B' : c;

  // Render selection bounds helper (Resize and Rotate controls overlay)
  const renderSelectionHandles = () => {
    if (!selectedElement || activeTool !== 'select') return null;
    const el = selectedElement;

    // Rotated selection box coordinates
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: `rotate(${el.rotation}deg)`,
      transformOrigin: 'center center',
      border: '1.5px dashed #2563EB',
      pointerEvents: 'none',
      zIndex: 9999
    };

    const handleStyle = (cursor: string): React.CSSProperties => ({
      position: 'absolute',
      width: '9px',
      height: '9px',
      borderRadius: '50%',
      backgroundColor: 'white',
      border: '1.5px solid #2563EB',
      pointerEvents: 'auto',
      cursor
    });

    return (
      <div style={style}>
        {/* Resize Handles circles */}
        {!el.locked && (
          <>
            {/* Top Left */}
            <div
              style={{ ...handleStyle('nwse-resize'), top: '-5px', left: '-5px' }}
              onMouseDown={(e) => startDrag(e, 'resize-tl')}
            />
            {/* Top Right */}
            <div
              style={{ ...handleStyle('nesw-resize'), top: '-5px', right: '-5px' }}
              onMouseDown={(e) => startDrag(e, 'resize-tr')}
            />
            {/* Bottom Left */}
            <div
              style={{ ...handleStyle('nesw-resize'), bottom: '-5px', left: '-5px' }}
              onMouseDown={(e) => startDrag(e, 'resize-bl')}
            />
            {/* Bottom Right */}
            <div
              style={{ ...handleStyle('nwse-resize'), bottom: '-5px', right: '-5px' }}
              onMouseDown={(e) => startDrag(e, 'resize-br')}
            />

            {/* Rotation Stem & Handle */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1px',
                height: '15px',
                backgroundColor: '#2563EB'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                border: '1.5px solid white',
                pointerEvents: 'auto',
                cursor: 'grab'
              }}
              onMouseDown={(e) => startDrag(e, 'rotate')}
            />
          </>
        )}

        {/* Floating text context menu bar */}
        {el.type === 'text' && !el.locked && (
          <div
            className="canvas-floating-toolbar"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const tx = el as TextElement;
                updatePageElements(page.elements.map(e => e.id === el.id ? {
                  ...e,
                  bold: !tx.bold
                } as TextElement : e));
              }}
              className={(el as TextElement).bold ? 'active' : ''}
              title="Toggle Bold"
            >
              B
            </button>
            <button
              onClick={() => {
                const tx = el as TextElement;
                updatePageElements(page.elements.map(e => e.id === el.id ? {
                  ...e,
                  highlightColor: tx.highlightColor === 'transparent' ? 'rgba(253, 224, 71, 0.4)' : 'transparent'
                } as TextElement : e));
              }}
              className={(el as TextElement).highlightColor !== 'transparent' ? 'active' : ''}
              title="Toggle Highlight"
            >
              H
            </button>
            <button
              onClick={() => {
                const tx = el as TextElement;
                updatePageElements(page.elements.map(e => e.id === el.id ? {
                  ...e,
                  underlineType: tx.underlineType === 'none' ? 'straight' : 'none'
                } as TextElement : e));
              }}
              className={(el as TextElement).underlineType !== 'none' ? 'active' : ''}
              title="Toggle Underline"
            >
              U
            </button>
            <div className="toolbar-dot-preview" style={{ backgroundColor: (el as TextElement).color }} />
            <button
              onClick={() => {
                const tx = el as TextElement;
                const nextStyle = tx.fontStyle === 'neat-student' ? 'casual' : 'neat-student';
                updatePageElements(page.elements.map(e => e.id === el.id ? {
                  ...e,
                  fontStyle: nextStyle
                } as TextElement : e));
              }}
              title="Toggle Font Style"
            >
              A
            </button>
            <div className="divider-vert" />
            <button
              onClick={() => {
                const duplicated: PageElement = {
                  ...el,
                  id: generateId(),
                  x: el.x + 20,
                  y: el.y + 20,
                  layerOrder: page.elements.length + 1
                };
                updatePageElements([...page.elements, duplicated]);
                setSelectedElementId(duplicated.id);
              }}
              title="Duplicate Block"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button
              onClick={() => {
                updatePageElements(page.elements.filter(e => e.id !== el.id));
                setSelectedElementId(null);
              }}
              className="delete-btn"
              title="Delete Block"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        {/* Lock indicator */}
        {el.locked && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              padding: '2px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🔒
          </div>
        )}
      </div>
    );
  };

  // Convert font style string to array (for reference inside component)
  const FONT_PACKS: Record<HandwritingFontStyle, string[]> = {
    'neat-student': ["'Kalam'"],
    'casual': ["'Kalam'"],
    'messy': ["'Kalam'"],
    'lecture-notes': ["'Patrick Hand'"],
    'signature': ["'Caveat'"]
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent'
      }}
    >
      {/* Active Pen/Highlighter Drawing Layer */}
      {isDrawing && drawingPoints.length > 1 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <path
            d={`M ${drawingPoints[0].x} ${drawingPoints[0].y} ` + drawingPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
            stroke={penColor}
            strokeWidth={penThickness}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={activeTool === 'highlighter' ? 0.5 : 0.9}
            style={{ mixBlendMode: activeTool === 'highlighter' ? 'multiply' : 'normal' }}
          />
        </svg>
      )}

      {/* Shape creation preview bounds */}
      {shapeStart && shapePreviewRect && (
        <div
          style={{
            position: 'absolute',
            left: `${shapePreviewRect.x}px`,
            top: `${shapePreviewRect.y}px`,
            width: `${shapePreviewRect.w}px`,
            height: `${shapePreviewRect.h}px`,
            border: `1.5px dashed ${penColor}`,
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}

      {/* Canvas Elements list */}
      {page.elements.map(el => renderElement(el))}

      {/* Resize overlay box */}
      {renderSelectionHandles()}
    </div>
  );
};
