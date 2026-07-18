import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Pin,
  Copy,
  Trash2,
  FileText,
  BookOpen,
  Calendar,
  Layout,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PagePaper } from './components/PagePaper';
import { PageCanvas } from './components/PageCanvas';
import { StickerPicker } from './components/StickerPicker';
import { TemplatePicker } from './components/TemplatePicker';
import ConfirmModal from './components/ConfirmModal';
import AlertModal from './components/AlertModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import ContextMenu from './components/ContextMenu';
import { useToast } from './components/ToastProvider';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PAGE_TEMPLATES } from './data/templates';
import type { Folder, Notebook, Page, PageElement, PaperStyle, ThemeMode, HandwritingFontStyle, PenType, ShapeType, CustomSticker, HistoryItem } from './types';
import {
  getFolders, saveFolders,
  getNotebooks, saveNotebooks,
  getPages, savePages,
  getCustomStickers, saveCustomStickers,
  getActiveNotebookId, saveActiveNotebookId,
  getActivePageId, saveActivePageId,
  getTheme, saveTheme,
  getZoom, saveZoom,
  generateId, exportBackup
} from './utils/storage';

export const App: React.FC = () => {
  const { showToast } = useToast();

  // Navigation & Hierarchy States
  const [folders, setFolders] = useState<Folder[]>(() => getFolders());
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => getNotebooks());
  const [pages, setPages] = useState<Page[]>(() => getPages());
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>(() => getCustomStickers());

  // Active navigation pointers
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(() => getActiveNotebookId());
  const [activePageId, setActivePageId] = useState<string | null>(() => getActivePageId());

  // Auto-save & custom alerts/modals states
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'info' | 'warning' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [alertModalConfig, setAlertModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'info' | 'success' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({
    isOpen: false,
    x: 0,
    y: 0
  });


  // Collapsible sidebar & Dashboard states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [nbSearchQuery, setNbSearchQuery] = useState('');
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Zoom page with scroll wheel if Ctrl key is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomFactor = -0.0015;
        setZoom(prev => Math.max(0.5, Math.min(1.8, prev + e.deltaY * zoomFactor)));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleNativeWheel);
  }, [activePageId]);

  // Preferences & Active tool configurations
  const [activeTool, setActiveTool] = useState<string>('select'); // select, text, pen, highlighter, eraser, shape, table, checkbox
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>('rect');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(() => getZoom());
  const [theme, setTheme] = useState<ThemeMode>(() => getTheme());

  // Auto-fit page zoom on mobile/tablet viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        const fitZoom = Math.max(0.45, Math.min(1.0, (window.innerWidth - 32) / 750));
        setZoom(fitZoom);
      } else if (window.innerWidth < 1024) {
        const fitZoom = Math.max(0.55, Math.min(1.0, (window.innerWidth - 80) / 750));
        setZoom(fitZoom);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePageId]);

  // Auto-open properties panel on mobile when an element is selected
  useEffect(() => {
    if (selectedElementId) {
      setPropertiesOpen(true);
    }
  }, [selectedElementId]);

  // Pen properties
  const [penColor, setPenColor] = useState<string>('#0F172A');
  const [penThickness, setPenThickness] = useState<number>(3);
  const [penType, setPenType] = useState<PenType>('gel-pen');
  const [fontStyle] = useState<HandwritingFontStyle>('casual');
  const [fontSize] = useState<number>(18);
  const [highlightColor] = useState<string>('rgba(253, 224, 71, 0.4)');

  // Modal / overlay displays
  const [stickersOpen, setStickersOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Undo / Redo history stacks
  const [historyPast, setHistoryPast] = useState<HistoryItem[]>([]);
  const [historyFuture, setHistoryFuture] = useState<HistoryItem[]>([]);

  // Clipboard references
  const copiedElementRef = useRef<PageElement | null>(null);

  // Synchronize active workspace pointers & Clean emojis from DB
  useEffect(() => {
    const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F500}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FC}\u{26C5}\u{26A1}\u{1F4D3}\u{1F4D6}\u{1F4D9}\u{1F4C5}\u{1F4CA}\u{1F4C6}\u{1F4A1}\u{1F4D4}\u{1F4D2}\u{1F4D5}\u{1F4D7}\u{1F4D8}\u{1F5D2}]/gu;
    let needsSave = false;

    const cleanFolders = folders.map(f => {
      if (emojiRegex.test(f.name)) {
        needsSave = true;
        return { ...f, name: f.name.replace(emojiRegex, '').replace(/\s+/g, ' ').trim() };
      }
      return f;
    });

    const cleanNotebooks = notebooks.map(n => {
      if (emojiRegex.test(n.name)) {
        needsSave = true;
        return { ...n, name: n.name.replace(emojiRegex, '').replace(/\s+/g, ' ').trim() };
      }
      return n;
    });

    const cleanPages = pages.map(p => {
      if (emojiRegex.test(p.title)) {
        needsSave = true;
        return { ...p, title: p.title.replace(emojiRegex, '').replace(/\s+/g, ' ').trim() };
      }
      return p;
    });

    if (needsSave) {
      setFolders(cleanFolders);
      setNotebooks(cleanNotebooks);
      setPages(cleanPages);
      saveFolders(cleanFolders);
      saveNotebooks(cleanNotebooks);
      savePages(cleanPages);
    }

    if (activeNotebookId !== null && !notebooks.find(n => n.id === activeNotebookId)) {
      setActiveNotebookId(null);
    }
  }, [notebooks, activeNotebookId]);

  useEffect(() => {
    // If active page is invalid or belongs to another notebook, select the first page of active notebook
    if (activeNotebookId) {
      const notebookPages = pages.filter(p => p.notebookId === activeNotebookId).sort((a,b) => a.pageNumber - b.pageNumber);
      if (notebookPages.length > 0 && (!activePageId || !notebookPages.find(p => p.id === activePageId))) {
        setActivePageId(notebookPages[0].id);
      }
    } else {
      setActivePageId(null);
    }
  }, [activeNotebookId, pages, activePageId]);

  // Synchronize storage
  const foldersFirstRef = useRef(true);
  useEffect(() => {
    saveFolders(folders);
    if (foldersFirstRef.current) {
      foldersFirstRef.current = false;
    } else {
      setSaveStatus('saving');
      const t = setTimeout(() => setSaveStatus('saved'), 600);
      return () => clearTimeout(t);
    }
  }, [folders]);

  const notebooksFirstRef = useRef(true);
  useEffect(() => {
    saveNotebooks(notebooks);
    if (notebooksFirstRef.current) {
      notebooksFirstRef.current = false;
    } else {
      setSaveStatus('saving');
      const t = setTimeout(() => setSaveStatus('saved'), 600);
      return () => clearTimeout(t);
    }
  }, [notebooks]);

  const pagesFirstRef = useRef(true);
  useEffect(() => {
    savePages(pages);
    if (pagesFirstRef.current) {
      pagesFirstRef.current = false;
    } else {
      setSaveStatus('saving');
      const t = setTimeout(() => setSaveStatus('saved'), 600);
      return () => clearTimeout(t);
    }
  }, [pages]);

  useEffect(() => {
    saveCustomStickers(customStickers);
  }, [customStickers]);

  useEffect(() => {
    saveActiveNotebookId(activeNotebookId);
  }, [activeNotebookId]);

  useEffect(() => {
    saveActivePageId(activePageId);
  }, [activePageId]);

  useEffect(() => {
    saveTheme(theme);
    // Apply body theme class
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    saveZoom(zoom);
  }, [zoom]);

  // Add a deep-copy history entry to past stack
  const captureHistoryState = (currentPages: Page[] = pages) => {
    // Deep copy pages and active pointers
    const snapshot: HistoryItem = {
      pages: JSON.parse(JSON.stringify(currentPages)),
      activePageId
    };

    setHistoryPast(prev => {
      const next = [...prev, snapshot];
      if (next.length > 100) next.shift(); // Max size 100
      return next;
    });
    setHistoryFuture([]); // Clear redo stack
  };

  // Keyboard Copy, Paste, Undo, Redo, and Nudge listeners
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Shortcuts modal toggle with ? key
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
        return;
      }

      // Escape deselects
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        setActiveTool('select');
        return;
      }

      // Detect input overrides
      const isInputActive =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (isInputActive) return;

      // Tool Hotkeys
      if (e.key.toLowerCase() === 'v') setActiveTool('select');
      if (e.key.toLowerCase() === 't') setActiveTool('text');
      if (e.key.toLowerCase() === 'p') setActiveTool('pen');
      if (e.key.toLowerCase() === 'h') setActiveTool('highlighter');
      if (e.key.toLowerCase() === 'e') setActiveTool('eraser');

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        triggerUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        triggerRedo();
      }

      // Copy / Paste / Duplicate / Layers
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        handleBringToFrontElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        handleSendToBackElement();
      }

      // Selection Arrow Key Nudges
      if (selectedElementId && activePageId) {
        const activePage = pages.find(p => p.id === activePageId);
        const el = activePage?.elements.find(item => item.id === selectedElementId);
        if (el && !el.locked) {
          const shiftVal = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          
          if (e.key === 'ArrowUp') { dy = -shiftVal; e.preventDefault(); }
          if (e.key === 'ArrowDown') { dy = shiftVal; e.preventDefault(); }
          if (e.key === 'ArrowLeft') { dx = -shiftVal; e.preventDefault(); }
          if (e.key === 'ArrowRight') { dx = shiftVal; e.preventDefault(); }

          if (dx !== 0 || dy !== 0) {
            const updated = activePage!.elements.map(item => {
              if (item.id === selectedElementId) {
                return { ...item, x: item.x + dx, y: item.y + dy };
              }
              return item;
            });
            setPages(pages.map(p => (p.id === activePageId ? { ...p, elements: updated } : p)));
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [pages, activePageId, selectedElementId, historyPast, historyFuture]);

  const triggerUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    
    // Save current to future
    const currentSnapshot: HistoryItem = {
      pages: JSON.parse(JSON.stringify(pages)),
      activePageId
    };
    setHistoryFuture(prev => [currentSnapshot, ...prev]);

    // Restore previous
    setPages(previous.pages);
    if (previous.activePageId) setActivePageId(previous.activePageId);
    setHistoryPast(prev => prev.slice(0, prev.length - 1));
    setSelectedElementId(null);
  };

  const triggerRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];

    // Save current to past
    const currentSnapshot: HistoryItem = {
      pages: JSON.parse(JSON.stringify(pages)),
      activePageId
    };
    setHistoryPast(prev => [...prev, currentSnapshot]);

    // Restore next
    setPages(next.pages);
    if (next.activePageId) setActivePageId(next.activePageId);
    setHistoryFuture(prev => prev.slice(1));
    setSelectedElementId(null);
  };

  // ELEMENT ACTIONS
  const handleCopyElement = () => {
    const activePage = pages.find(p => p.id === activePageId);
    const el = activePage?.elements.find(item => item.id === selectedElementId);
    if (el) {
      copiedElementRef.current = JSON.parse(JSON.stringify(el));
      showToast('Element copied to clipboard', 'info');
    }
  };

  const handlePasteElement = () => {
    if (copiedElementRef.current && activePageId) {
      captureHistoryState();
      const newEl = JSON.parse(JSON.stringify(copiedElementRef.current)) as PageElement;
      newEl.id = generateId();
      newEl.x += 25;
      newEl.y += 25;
      newEl.layerOrder = pages.find(p => p.id === activePageId)!.elements.length + 1;
      newEl.locked = false;

      const updatedPages = pages.map(p => {
        if (p.id === activePageId) {
          return { ...p, elements: [...p.elements, newEl] };
        }
        return p;
      });
      setPages(updatedPages);
      setSelectedElementId(newEl.id);
      showToast('Element pasted', 'success');
    }
  };

  const handleDuplicateElement = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !activePageId) return;
    const el = activePage.elements.find(item => item.id === selectedElementId);
    if (el) {
      captureHistoryState();
      const newEl = JSON.parse(JSON.stringify(el)) as PageElement;
      newEl.id = generateId();
      newEl.x += 25;
      newEl.y += 25;
      newEl.layerOrder = activePage.elements.length + 1;
      newEl.locked = false;

      setPages(pages.map(p => p.id === activePageId ? { ...p, elements: [...p.elements, newEl] } : p));
      setSelectedElementId(newEl.id);
      showToast('Element duplicated', 'success');
    }
  };

  const handleToggleLockElement = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !activePageId) return;
    const el = activePage.elements.find(item => item.id === selectedElementId);
    if (el) {
      captureHistoryState();
      const updated = activePage.elements.map(item => {
        if (item.id === selectedElementId) {
          return { ...item, locked: !item.locked };
        }
        return item;
      });
      setPages(pages.map(p => p.id === activePageId ? { ...p, elements: updated } : p));
      showToast(el.locked ? 'Element unlocked' : 'Element locked', 'info');
    }
  };

  const handleBringToFrontElement = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !selectedElementId) return;
    captureHistoryState();
    const maxOrder = Math.max(...activePage.elements.map(el => el.layerOrder), 0);
    const updated = activePage.elements.map(item => {
      if (item.id === selectedElementId) {
        return { ...item, layerOrder: maxOrder + 1 };
      }
      return item;
    });
    setPages(pages.map(p => p.id === activePageId ? { ...p, elements: updated } : p));
    showToast('Brought to front', 'info');
  };

  const handleSendToBackElement = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage || !selectedElementId) return;
    captureHistoryState();
    const minOrder = Math.min(...activePage.elements.map(el => el.layerOrder), 0);
    const updated = activePage.elements.map(item => {
      if (item.id === selectedElementId) {
        return { ...item, layerOrder: minOrder - 1 };
      }
      return item;
    });
    setPages(pages.map(p => p.id === activePageId ? { ...p, elements: updated } : p));
    showToast('Sent to back', 'info');
  };

  // SUBJECT MUTATIONS
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: 'f-' + generateId(),
      name,
      color: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8c4ff'][Math.floor(Math.random() * 6)],
      createdDate: Date.now()
    };
    setFolders([...folders, newFolder]);
  };

  const handleDeleteFolder = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Folder',
      message: 'Are you sure you want to delete this folder? Notebooks inside will be unassigned.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setFolders(folders.filter(f => f.id !== id));
        setNotebooks(
          notebooks.map(nb => (nb.folderId === id ? { ...nb, folderId: null } : nb))
        );
        showToast('Folder deleted', 'info');
      }
    });
  };

  // NOTEBOOK MUTATIONS
  const handleCreateNotebook = (name: string, cover: any, folderId: string | null) => {
    const notebookId = 'nb-' + generateId();
    const newNotebook: Notebook = {
      id: notebookId,
      folderId,
      name,
      coverStyle: cover || 'spiral-black',
      colorLabel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffdfba', '#e8c4ff'][Math.floor(Math.random() * 5)],
      pinned: false,
      isArchived: false,
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    // Insert first blank page
    const pageId = 'page-' + generateId();
    const newPage: Page = {
      id: pageId,
      notebookId: notebookId,
      title: 'Blank Page 📝',
      pageNumber: 1,
      paperStyle: {
        type: 'ruled',
        color: '#FFFDF0',
        lineColor: '#C0D5E4',
        lineSpacing: 28,
        gridDensity: 25,
        marginLine: true,
        paperTextureStrength: 0.15,
        pageShadow: true,
        pageTilt: false,
        paperGrain: true,
        spiralBinding: 'left',
        paperClip: false,
        cornerFold: false,
        edgeVisible: true
      },
      elements: [],
      tags: [],
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    setNotebooks([...notebooks, newNotebook]);
    setPages([...pages, newPage]);
    setActiveNotebookId(notebookId);
    setActivePageId(pageId);
    showToast('Notebook created', 'success');
  };

  const handleCreateNotebookWithTemplate = (name: string, coverStyle: any, templateId: string) => {
    const notebookId = 'nb-' + generateId();
    const newNotebook: Notebook = {
      id: notebookId,
      folderId: activeFolderId,
      name,
      coverStyle: coverStyle || 'spiral-black',
      colorLabel: ['#ffc8dd', '#bde0fe', '#a2d2ff', '#ffafcc', '#cdb4db', '#e8c4ff'][Math.floor(Math.random() * 6)],
      pinned: false,
      isArchived: false,
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    const pageId = 'page-' + generateId();
    const template = PAGE_TEMPLATES.find(t => t.id === templateId);
    
    let templateElements: PageElement[] = [];
    let pType: PaperStyle['type'] = 'ruled';

    if (template) {
      templateElements = template.elements();
      pType = template.paperStyleType;
    }

    const newPage: Page = {
      id: pageId,
      notebookId: notebookId,
      title: template ? template.name.split(' ')[0] : 'Notes',
      pageNumber: 1,
      paperStyle: {
        type: pType,
        color: pType === 'legal-pad' ? '#FFF9C4' : pType === 'vintage' ? '#F5ECD8' : '#FFFDF0',
        lineColor: pType === 'legal-pad' ? '#E8A7A1' : '#C0D5E4',
        lineSpacing: 28,
        gridDensity: 25,
        marginLine: pType !== 'plain' && pType !== 'graph' && pType !== 'dot-grid',
        paperTextureStrength: 0.15,
        pageShadow: true,
        pageTilt: false,
        paperGrain: true,
        spiralBinding: 'left',
        paperClip: false,
        cornerFold: false,
        edgeVisible: true
      },
      elements: templateElements,
      tags: [],
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    setNotebooks([...notebooks, newNotebook]);
    setPages([...pages, newPage]);
    setActiveNotebookId(notebookId);
    setActivePageId(pageId);
    showToast('Notebook created from template', 'success');
  };

  const handleDeleteNotebook = (id: string) => {
    const nb = notebooks.find(n => n.id === id);
    if (!nb) return;

    if (nb.isArchived) {
      // Hard delete
      setConfirmModalConfig({
        isOpen: true,
        title: 'Permanently Delete Notebook',
        message: 'Are you sure you want to permanently delete this notebook and all its pages? This action cannot be undone.',
        confirmLabel: 'Delete Permanently',
        cancelLabel: 'Cancel',
        variant: 'danger',
        onConfirm: () => {
          setNotebooks(notebooks.filter(n => n.id !== id));
          setPages(pages.filter(p => p.notebookId !== id));
          showToast('Notebook permanently deleted', 'error');
        }
      });
    } else {
      // Archive
      setConfirmModalConfig({
        isOpen: true,
        title: 'Archive Notebook',
        message: 'Are you sure you want to move this notebook to the Archive? You can restore it later.',
        confirmLabel: 'Archive',
        cancelLabel: 'Cancel',
        variant: 'warning',
        onConfirm: () => {
          setNotebooks(notebooks.map(n => n.id === id ? { ...n, isArchived: true, pinned: false } : n));
          showToast('Notebook moved to Trash', 'info');
        }
      });
    }
  };

  const handleDuplicateNotebook = (id: string) => {
    const nb = notebooks.find(n => n.id === id);
    if (!nb) return;

    const newNbId = 'nb-' + generateId();
    const newNb: Notebook = {
      ...nb,
      id: newNbId,
      name: `${nb.name} (Copy)`,
      pinned: false,
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    // Duplicate all pages
    const nbPages = pages.filter(p => p.notebookId === id);
    const dupPages = nbPages.map((p, idx) => ({
      ...p,
      id: 'page-' + generateId() + idx,
      notebookId: newNbId,
      elements: JSON.parse(JSON.stringify(p.elements)) // deep copy elements
    }));

    setNotebooks([...notebooks, newNb]);
    setPages([...pages, ...dupPages]);
    setActiveNotebookId(newNbId);
  };

  const handleRenameNotebook = (id: string, name: string) => {
    setNotebooks(notebooks.map(nb => (nb.id === id ? { ...nb, name, updatedDate: Date.now() } : nb)));
  };

  const handleTogglePinNotebook = (id: string) => {
    setNotebooks(notebooks.map(nb => (nb.id === id ? { ...nb, pinned: !nb.pinned } : nb)));
  };

  // PAGE MUTATIONS
  const handleCreatePage = (notebookId: string, templateId?: string) => {
    captureHistoryState();
    const nbPages = pages.filter(p => p.notebookId === notebookId);
    const nextNumber = nbPages.length + 1;

    const pageId = 'page-' + generateId();
    let templateElements: PageElement[] = [];
    let pType: PaperStyle['type'] = 'ruled';

    if (templateId) {
      const template = PAGE_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        templateElements = template.elements();
        pType = template.paperStyleType;
      }
    }

    // Default style values matching paper style presets
    const newPage: Page = {
      id: pageId,
      notebookId,
      title: templateId ? PAGE_TEMPLATES.find(t => t.id === templateId)!.name.split(' ')[0] : `Page ${nextNumber} 📝`,
      pageNumber: nextNumber,
      paperStyle: {
        type: pType,
        color: pType === 'legal-pad' ? '#FFF9C4' : pType === 'vintage' ? '#F5ECD8' : pType === 'engineering' ? '#F0FDF4' : '#FFFDF0',
        lineColor: pType === 'legal-pad' ? '#E8A7A1' : '#C0D5E4',
        lineSpacing: 28,
        gridDensity: 25,
        marginLine: pType !== 'plain' && pType !== 'graph' && pType !== 'dot-grid',
        paperTextureStrength: 0.15,
        pageShadow: true,
        pageTilt: false,
        paperGrain: true,
        spiralBinding: 'left',
        paperClip: false,
        cornerFold: false,
        edgeVisible: true
      },
      elements: templateElements,
      tags: [],
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    setPages([...pages, newPage]);
    setActivePageId(pageId);
  };

  const handleDeletePage = (id: string) => {
    const targetPage = pages.find(p => p.id === id);
    if (!targetPage) return;

    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Page',
      message: `Are you sure you want to delete page "${targetPage.title}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        captureHistoryState();
        const remainingPages = pages.filter(p => p.id !== id);
        
        // Reset page numbering
        const updated = remainingPages.map(p => {
          if (p.notebookId === targetPage.notebookId && p.pageNumber > targetPage.pageNumber) {
            return { ...p, pageNumber: p.pageNumber - 1 };
          }
          return p;
        });

        setPages(updated);

        // If the deleted page was the active one, pick another page from the same notebook
        if (activePageId === id) {
          const sisterPages = updated.filter(p => p.notebookId === targetPage.notebookId);
          if (sisterPages.length > 0) {
            // Pick the next page, or the previous one if it was the last page
            const candidateIndex = Math.min(targetPage.pageNumber - 1, sisterPages.length - 1);
            setActivePageId(sisterPages[candidateIndex].id);
          } else {
            setActivePageId(null);
          }
        }

        showToast('Page deleted', 'info');
      }
    });
  };

  const handleDuplicatePage = (id: string) => {
    captureHistoryState();
    const targetPage = pages.find(p => p.id === id);
    if (!targetPage) return;

    const nbPages = pages.filter(p => p.notebookId === targetPage.notebookId);
    const newPageId = 'page-' + generateId();
    
    const newPage: Page = {
      ...JSON.parse(JSON.stringify(targetPage)),
      id: newPageId,
      title: `${targetPage.title} (Copy)`,
      pageNumber: nbPages.length + 1,
      createdDate: Date.now(),
      updatedDate: Date.now()
    };

    setPages([...pages, newPage]);
    setActivePageId(newPageId);
  };

  const handleReorderPage = (id: string, direction: 'up' | 'down') => {
    captureHistoryState();
    const targetPage = pages.find(p => p.id === id);
    if (!targetPage) return;

    const nbPages = pages
      .filter(p => p.notebookId === targetPage.notebookId)
      .sort((a,b) => a.pageNumber - b.pageNumber);

    const idx = nbPages.findIndex(p => p.id === id);
    if (idx === -1) return;

    let swapWithId: string | null = null;
    if (direction === 'up' && idx > 0) {
      swapWithId = nbPages[idx - 1].id;
    } else if (direction === 'down' && idx < nbPages.length - 1) {
      swapWithId = nbPages[idx + 1].id;
    }

    if (swapWithId) {
      const swapWithPage = pages.find(p => p.id === swapWithId);
      if (swapWithPage) {
        const num1 = targetPage.pageNumber;
        const num2 = swapWithPage.pageNumber;
        
        const updated = pages.map(p => {
          if (p.id === id) {
            return { ...p, pageNumber: num2 };
          }
          if (p.id === swapWithId) {
            return { ...p, pageNumber: num1 };
          }
          return p;
        });
        setPages(updated);
      }
    }
  };

  const handleRenamePage = (id: string, title: string) => {
    setPages(pages.map(p => (p.id === id ? { ...p, title, updatedDate: Date.now() } : p)));
  };

  // CANVAS PROPERTIES MUTATORS
  const updatePageElements = (elements: PageElement[]) => {
    // Only capture state if adding/deleting or large move (avoid layout lag on subtle drag triggers)
    // We will do inline drag history captures using drag-ends, but simple mutators work here
    setPages(pages.map(p => (p.id === activePageId ? { ...p, elements, updatedDate: Date.now() } : p)));
  };

  const updatePaperStyle = (paperStyle: PaperStyle) => {
    captureHistoryState();
    setPages(pages.map(p => (p.id === activePageId ? { ...p, paperStyle, updatedDate: Date.now() } : p)));
  };

  const updatePageTags = (tags: string[]) => {
    setPages(pages.map(p => (p.id === activePageId ? { ...p, tags, updatedDate: Date.now() } : p)));
  };

  const handleDeleteElement = (id: string) => {
    captureHistoryState();
    updatePageElements(pages.find(p => p.id === activePageId)!.elements.filter(el => el.id !== id));
    setSelectedElementId(null);
  };

  // TOOLBAR EXTRA TRIGGERS
  const handleUploadImage = (file: File) => {
    captureHistoryState();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && activePageId) {
        const newImg: PageElement = {
          id: generateId(),
          type: 'image',
          x: 150,
          y: 150,
          width: 320,
          height: 240,
          rotation: 0,
          opacity: 1,
          layerOrder: pages.find(p => p.id === activePageId)!.elements.length + 1,
          locked: false,
          src: e.target.result as string,
          aspectRatio: 1.33,
          caption: 'Study Reference Photo'
        };
        updatePageElements([...pages.find(p => p.id === activePageId)!.elements, newImg]);
        setSelectedElementId(newImg.id);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTable = () => {
    if (!activePageId) return;
    captureHistoryState();
    const newTable: PageElement = {
      id: generateId(),
      type: 'table',
      x: 100,
      y: 150,
      width: 450,
      height: 180,
      rotation: 0,
      opacity: 1,
      layerOrder: pages.find(p => p.id === activePageId)!.elements.length + 1,
      locked: false,
      rows: 3,
      cols: 3,
      headers: true,
      colWidths: [150, 150, 150],
      rowHeights: [50, 60, 60],
      color: '#1E293B',
      headerColor: '#EFF6FF',
      borderColor: '#CBD5E1',
      cells: [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Cell Data', 'Cell Data', 'Cell Data'],
        ['Cell Data', 'Cell Data', 'Cell Data']
      ]
    };
    updatePageElements([...pages.find(p => p.id === activePageId)!.elements, newTable]);
    setSelectedElementId(newTable.id);
  };

  const handleAddCheckbox = () => {
    if (!activePageId) return;
    captureHistoryState();
    const newCheckbox: PageElement = {
      id: generateId(),
      type: 'checkbox',
      x: 100,
      y: 150,
      width: 350,
      height: 35,
      rotation: 0,
      opacity: 1,
      layerOrder: pages.find(p => p.id === activePageId)!.elements.length + 1,
      locked: false,
      label: 'New Checkbox Task list item',
      checked: false
    };
    updatePageElements([...pages.find(p => p.id === activePageId)!.elements, newCheckbox]);
    setSelectedElementId(newCheckbox.id);
  };

  // STICKER PLACEMENT
  const handlePlaceSticker = (stickerId: string, isCustom: boolean, customDataUrl?: string) => {
    if (!activePageId) return;
    captureHistoryState();
    const newSticker: PageElement = {
      id: generateId(),
      type: 'sticker',
      x: 200,
      y: 200,
      width: 70,
      height: 70,
      rotation: (Math.random() - 0.5) * 8, // slight rotate placement
      opacity: 1,
      layerOrder: pages.find(p => p.id === activePageId)!.elements.length + 1,
      locked: false,
      stickerId,
      isCustom,
      customDataUrl
    };
    updatePageElements([...pages.find(p => p.id === activePageId)!.elements, newSticker]);
    setSelectedElementId(newSticker.id);
  };

  // EXPORTS
  const handleExportPNG = () => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage) return;

    // Temporarily clear selection for a clean export
    const prevSelectedId = selectedElementId;
    setSelectedElementId(null);

    // Wait a brief tick for React to clear the selection outline from DOM
    setTimeout(() => {
      const pageNode = document.querySelector('.notebook-page-wrapper') as HTMLElement;
      if (!pageNode) {
        showToast('Page element not found', 'error');
        setSelectedElementId(prevSelectedId);
        return;
      }

      showToast('Generating PNG image...', 'info');

      html2canvas(pageNode, {
        scale: 2, // 2x resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: activePage.paperStyle.color || '#FFFDF0'
      }).then(canvas => {
        const dataStr = canvas.toDataURL('image/png');
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `${activePage.title.replace(/\s+/g, '_')}_scan.png`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('PNG download started', 'success');
        setSelectedElementId(prevSelectedId);
      }).catch(err => {
        console.error(err);
        showToast('PNG export failed', 'error');
        setSelectedElementId(prevSelectedId);
      });
    }, 50);
  };

  const handleExportPDF = async () => {
    if (!activeNotebook) return;
    const nbPages = pages.filter(p => p.notebookId === activeNotebookId).sort((a,b) => a.pageNumber - b.pageNumber);
    if (nbPages.length === 0) {
      showToast('No pages to export', 'warning');
      return;
    }

    // Temporarily clear selection for a clean export
    const prevSelectedId = selectedElementId;
    setSelectedElementId(null);

    showToast('Exporting Notebook to PDF...', 'info', 4000);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [750, 1000] // matches PagePaper dimensions (750x1000)
      });

      const originalPageId = activePageId;

      for (let i = 0; i < nbPages.length; i++) {
        const page = nbPages[i];
        
        // 1. Switch page
        setActivePageId(page.id);
        
        // 2. Wait for render
        await new Promise(resolve => setTimeout(resolve, 350));
        
        const pageNode = document.querySelector('.notebook-page-wrapper') as HTMLElement;
        if (!pageNode) continue;

        const canvas = await html2canvas(pageNode, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: page.paperStyle.color || '#FFFDF0'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage([750, 1000], 'portrait');
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 750, 1000);
      }

      // Restore
      setActivePageId(originalPageId);
      setSelectedElementId(prevSelectedId);

      pdf.save(`${activeNotebook.name.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF Export Completed!', 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF Export failed', 'error');
      setSelectedElementId(prevSelectedId);
    }
  };

  const handleExportBackup = () => {
    exportBackup(folders, notebooks, pages, customStickers);
    showToast('Backup file generated', 'success');
  };

  const handleImportBackup = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.folders && data.notebooks && data.pages) {
        setFolders(data.folders);
        setNotebooks(data.notebooks);
        setPages(data.pages);
        setCustomStickers(data.stickers || []);
        if (data.notebooks.length > 0) setActiveNotebookId(data.notebooks[0].id);
        
        setAlertModalConfig({
          isOpen: true,
          title: 'Import Successful',
          message: 'Workspace restored successfully! All notebooks, folders, and custom stickers have been loaded.',
          variant: 'success'
        });
        showToast('Backup restored successfully', 'success');
      } else {
        setAlertModalConfig({
          isOpen: true,
          title: 'Import Error',
          message: 'Invalid backup structure. Required notebook data properties are missing.',
          variant: 'warning'
        });
      }
    } catch (err) {
      setAlertModalConfig({
        isOpen: true,
        title: 'Import Error',
        message: 'Failed to parse backup file. Please make sure the JSON format is correct.',
        variant: 'warning'
      });
    }
  };

  const handleResetWorkspace = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reset Workspace',
      message: 'Are you sure you want to reset your workspace? This will delete all custom notebooks and reload the tutorial notes.',
      confirmLabel: 'Reset Everything',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      }
    });
  };
  // active page reference
  const activePage = pages.find(p => p.id === activePageId);
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  // Find pages and index in current notebook
  const activeNotebookPages = pages
    .filter(p => p.notebookId === activeNotebookId)
    .sort((a, b) => a.pageNumber - b.pageNumber);
  const activePageIndex = activeNotebookPages.findIndex(p => p.id === activePageId);

  const handleNextPage = () => {
    if (activePageIndex < activeNotebookPages.length - 1) {
      setActivePageId(activeNotebookPages[activePageIndex + 1].id);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageId(activeNotebookPages[activePageIndex - 1].id);
    }
  };

  const dashboardFolder = folders.find(f => f.id === activeFolderId);
  const dashboardNotebooks = notebooks.filter(nb => {
    const matchesFolder = activeFolderId === null || nb.folderId === activeFolderId;
    const matchesSearch = nb.name.toLowerCase().includes(nbSearchQuery.toLowerCase());
    return matchesFolder && matchesSearch && !nb.isArchived;
  });

  const handleOpenNotebook = (id: string) => {
    setActiveNotebookId(id);
    const nPages = pages.filter(p => p.notebookId === id).sort((a, b) => a.pageNumber - b.pageNumber);
    if (nPages.length > 0) {
      setActivePageId(nPages[0].id);
    } else {
      handleCreatePage(id);
    }
  };

  return (
    <div className={`app-container theme-${theme} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${propertiesOpen ? 'properties-panel-is-open' : ''} ${activeNotebookId === null ? 'in-dashboard' : ''}`}>
      {/* Sidebar navigation */}
      <Sidebar
        folders={folders}
        notebooks={notebooks}
        pages={pages}
        activeFolderId={activeFolderId}
        setActiveFolderId={setActiveFolderId}
        activeNotebookId={activeNotebookId}
        setActiveNotebookId={setActiveNotebookId}
        activePageId={activePageId}
        setActivePageId={setActivePageId}
        theme={theme}
        setTheme={setTheme}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onCreateNotebook={handleCreateNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onDuplicateNotebook={handleDuplicateNotebook}
        onTogglePinNotebook={handleTogglePinNotebook}
        onRenameNotebook={handleRenameNotebook}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onDuplicatePage={handleDuplicatePage}
        onReorderPage={handleReorderPage}
        onRenamePage={handleRenamePage}
        searchQuery={sidebarSearchQuery}
        setSearchQuery={setSidebarSearchQuery}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onOpenSettings={() => setSettingsOpen(true)}
        onShowAlert={(title, message, variant) => setAlertModalConfig({ isOpen: true, title, message, variant })}
      />

      {activeNotebookId === null ? (
        /* Canva-style Dashboard View */
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div className="dashboard-header-text">
              <h2>My Study Desk</h2>
              <p>Organize, search, and design neat handwritten notebooks and documents.</p>
            </div>
            
            <div className="dashboard-controls">
              <div className="dashboard-search-bar">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search notebooks by name..."
                  value={nbSearchQuery}
                  onChange={e => setNbSearchQuery(e.target.value)}
                />
              </div>
              
              <button
                className="dashboard-create-btn"
                onClick={() => handleCreateNotebookWithTemplate('New Notebook', 'spiral-black', 't-blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Create Notebook
              </button>
            </div>
          </header>

          {/* Quick templates panel */}
          <section className="dashboard-section templates-section">
            <h3>Start from a Template</h3>
            <div className="templates-grid">
              <div className="template-card" onClick={() => handleCreateNotebookWithTemplate('Blank Notebook', 'spiral-black', 't-blank')}>
                <div className="template-card-preview plain-paper"><FileText size={28} /></div>
                <h4>Blank Note</h4>
                <p>Start a clean draft</p>
              </div>
              <div className="template-card" onClick={() => handleCreateNotebookWithTemplate('Cornell Lecture Notes', 'leather-brown', 't-cornell')}>
                <div className="template-card-preview cornell-paper"><BookOpen size={28} /></div>
                <h4>Cornell Method</h4>
                <p>Best for study lectures</p>
              </div>
              <div className="template-card" onClick={() => handleCreateNotebookWithTemplate('Weekly Study Planner', 'pastel-pink', 't-planner')}>
                <div className="template-card-preview planner-paper"><Calendar size={28} /></div>
                <h4>Weekly Planner</h4>
                <p>Task tracking & lists</p>
              </div>
              <div className="template-card" onClick={() => handleCreateNotebookWithTemplate('Flowchart Diagram', 'modern-blue', 't-flowchart')}>
                <div className="template-card-preview dot-grid-paper"><Layout size={28} /></div>
                <h4>Mind Map Grid</h4>
                <p>Connect boxes & text</p>
              </div>
            </div>
          </section>

          {/* Notebooks Grid Panel */}
          <section className="dashboard-section notebooks-section">
            <h3>
              {dashboardFolder ? `Subject: ${dashboardFolder.name}` : 'All Notebooks'} ({dashboardNotebooks.length})
            </h3>
            {dashboardNotebooks.length === 0 ? (
              <div className="dashboard-empty-state">
                <p>No notebooks found here. Create a new notebook using the templates above!</p>
              </div>
            ) : (
              <div className="notebooks-grid">
                {dashboardNotebooks.map(nb => {
                  const nbPages = pages.filter(p => p.notebookId === nb.id);
                  return (
                    <div key={nb.id} className="dashboard-notebook-card" onClick={() => handleOpenNotebook(nb.id)}>
                      <div className={`dashboard-notebook-cover cover-${nb.coverStyle}`} style={{ backgroundColor: nb.colorLabel }}>
                        <div className="spine-3d" />
                        <div className="label-plate">
                          <span className="notebook-title-text">{nb.name}</span>
                        </div>
                        {nb.pinned && <span className="notebook-pin-badge"><Pin size={12} fill="currentColor" /></span>}
                        
                        {/* Inline card quick actions */}
                        <div className="notebook-cover-hover-options" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleTogglePinNotebook(nb.id)} title={nb.pinned ? 'Unpin' : 'Pin'}>
                            <Pin size={12} fill={nb.pinned ? 'currentColor' : 'none'} />
                          </button>
                          <button onClick={() => handleDuplicateNotebook(nb.id)} title="Duplicate">
                            <Copy size={12} />
                          </button>
                          <button onClick={() => handleDeleteNotebook(nb.id)} title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="notebook-card-info">
                        <h4>{nb.name}</h4>
                        <p>{nbPages.length} {nbPages.length === 1 ? 'page' : 'pages'}</p>
                        <span className="notebook-card-date">
                          Updated {new Date(nb.updatedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Workspace Editor View */
        <div className="app-main-workspace">
          {/* Top editing tools */}
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            selectedShapeType={selectedShapeType}
            setSelectedShapeType={setSelectedShapeType}
            penColor={penColor}
            setPenColor={setPenColor}
            penThickness={penThickness}
            setPenThickness={setPenThickness}
            penType={penType}
            setPenType={setPenType}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            onUndo={triggerUndo}
            onRedo={triggerRedo}
            onOpenStickers={() => setStickersOpen(true)}
            onOpenTemplates={() => setTemplatesOpen(true)}
            onUploadImage={handleUploadImage}
            onAddTable={handleAddTable}
            onAddCheckbox={handleAddCheckbox}
            onExportPNG={handleExportPNG}
            onExportPDF={handleExportPDF}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetWorkspace={handleResetWorkspace}
            notebookName={activeNotebook?.name}
            folderName={folders.find(f => f.id === activeNotebook?.folderId)?.name || 'Notebooks'}
            pageTitle={activePage?.title || 'Untitled Page'}
            onGoHome={() => {
              setActiveNotebookId(null);
              setActivePageId(null);
            }}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            propertiesOpen={propertiesOpen}
            onToggleProperties={() => setPropertiesOpen(!propertiesOpen)}
          />

          {/* Paper workspace wrapper - desk mat backdrop styled */}
          <div className="paper-canvas-scroll-container desk-backdrop" ref={scrollContainerRef}>
            {activePage ? (
              <div className="canvas-workspace-layout-inner">
                {/* Left Floating Flip Button */}
                {activePageIndex > 0 && (
                  <button className="floating-page-arrow left-arrow" onClick={handlePrevPage} title="Previous Page">
                    <ChevronLeft size={20} />
                  </button>
                )}

                <div className="canvas-zoom-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                  <div 
                    key={activePageId} 
                    className="canvas-page-transition-wrap"
                    onContextMenu={(e) => {
                      if (activeTool === 'select') {
                        e.preventDefault();
                        setContextMenu({
                          isOpen: true,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }
                    }}
                  >
                    <PagePaper paperStyle={activePage.paperStyle} width={750} height={1000}>
                      <PageCanvas
                        page={activePage}
                        activeTool={activeTool}
                        selectedShapeType={selectedShapeType}
                        selectedElementId={selectedElementId}
                        setSelectedElementId={setSelectedElementId}
                        updatePageElements={updatePageElements}
                        zoom={zoom}
                        penColor={penColor}
                        penThickness={penThickness}
                        penType={penType}
                        fontStyle={fontStyle}
                        fontSize={fontSize}
                        highlightColor={highlightColor}
                        captureHistoryState={captureHistoryState}
                      />
                    </PagePaper>
                  </div>
                </div>

                {/* Right Floating Flip Button */}
                {activePageIndex < activeNotebookPages.length - 1 && (
                  <button className="floating-page-arrow right-arrow" onClick={handleNextPage} title="Next Page">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            ) : (
              <div className="empty-workspace-state">
                <h2>Open a notebook page to start writing notes.</h2>
                <p>Double click a notebook in the sidebar or click Home Dashboard to open one.</p>
              </div>
            )}
          </div>

          {/* Consolidated Workspace footer bar containing Zoom & Pagination */}
          {activePage && (
            <div className="workspace-footer-bar">
              {/* Pagination controls */}
              <div className="footer-pagination-controls">
                <button
                  disabled={activePageIndex === 0}
                  onClick={handlePrevPage}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="pagination-label">
                  {activePageIndex + 1} / {activeNotebookPages.length}
                </span>
                <button
                  disabled={activePageIndex === activeNotebookPages.length - 1}
                  onClick={handleNextPage}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="footer-divider-vert" />

              {/* Quick Add Page */}
              <button 
                className="footer-add-page-btn" 
                onClick={() => handleCreatePage(activeNotebookId!)}
                title="Add Page"
              >
                <Plus size={13} />
                <span>Page</span>
              </button>

              <div className="footer-divider-vert" />

              {/* Auto-save indicator */}
              <div className={`save-indicator ${saveStatus}`}>
                <span className="save-dot" />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
              </div>

              <div className="footer-divider-vert" />

              {/* Zoom controls */}
              <div className="footer-zoom-controls">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>−</button>
                <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(1.8, zoom + 0.1))}>＋</button>
                <button className="reset-btn" onClick={() => setZoom(1.0)}>100%</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeNotebookId !== null && (
        <PropertiesPanel
          page={activePage || { id: '', notebookId: '', title: '', pageNumber: 1, paperStyle: {} as any, elements: [], tags: [], createdDate: 0, updatedDate: 0 }}
          selectedElementId={selectedElementId}
          updatePageElements={updatePageElements}
          updatePaperStyle={updatePaperStyle}
          onDeleteElement={handleDeleteElement}
          onDeselect={() => setSelectedElementId(null)}
          updatePageTags={updatePageTags}
          captureHistoryState={captureHistoryState}
        />
      )}

      {/* Stickers Selector Modal */}
      <StickerPicker
        isOpen={stickersOpen}
        onClose={() => setStickersOpen(false)}
        onSelectSticker={handlePlaceSticker}
        customStickers={customStickers}
        onAddCustomSticker={(sticker) => setCustomStickers([...customStickers, sticker])}
        onDeleteCustomSticker={(id) => setCustomStickers(customStickers.filter(s => s.id !== id))}
      />

      {/* Templates Selector Modal */}
      <TemplatePicker
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelectTemplate={(templateId) => handleCreatePage(activeNotebookId || '', templateId)}
      />

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        cancelLabel={confirmModalConfig.cancelLabel}
        variant={confirmModalConfig.variant}
        onConfirm={() => {
          confirmModalConfig.onConfirm();
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModalConfig.isOpen}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        variant={alertModalConfig.variant}
        onClose={() => setAlertModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        storageUsage={{
          size: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`,
          percentage: Math.max(2, (JSON.stringify(localStorage).length / (1024 * 5120)) * 100)
        }}
        notebookCount={notebooks.length}
        pageCount={pages.length}
        folderCount={folders.length}
        onExportBackup={handleExportBackup}
        onResetWorkspace={handleResetWorkspace}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onCopy={handleCopyElement}
        onPaste={handlePasteElement}
        onDelete={() => selectedElementId && handleDeleteElement(selectedElementId)}
        onDuplicate={handleDuplicateElement}
        onToggleLock={handleToggleLockElement}
        onBringToFront={handleBringToFrontElement}
        onSendToBack={handleSendToBackElement}
        isLocked={activePage?.elements.find(el => el.id === selectedElementId)?.locked || false}
        hasSelection={selectedElementId !== null}
        hasClipboard={copiedElementRef.current !== null}
      />
    </div>
  );
};
export default App;
