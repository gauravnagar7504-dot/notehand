import React, { useRef } from 'react';
import {
  MousePointer,
  Type,
  PenTool,
  Highlighter as HighlighterIcon,
  Eraser,
  Sparkles,
  Image as ImageIcon,
  Table,
  CheckSquare,
  Undo2,
  Redo2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  GraduationCap,
  Share,
  ChevronDown,
  Plus,
  Edit3,
  Menu,
  SlidersHorizontal
} from 'lucide-react';
import type { ShapeType, PenType } from '../types';

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  selectedShapeType: ShapeType;
  setSelectedShapeType: (type: ShapeType) => void;
  
  // Pen details
  penColor: string;
  setPenColor: (color: string) => void;
  penThickness: number;
  setPenThickness: (thickness: number) => void;
  penType: PenType;
  setPenType: (type: PenType) => void;
  
  // Undo/Redo state
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // Extra modals triggers
  onOpenStickers: () => void;
  onOpenTemplates: () => void;
  onUploadImage: (file: File) => void;
  onAddTable: () => void;
  onAddCheckbox: () => void;
  
  // Exporters
  onExportPNG: () => void;
  onExportPDF: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetWorkspace: () => void;

  // Context Navigation
  notebookName?: string;
  folderName?: string | null;
  pageTitle?: string;
  onGoHome?: () => void;

  // Responsive Sidebar/Properties controls
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  propertiesOpen?: boolean;
  onToggleProperties?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  selectedShapeType,
  setSelectedShapeType,
  penColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenStickers,
  onOpenTemplates,
  onUploadImage,
  onAddTable,
  onAddCheckbox,
  onExportPNG,
  onExportPDF,
  onExportBackup,
  onImportBackup,
  onResetWorkspace,
  notebookName = 'Study Notebook',
  folderName,
  pageTitle,
  onGoHome,
  sidebarCollapsed = false,
  onToggleSidebar,
  propertiesOpen = false,
  onToggleProperties
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [openDropdown, setOpenDropdown] = React.useState<'none' | 'draw' | 'insert'>('none');

  React.useEffect(() => {
    if (openDropdown === 'none') return;
    const handleClose = () => setOpenDropdown('none');
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [openDropdown]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const handleBackupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImportBackup(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="app-toolbar">
      {/* Left side: Back Home navigation and Notebook Name */}
      <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="toolbar-menu-btn" 
            title={sidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}
          >
            <Menu size={18} />
          </button>
        )}
        <div className="toolbar-breadcrumbs">
          {onGoHome && (
            <button onClick={onGoHome} className="breadcrumb-item" title="Go to Study Desk">
              Home
            </button>
          )}
          
          {folderName && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item" style={{ cursor: 'default' }}>{folderName}</span>
            </>
          )}

          {notebookName && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item" style={{ cursor: 'default', fontWeight: 600 }}>{notebookName}</span>
            </>
          )}

          {pageTitle && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">{pageTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Center side: Exposed Floating Deck of Tools */}
      <div className="toolbar-center-segmented">
        {/* Select & Move tool */}
        <button 
          className={`segment-btn ${activeTool === 'select' ? 'active' : ''}`}
          onClick={() => setActiveTool('select')}
          title="Select & Move Block (V)"
        >
          <MousePointer size={14} />
        </button>

        {/* Freehand Pen tool */}
        <button 
          className={`segment-btn ${activeTool === 'pen' ? 'active' : ''}`}
          onClick={() => setActiveTool('pen')}
          title="Freehand Ink Pen (P)"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PenTool size={14} />
          <span 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: penColor, 
              border: '1px solid var(--border-ui)',
              display: 'inline-block' 
            }} 
          />
        </button>

        {/* Typed text handwriting */}
        <button 
          className={`segment-btn ${activeTool === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTool('text')}
          title="Typed Handwriting (T)"
        >
          <Type size={14} />
        </button>

        {/* Freehand Highlighter */}
        <button 
          className={`segment-btn ${activeTool === 'highlighter' ? 'active' : ''}`}
          onClick={() => setActiveTool('highlighter')}
          title="Freehand Highlighter (H)"
        >
          <HighlighterIcon size={14} />
        </button>

        {/* Eraser tool */}
        <button 
          className={`segment-btn ${activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => setActiveTool('eraser')}
          title="Eraser Tool (E)"
        >
          <Eraser size={14} />
        </button>

        <div className="divider-vert" />

        {/* Draw Shapes Dropdown */}
        <div className="toolbar-segment-item">
          <button 
            className={`segment-btn ${activeTool === 'shape' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool('shape');
              setOpenDropdown(prev => prev === 'draw' ? 'none' : 'draw');
            }}
            title="Draw Shapes (D)"
          >
            <Edit3 size={14} />
            <span>Draw</span>
            <ChevronDown size={10} className="segment-chevron" />
          </button>
          
          <div className={`segment-dropdown-menu ${openDropdown === 'draw' ? 'show' : ''}`} style={{ width: '130px' }} onClick={(e) => e.stopPropagation()}>
            {(['rect', 'circle', 'ellipse', 'line', 'arrow', 'triangle', 'diamond', 'cloud', 'bracket', 'brace'] as ShapeType[]).map((st) => (
              <button
                key={st}
                className={activeTool === 'shape' && selectedShapeType === st ? 'active' : ''}
                onClick={() => {
                  setSelectedShapeType(st);
                  setActiveTool('shape');
                  setOpenDropdown('none');
                }}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Insert Dropdown segment button */}
        <div className="toolbar-segment-item">
          <button 
            className={`segment-btn ${openDropdown === 'insert' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(prev => prev === 'insert' ? 'none' : 'insert');
            }}
          >
            <Plus size={14} />
            <span>Insert</span>
            <ChevronDown size={10} className="segment-chevron" />
          </button>
          
          <div className={`segment-dropdown-menu ${openDropdown === 'insert' ? 'show' : ''}`}>
            <button onClick={() => { onOpenStickers(); setOpenDropdown('none'); }}>
              <Sparkles size={14} /> Stickers Library
            </button>
            <button onClick={() => { fileInputRef.current?.click(); setOpenDropdown('none'); }}>
              <ImageIcon size={14} /> Insert Image
            </button>
            <button onClick={() => { onAddTable(); setOpenDropdown('none'); }}>
              <Table size={14} /> Add Grid Table
            </button>
            <button onClick={() => { onAddCheckbox(); setOpenDropdown('none'); }}>
              <CheckSquare size={14} /> Study Checklist
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="divider-vert" />

        {/* Study templates pick button */}
        <button 
          className="segment-btn" 
          onClick={onOpenTemplates}
          title="Change page template"
        >
          <GraduationCap size={14} />
          <span>Paper</span>
        </button>
      </div>

      {/* Right side: Exposed Undo/Redo and Export */}
      <div className="toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Undo button */}
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className="segment-btn"
          title="Undo (Ctrl+Z)"
          style={{ padding: '6px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Undo2 size={14} />
        </button>

        {/* Redo button */}
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className="segment-btn"
          title="Redo (Ctrl+Y)"
          style={{ padding: '6px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Redo2 size={14} />
        </button>

        {onToggleProperties && (
          <button
            onClick={onToggleProperties}
            className={`segment-btn toolbar-properties-toggle-btn ${propertiesOpen ? 'active' : ''}`}
            title="Paper & Element Settings"
            style={{ padding: '6px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <SlidersHorizontal size={14} />
          </button>
        )}

        <div className="divider-vert" />

        {/* Export dropdown */}
        <div className="export-dropdown-wrapper">
          <button className="export-action-btn-new" title="Export & Backup options">
            <Share size={14} />
            <span>Export</span>
          </button>
          
          <div className="export-dropdown-menu">
            <button onClick={onExportPNG} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={14} /> Download Page as PNG
            </button>
            <button onClick={onExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} /> Export Notebook as PDF
            </button>
            <hr />
            <button onClick={onExportBackup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} /> Backup Workspace (JSON)
            </button>
            <button onClick={() => backupInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={14} /> Restore Workspace (JSON)
            </button>
            <hr />
            <button onClick={onResetWorkspace} className="text-red">
              <RefreshCw size={14} /> Reset Workspace
            </button>
            
            <input
              type="file"
              ref={backupInputRef}
              onChange={handleBackupChange}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
