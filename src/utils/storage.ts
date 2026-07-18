import type { Folder, Notebook, Page, CustomSticker, ThemeMode } from '../types';

const STORAGE_KEYS = {
  FOLDERS: 'handnote_folders',
  NOTEBOOKS: 'handnote_notebooks',
  PAGES: 'handnote_pages',
  CUSTOM_STICKERS: 'handnote_custom_stickers',
  ACTIVE_NOTEBOOK: 'handnote_active_notebook_id',
  ACTIVE_PAGE: 'handnote_active_page_id',
  THEME: 'handnote_theme',
  ZOOM: 'handnote_zoom'
};

// Generates UUID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function saveFolders(folders: Folder[]): void {
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}

export function getFolders(): Folder[] {
  const folders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
  return folders ? JSON.parse(folders) : getInitialFolders();
}

export function saveNotebooks(notebooks: Notebook[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTEBOOKS, JSON.stringify(notebooks));
}

export function getNotebooks(): Notebook[] {
  const notebooks = localStorage.getItem(STORAGE_KEYS.NOTEBOOKS);
  return notebooks ? JSON.parse(notebooks) : getInitialNotebooks();
}

export function savePages(pages: Page[]): void {
  localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
}

export function getPages(): Page[] {
  const pages = localStorage.getItem(STORAGE_KEYS.PAGES);
  if (pages) {
    return JSON.parse(pages);
  }
  // Generate initial pages for the preloaded notebooks
  return getInitialPages();
}

export function saveCustomStickers(stickers: CustomSticker[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_STICKERS, JSON.stringify(stickers));
}

export function getCustomStickers(): CustomSticker[] {
  const stickers = localStorage.getItem(STORAGE_KEYS.CUSTOM_STICKERS);
  return stickers ? JSON.parse(stickers) : [];
}

export function saveActiveNotebookId(id: string | null): void {
  if (id) localStorage.setItem(STORAGE_KEYS.ACTIVE_NOTEBOOK, id);
  else localStorage.removeItem(STORAGE_KEYS.ACTIVE_NOTEBOOK);
}

export function getActiveNotebookId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_NOTEBOOK);
}

export function saveActivePageId(id: string | null): void {
  if (id) localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, id);
  else localStorage.removeItem(STORAGE_KEYS.ACTIVE_PAGE);
}

export function getActivePageId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
}

export function saveTheme(theme: ThemeMode): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function getTheme(): ThemeMode {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'classic';
}

export function saveZoom(zoom: number): void {
  localStorage.setItem(STORAGE_KEYS.ZOOM, zoom.toString());
}

export function getZoom(): number {
  const zoom = localStorage.getItem(STORAGE_KEYS.ZOOM);
  return zoom ? parseFloat(zoom) : 1.0;
}

// Initial seeding data
function getInitialFolders(): Folder[] {
  return [
    { id: 'f-study', name: 'Semester Classes', color: '#ffb3ba', createdDate: Date.now() },
    { id: 'f-personal', name: 'Daily Planners', color: '#baffc9', createdDate: Date.now() }
  ];
}

function getInitialNotebooks(): Notebook[] {
  return [
    {
      id: 'nb-biology',
      folderId: 'f-study',
      name: 'Biology & Anatomy',
      coverStyle: 'vintage-green',
      colorLabel: '#baffc9',
      pinned: true,
      isArchived: false,
      createdDate: Date.now(),
      updatedDate: Date.now()
    },
    {
      id: 'nb-planner',
      folderId: 'f-personal',
      name: 'Weekly Study Planner',
      coverStyle: 'leather-brown',
      colorLabel: '#bae1ff',
      pinned: false,
      isArchived: false,
      createdDate: Date.now(),
      updatedDate: Date.now()
    }
  ];
}

function getInitialPages(): Page[] {
  const pages: Page[] = [];

  // Biology Notebook Page 1
  pages.push({
    id: 'page-bio-1',
    notebookId: 'nb-biology',
    title: 'Anatomy of the Human Heart',
    pageNumber: 1,
    paperStyle: {
      type: 'ruled',
      color: '#FFFDF0', // Vintage ivory
      lineColor: '#C0D5E4', // Soft blue rules
      lineSpacing: 28,
      gridDensity: 25,
      marginLine: true,
      paperTextureStrength: 0.2,
      pageShadow: true,
      pageTilt: true,
      paperGrain: true,
      spiralBinding: 'left',
      paperClip: false,
      cornerFold: true,
      edgeVisible: true
    },
    tags: ['study', 'anatomy', 'biology'],
    createdDate: Date.now(),
    updatedDate: Date.now(),
    elements: [
      {
        id: 'el-bio-h1',
        type: 'text',
        x: 90,
        y: 40,
        width: 600,
        height: 60,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 1,
        locked: false,
        content: 'Topic 01: Cardiovascular System',
        fontSize: 32,
        color: '#8B0000', // Dark Red
        fontStyle: 'neat-student',
        penType: 'fountain-pen',
        lineSpacing: 1.2,
        slant: 2,
        jitter: 0.3,
        bold: true,
        underlineType: 'hand-drawn',
        underlineColor: '#FF6347',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      {
        id: 'el-bio-text1',
        type: 'text',
        x: 90,
        y: 110,
        width: 620,
        height: 180,
        rotation: 0.5,
        opacity: 1,
        layerOrder: 2,
        locked: false,
        content: 'The heart acts as a double pump in the human body. The right side receives oxygen-poor blood and pumps it to the lungs (Pulmonary Circulation), while the left side receives oxygen-rich blood and pumps it to the rest of the body (Systemic Circulation).\n\nKey Chambers:\n1. Right & Left Atria (Receiving chambers)\n2. Right & Left Ventricles (Pumping chambers)',
        fontSize: 18,
        color: '#1E293B',
        fontStyle: 'casual',
        penType: 'gel-pen',
        lineSpacing: 1.5,
        slant: -1,
        jitter: 0.4,
        bold: false,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      // Tip box
      {
        id: 'el-bio-box',
        type: 'shape',
        shapeType: 'rect',
        x: 90,
        y: 330,
        width: 620,
        height: 120,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 3,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#D97706',
        fillColor: '#FEF3C7', // Soft warm yellow
        roughness: 1.2,
        label: 'Study Tip: Remember that arteries carry blood AWAY from the heart, while veins carry blood TOWARDS it (except pulmonary vessels!).'
      },
      // Checklists
      {
        id: 'el-bio-check1',
        type: 'checkbox',
        x: 100,
        y: 475,
        width: 250,
        height: 30,
        rotation: 0,
        opacity: 1,
        layerOrder: 4,
        locked: false,
        label: 'Draw cardiac cycle flowchart',
        checked: true
      },
      {
        id: 'el-bio-check2',
        type: 'checkbox',
        x: 100,
        y: 505,
        width: 250,
        height: 30,
        rotation: 0,
        opacity: 1,
        layerOrder: 5,
        locked: false,
        label: 'Review heart valves functions',
        checked: false
      },
      {
        id: 'el-bio-check3',
        type: 'checkbox',
        x: 100,
        y: 535,
        width: 250,
        height: 30,
        rotation: 0,
        opacity: 1,
        layerOrder: 6,
        locked: false,
        label: 'Solve MCQ practice sheet',
        checked: false
      },
      // Sticky note representation
      {
        id: 'el-bio-sticky',
        type: 'shape',
        shapeType: 'rect',
        x: 450,
        y: 470,
        width: 260,
        height: 120,
        rotation: 1.5,
        opacity: 0.95,
        layerOrder: 7,
        locked: false,
        strokeWidth: 1.5,
        strokeColor: '#059669',
        fillColor: '#D1FAE5', // Soft green sticky
        roughness: 1.5,
        label: 'Definition: Myocardium is the muscular tissue of the heart, responsible for involuntary contracting beats!'
      }
    ]
  });

  // Biology Notebook Page 2 (Flowcharts and shapes)
  pages.push({
    id: 'page-bio-2',
    notebookId: 'nb-biology',
    title: 'Flow of Blood Diagram',
    pageNumber: 2,
    paperStyle: {
      type: 'dot-grid',
      color: '#FAF7ED', // Cream ivory paper matching image
      lineColor: '#A4BFCF', // Soft blue-gray dots matching image
      lineSpacing: 25,
      gridDensity: 24,
      marginLine: false,
      paperTextureStrength: 0.1,
      pageShadow: true,
      pageTilt: false,
      paperGrain: true,
      spiralBinding: 'left',
      paperClip: true,
      cornerFold: false,
      edgeVisible: true
    },
    tags: ['study', 'diagrams', 'flowchart'],
    createdDate: Date.now(),
    updatedDate: Date.now(),
    elements: [
      {
        id: 'el-bio2-h1',
        type: 'text',
        x: 60,
        y: 40,
        width: 600,
        height: 50,
        rotation: 0.5,
        opacity: 1,
        layerOrder: 1,
        locked: false,
        content: 'Blood Flow Sequence',
        fontSize: 28,
        color: '#1E293B',
        fontStyle: 'casual',
        penType: 'gel-pen',
        lineSpacing: 1.2,
        slant: 0,
        jitter: 0.2,
        bold: true,
        underlineType: 'wavy',
        underlineColor: '#10B981',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      // Box 1: Vena Cava
      {
        id: 'el-shape-1',
        type: 'shape',
        shapeType: 'rect',
        x: 100,
        y: 130,
        width: 160,
        height: 60,
        rotation: -1,
        opacity: 1,
        layerOrder: 2,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#3B82F6', // Blue
        fillColor: '#DBEAFE',
        roughness: 1.1,
        label: 'Vena Cava'
      },
      // Arrow 1
      {
        id: 'el-arrow-1',
        type: 'shape',
        shapeType: 'arrow',
        x: 180,
        y: 200,
        width: 1, // Arrow just uses coordinates of bounding box
        height: 50,
        rotation: 0,
        opacity: 1,
        layerOrder: 3,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#64748B',
        fillColor: 'transparent',
        roughness: 1.2
      },
      // Box 2: Right Atrium
      {
        id: 'el-shape-2',
        type: 'shape',
        shapeType: 'rect',
        x: 100,
        y: 260,
        width: 160,
        height: 60,
        rotation: 1,
        opacity: 1,
        layerOrder: 4,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#3B82F6',
        fillColor: '#DBEAFE',
        roughness: 1,
        label: 'Right Atrium'
      },
      // Arrow 2
      {
        id: 'el-arrow-2',
        type: 'shape',
        shapeType: 'arrow',
        x: 275,
        y: 160,
        width: 80,
        height: 1,
        rotation: 0,
        opacity: 1,
        layerOrder: 5,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#64748B',
        fillColor: 'transparent',
        roughness: 1.2
      },
      // Box 3: Pulmonary Artery
      {
        id: 'el-shape-3',
        type: 'shape',
        shapeType: 'rect',
        x: 370,
        y: 130,
        width: 180,
        height: 60,
        rotation: 0.5,
        opacity: 1,
        layerOrder: 6,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#EF4444', // Red
        fillColor: '#FEE2E2',
        roughness: 1.2,
        label: 'Pulmonary Artery'
      },
      // Arrow 3
      {
        id: 'el-arrow-3',
        type: 'shape',
        shapeType: 'arrow',
        x: 460,
        y: 200,
        width: 1,
        height: 50,
        rotation: 0,
        opacity: 1,
        layerOrder: 7,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#64748B',
        fillColor: 'transparent',
        roughness: 1.1
      },
      // Box 4: Lungs
      {
        id: 'el-shape-4',
        type: 'shape',
        shapeType: 'circle',
        x: 380,
        y: 260,
        width: 160,
        height: 80,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 8,
        locked: false,
        strokeWidth: 2.5,
        strokeColor: '#10B981', // Green
        fillColor: '#D1FAE5',
        roughness: 1.3,
        label: 'Lungs 🫁'
      },
      // Hand-written details
      {
        id: 'el-bio2-desc',
        type: 'text',
        x: 80,
        y: 400,
        width: 500,
        height: 120,
        rotation: -1,
        opacity: 1,
        layerOrder: 9,
        locked: false,
        content: 'Deoxygenated blood travels from the tissues back to the right side of the heart, gets oxygenated in the lungs, and then pumps out from the left ventricle through the Aorta.',
        fontSize: 17,
        color: '#475569',
        fontStyle: 'messy',
        penType: 'pencil',
        lineSpacing: 1.4,
        slant: 4,
        jitter: 0.6,
        bold: false,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      }
    ]
  });

  // Planner Page 1
  pages.push({
    id: 'page-plan-1',
    notebookId: 'nb-planner',
    title: 'Weekly Task List',
    pageNumber: 1,
    paperStyle: {
      type: 'legal-pad',
      color: '#FFF9C4', // Legal pad yellow
      lineColor: '#E8A7A1', // Legal pink margins
      lineSpacing: 30,
      gridDensity: 25,
      marginLine: true,
      paperTextureStrength: 0.25,
      pageShadow: true,
      pageTilt: true,
      paperGrain: true,
      spiralBinding: 'top', // Top binding legal pad
      paperClip: false,
      cornerFold: false,
      edgeVisible: true
    },
    tags: ['planner', 'tasks'],
    createdDate: Date.now(),
    updatedDate: Date.now(),
    elements: [
      {
        id: 'el-plan-h1',
        type: 'text',
        x: 100,
        y: 50,
        width: 500,
        height: 60,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 1,
        locked: false,
        content: 'WEEKLY WORKPLAN',
        fontSize: 30,
        color: '#2563EB',
        fontStyle: 'lecture-notes',
        penType: 'marker',
        lineSpacing: 1.2,
        slant: 0,
        jitter: 0.3,
        bold: true,
        underlineType: 'double',
        underlineColor: '#3B82F6',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      // Tasks Table
      {
        id: 'el-plan-table',
        type: 'table',
        x: 90,
        y: 130,
        width: 600,
        height: 250,
        rotation: 0,
        opacity: 1,
        layerOrder: 2,
        locked: false,
        rows: 4,
        cols: 3,
        headers: true,
        color: '#1E293B',
        headerColor: '#DBEAFE',
        borderColor: '#94A3B8',
        colWidths: [150, 300, 150],
        rowHeights: [45, 60, 60, 60],
        cells: [
          ['Mon', 'Write Biology chapter summary notes', 'HIGH'],
          ['Wed', 'Anatomy diagrams drawing session', 'MEDIUM'],
          ['Fri', 'Solve MCQ question sheet practice', 'LOW']
        ]
      },
      {
        id: 'el-plan-memo',
        type: 'text',
        x: 100,
        y: 430,
        width: 580,
        height: 100,
        rotation: 0.5,
        opacity: 1,
        layerOrder: 3,
        locked: false,
        content: 'Remember: Finish summaries before Friday revision session. Send PDF scan copy to study group on weekend!',
        fontSize: 18,
        color: '#0F172A',
        fontStyle: 'casual',
        penType: 'gel-pen',
        lineSpacing: 1.4,
        slant: -1,
        jitter: 0.4,
        bold: false,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'rgba(253, 224, 71, 0.4)', // Translucent yellow highlight!
        alignment: 'left'
      }
    ]
  });

  return pages;
}

/**
 * Packs all folders, notebooks, pages, and custom stickers into a single exportable JSON backup.
 */
export function exportBackup(
  folders: Folder[],
  notebooks: Notebook[],
  pages: Page[],
  stickers: CustomSticker[]
): void {
  const backup = {
    version: '1.0.0',
    timestamp: Date.now(),
    folders,
    notebooks,
    pages,
    stickers
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `handnote_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validates and imports a JSON backup file.
 */
export function importBackup(backupJson: string): {
  folders: Folder[];
  notebooks: Notebook[];
  pages: Page[];
  stickers: CustomSticker[];
} | null {
  try {
    const data = JSON.parse(backupJson);
    if (!data.folders || !data.notebooks || !data.pages) {
      alert('Invalid backup file. Required notebook data properties are missing.');
      return null;
    }
    return {
      folders: data.folders,
      notebooks: data.notebooks,
      pages: data.pages,
      stickers: data.stickers || []
    };
  } catch (err) {
    console.error('Backup import error:', err);
    alert('Failed to parse backup JSON file.');
    return null;
  }
}
