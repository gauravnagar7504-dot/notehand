import React, { useState } from 'react';
import type { Folder, Notebook, Page, ThemeMode } from '../types';
import {
  Folder as FolderIcon,
  BookOpen,
  Pin,
  Trash2,
  Plus,
  Search,
  Moon,
  ChevronDown,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Star,
  Users,
  Cloud,
  ChevronRight,
  Settings,
  Edit3
} from 'lucide-react';

interface SidebarProps {
  folders: Folder[];
  notebooks: Notebook[];
  pages: Page[];
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  activeNotebookId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  
  // State mutators
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateNotebook: (name: string, cover: any, folderId: string | null) => void;
  onDeleteNotebook: (id: string) => void;
  onDuplicateNotebook: (id: string) => void;
  onTogglePinNotebook: (id: string) => void;
  onRenameNotebook: (id: string, name: string) => void;
  
  onCreatePage: (notebookId: string, templateId?: string) => void;
  onDeletePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onReorderPage: (id: string, direction: 'up' | 'down') => void;
  onRenamePage: (id: string, title: string) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Collapsible state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (col: boolean) => void;

  onOpenSettings: () => void;
  onShowAlert: (title: string, message: string, variant?: 'info' | 'success' | 'warning') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  notebooks,
  pages,
  activeFolderId,
  setActiveFolderId,
  activeNotebookId,
  setActiveNotebookId,
  activePageId,
  setActivePageId,
  theme,
  setTheme,
  onCreateFolder,
  onDeleteFolder,
  onCreateNotebook,
  onDeleteNotebook,
  onTogglePinNotebook,
  onRenameNotebook,
  onRenamePage,
  onDeletePage,
  searchQuery,
  setSearchQuery,
  sidebarCollapsed,
  setSidebarCollapsed,
  onOpenSettings,
  onShowAlert
}) => {

  const [newFolderName, setNewFolderName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [quickAccessFilter, setQuickAccessFilter] = useState<'all' | 'recent' | 'favorites' | 'pinned' | 'shared'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allTags = Array.from(new Set(pages.flatMap(p => p.tags || [])));
  const [storageUsage, setStorageUsage] = useState({ size: '0 KB', percentage: 0 });

  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingNotebookName, setEditingNotebookName] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');

  const handleSaveNotebookName = (id: string) => {
    if (editingNotebookName.trim() !== '') {
      onRenameNotebook(id, editingNotebookName.trim());
    }
    setEditingNotebookId(null);
  };

  const handleSavePageTitle = (id: string) => {
    if (editingPageTitle.trim() !== '') {
      onRenamePage(id, editingPageTitle.trim());
    }
    setEditingPageId(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    let total = 0;
    for (const x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    const kb = total / 1024;
    if (kb < 1024) {
      setStorageUsage({ size: `${kb.toFixed(1)} KB`, percentage: Math.max(2, (kb / 5120) * 100) });
    } else {
      const mb = kb / 1024;
      setStorageUsage({ size: `${mb.toFixed(1)} MB`, percentage: Math.max(2, (mb / 5) * 100) });
    }
  }, [pages, notebooks, folders]);

  const getRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter notebooks based on folder, archive, and quick access filter states
  const filteredNotebooks = notebooks.filter(nb => {
    const matchesFolder = activeFolderId === null || nb.folderId === activeFolderId;
    const matchesArchive = showArchived ? nb.isArchived : !nb.isArchived;
    const matchesTag = selectedTag === null || pages.some(p => p.notebookId === nb.id && p.tags?.includes(selectedTag));
    
    if (quickAccessFilter === 'pinned' || quickAccessFilter === 'favorites') {
      return matchesFolder && matchesArchive && nb.pinned && matchesTag;
    }
    if (quickAccessFilter === 'shared') {
      return false; // Shared notebooks not available in local
    }
    return matchesFolder && matchesArchive && matchesTag;
  }).sort((a, b) => {
    if (quickAccessFilter === 'recent') {
      return b.updatedDate - a.updatedDate;
    }
    return 0;
  });

  // Global search hits
  const searchHits = searchQuery.trim() !== '' ? pages.filter(p => {
    const notebook = notebooks.find(n => n.id === p.notebookId);
    if (notebook?.isArchived) return false;
    
    const matchesTitle = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContent = p.elements.some(
      el => el.type === 'text' && el.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesTag = p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTitle || matchesContent || matchesTag;
  }) : [];

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };



  if (sidebarCollapsed) {
    return (
      <div className="app-sidebar collapsed">
        <button className="sidebar-toggle-btn collapsed-toggle" onClick={() => setSidebarCollapsed(false)} title="Expand Sidebar">
          <PanelLeftOpen size={16} />
        </button>
        <button
          className={`sidebar-home-btn-collapsed ${activeNotebookId === null ? 'active' : ''}`}
          onClick={() => { setActiveNotebookId(null); setActivePageId(null); }}
          title="Home Dashboard"
        >
          <Home size={18} />
        </button>
        <hr className="sidebar-divider" />
        <div className="sidebar-collapsed-folders">
          <button
            className={`collapsed-folder-icon-btn ${activeFolderId === null ? 'active' : ''}`}
            onClick={() => setActiveFolderId(null)}
            title="All Subjects"
          >
            <BookOpen size={15} />
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              className={`collapsed-folder-icon-btn ${activeFolderId === f.id ? 'active' : ''}`}
              onClick={() => setActiveFolderId(f.id)}
              title={f.name}
              style={{ borderLeft: `3px solid ${f.color || 'var(--border-light)'}` }}
            >
              <FolderIcon size={15} fill={f.color} color={f.color} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-sidebar">
      {/* Sidebar Top: Branding and Search */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 className="logo-title" onClick={() => { setActiveNotebookId(null); setActivePageId(null); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="HandNote Logo" style={{ height: '46px', width: 'auto', display: 'block', objectFit: 'contain' }} />
          </h1>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse Sidebar">
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="sidebar-notebook-dropdown-trigger">
          <BookOpen size={14} style={{ marginRight: '6px' }} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Study Notebook</span>
          <ChevronDown size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />
        </div>
        
        <div className="search-bar-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut-badge">⌘K</span>
        </div>
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchQuery.trim() !== '' && (
        <div className="sidebar-scrollable-content search-results-panel">
          <div className="section-title">Search Results ({searchHits.length})</div>
          {searchHits.length === 0 ? (
            <div className="empty-state">No matching notes found.</div>
          ) : (
            <div className="search-hits-list">
              {searchHits.map(hit => {
                const nb = notebooks.find(n => n.id === hit.notebookId);
                return (
                  <div
                    key={hit.id}
                    className={`search-hit-item ${hit.id === activePageId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveNotebookId(hit.notebookId);
                      setActivePageId(hit.id);
                      setSearchQuery(''); // clear search to focus on note
                    }}
                  >
                    <div className="hit-page-title">{hit.title || 'Untitled Page'}</div>
                    <div className="hit-notebook-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FolderIcon size={12} /> <span>{nb?.name} • Page {hit.pageNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STANDARD NAVIGATION PANELS */}
      {searchQuery.trim() === '' && (
        <div className="sidebar-scrollable-content">
          
          {/* QUICK ACCESS PANEL */}
          <div className="sidebar-section-container">
            <div className="section-title">QUICK ACCESS</div>
            <div className="quick-access-list">
              <div 
                className={`quick-access-item ${quickAccessFilter === 'recent' ? 'active' : ''}`} 
                onClick={() => { setQuickAccessFilter('recent'); setActiveFolderId(null); setActiveNotebookId(null); }}
              >
                <Clock size={14} className="quick-access-icon" />
                <span className="quick-access-label">Recent</span>
              </div>
              <div 
                className={`quick-access-item ${quickAccessFilter === 'favorites' ? 'active' : ''}`} 
                onClick={() => { setQuickAccessFilter('favorites'); setActiveFolderId(null); }}
              >
                <Star size={14} className="quick-access-icon" />
                <span className="quick-access-label">Favorites</span>
              </div>
              <div 
                className={`quick-access-item ${quickAccessFilter === 'pinned' ? 'active' : ''}`} 
                onClick={() => { setQuickAccessFilter('pinned'); setActiveFolderId(null); }}
              >
                <Pin size={14} className="quick-access-icon" />
                <span className="quick-access-label">Pinned</span>
              </div>
              <div 
                className={`quick-access-item ${quickAccessFilter === 'shared' ? 'active' : ''}`}
                onClick={() => { onShowAlert("Premium Feature", "Shared notebooks is a premium cloud feature. Switch to study sync account to access.", "warning"); }}
              >
                <Users size={14} className="quick-access-icon" />
                <span className="quick-access-label">Shared</span>
              </div>
              <div 
                className={`quick-access-item ${showArchived ? 'active' : ''}`} 
                onClick={() => { setShowArchived(!showArchived); setQuickAccessFilter('all'); }}
              >
                <Trash2 size={14} className="quick-access-icon" />
                <span className="quick-access-label">Trash</span>
              </div>
            </div>
          </div>

          <hr className="sidebar-divider" />

          {/* HIERARCHICAL NOTEBOOKS SECTION */}
          <div className="sidebar-section-container">
            <div className="section-title-row">
              <span className="section-title">{showArchived ? 'ARCHIVED NOTEBOOKS' : 'NOTEBOOKS'}</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  className="add-section-btn"
                  onClick={() => onCreateNotebook('Class Notes', 'leather-brown', activeFolderId)}
                  title="Create Notebook"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="notebooks-list">
              {filteredNotebooks.length === 0 ? (
                <div className="empty-state">No notebooks.</div>
              ) : (
                filteredNotebooks.map(nb => {
                  const isExpanded = nb.id === activeNotebookId;
                  const nbPages = pages.filter(p => p.notebookId === nb.id).sort((a,b) => a.pageNumber - b.pageNumber);
                  
                  return (
                    <div key={nb.id} className="notebook-group-container">
                      {/* Notebook header list row */}
                      <div
                        className={`notebook-list-item-new ${isExpanded ? 'active' : ''}`}
                        onClick={() => {
                          setActiveNotebookId(nb.id);
                          if (nbPages.length > 0) setActivePageId(nbPages[0].id);
                          else setActivePageId(null);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} className="notebook-chevron" />
                        ) : (
                          <ChevronRight size={14} className="notebook-chevron" />
                        )}
                        
                        {/* Realistic mini cover preview */}
                        <div className={`mini-cover-thumbnail cover-${nb.coverStyle}`} style={{ backgroundColor: nb.colorLabel }} />
                        
                        <div className="notebook-meta-info">
                          {editingNotebookId === nb.id ? (
                            <input
                              type="text"
                              className="notebook-rename-input"
                              value={editingNotebookName}
                              onChange={e => setEditingNotebookName(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.stopPropagation();
                                  handleSaveNotebookName(nb.id);
                                } else if (e.key === 'Escape') {
                                  e.stopPropagation();
                                  setEditingNotebookId(null);
                                }
                              }}
                              onBlur={() => handleSaveNotebookName(nb.id)}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="notebook-title-label-new">{nb.name}</span>
                              <span className="notebook-subtitle-label-new">
                                {nbPages.length} {nbPages.length === 1 ? 'page' : 'pages'} • {getRelativeTime(nb.updatedDate)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quick actions hover */}
                        <div className="notebook-quick-actions-new">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotebookId(nb.id);
                              setEditingNotebookName(nb.name);
                            }}
                            className="nb-action-btn-new"
                            title="Rename"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onTogglePinNotebook(nb.id); }}
                            className="nb-action-btn-new"
                            title="Pin"
                          >
                            <Pin size={11} fill={nb.pinned ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteNotebook(nb.id); if (activeNotebookId === nb.id) { setActiveNotebookId(null); setActivePageId(null); } }}
                            className="nb-action-btn-new text-red"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Indented outline page list */}
                      {isExpanded && nbPages.length > 0 && (
                        <div className="notebook-nested-outline-pages">
                          {nbPages.map((p) => {
                            const isPageActive = p.id === activePageId;
                            const isEditingPage = editingPageId === p.id;
                            return (
                              <div
                                key={p.id}
                                className={`nested-outline-page-item ${isPageActive ? 'active' : ''}`}
                                onClick={() => setActivePageId(p.id)}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPageId(p.id);
                                  setEditingPageTitle(p.title);
                                }}
                              >
                                <span className="nested-page-idx">{p.pageNumber}.</span>
                                {isEditingPage ? (
                                  <input
                                    type="text"
                                    className="page-rename-input"
                                    value={editingPageTitle}
                                    onChange={e => setEditingPageTitle(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.stopPropagation();
                                        handleSavePageTitle(p.id);
                                      } else if (e.key === 'Escape') {
                                        e.stopPropagation();
                                        setEditingPageId(null);
                                      }
                                    }}
                                    onBlur={() => handleSavePageTitle(p.id)}
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <span className="nested-page-title-text">{p.title || 'Untitled Page'}</span>
                                    <button
                                      className="page-rename-btn hover-only"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPageId(p.id);
                                        setEditingPageTitle(p.title);
                                      }}
                                      title="Rename Page"
                                    >
                                      <Edit3 size={10} />
                                    </button>
                                    <button
                                      className="page-rename-btn hover-only text-red"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeletePage(p.id);
                                      }}
                                      title="Delete Page"
                                      style={{ color: '#EF4444' }}
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* FOLDERS / SUBJECTS LIST ACCORDION */}
          <hr className="sidebar-divider" />
          <div className="sidebar-section-container">
            <div className="section-title-row">
              <span className="section-title">SUBJECT FOLDERS</span>
            </div>
            
            {/* Create Folder inline form */}
            <form onSubmit={handleCreateFolder} className="create-folder-form">
              <input
                type="text"
                placeholder="New subject folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                maxLength={20}
              />
              <button type="submit"><Plus size={16} /></button>
            </form>

            <div className="folders-list">
              <div
                className={`folder-item ${activeFolderId === null ? 'active' : ''}`}
                onClick={() => setActiveFolderId(null)}
              >
                <FolderIcon size={16} color="#64748B" />
                <span className="folder-name">All Notebooks</span>
              </div>
              {folders.map(f => (
                <div
                  key={f.id}
                  className={`folder-item ${activeFolderId === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFolderId(f.id)}
                  style={{ borderLeft: `3px solid ${f.color}` }}
                >
                  <FolderIcon size={16} fill={f.color} color={f.color} />
                  <span className="folder-name">{f.name}</span>
                  <button
                    className="delete-item-btn hover-only"
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(f.id); if (activeFolderId === f.id) setActiveFolderId(null); }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TAGS FILTER SECTION */}
          {allTags.length > 0 && (
            <>
              <hr className="sidebar-divider" />
              <div className="sidebar-section-container">
                <div className="section-title-row">
                  <span className="section-title">TAGS</span>
                </div>
                <div className="sidebar-tag-pills">
                  <button
                    className={`sidebar-tag-pill ${selectedTag === null ? 'active' : ''}`}
                    onClick={() => setSelectedTag(null)}
                  >
                    All Tags
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`sidebar-tag-pill ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* FOOTER SIDEBAR CONTROLS */}
      <div className="sidebar-footer-new">
        <div className="footer-action-row-new">
          <div 
            className="footer-action-item-new" 
            title="Settings"
            onClick={onOpenSettings}
          >
            <Settings size={15} />
            <span>Settings</span>
          </div>
          <div 
            className="footer-action-item-new" 
            title="Toggle theme" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
          >
            <Moon size={15} />
          </div>
        </div>

        <div 
          className="footer-sync-row-new"
          style={{ cursor: 'pointer' }}
          onClick={() => onShowAlert("Cloud Sync Status", "All notebook edits are saved to your browser's local database.\n0 files are currently pending upload.", "success")}
        >
          <Cloud size={15} className="cloud-sync-icon" />
          <span className="cloud-sync-label">Cloud Sync</span>
          <span className="cloud-sync-dot" />
        </div>

        <div className="footer-storage-row-new">
          <div className="storage-labels">
            <span>Storage</span>
            <span>{storageUsage.size} / 5.0 MB</span>
          </div>
          <div className="storage-progress-bar-container">
            <div className="storage-progress-bar-fill" style={{ width: `${storageUsage.percentage}%` }} />
          </div>
        </div>

        {/* User profile row */}
        <div 
          className="sidebar-profile-row-new"
          onClick={() => onShowAlert("Student Profile", `Name: Alex Student\nRole: Premium Offline Edition\nSubject Folders: ${folders.length}\nTotal Notebooks: ${notebooks.length}`, "info")}
        >
          <div className="profile-avatar-circle-new">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="profile-metadata-new">
            <span className="profile-username-new">Alex Student</span>
            <span className="profile-useremail-new">alex@handnote.app</span>
          </div>
          <ChevronRight size={12} className="profile-chevron-new" />
        </div>
      </div>

    </div>
  );
};
