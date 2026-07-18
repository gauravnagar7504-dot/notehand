import React, { useState } from 'react';
import type { ThemeMode } from '../types';
import { Palette, HardDrive, Info, Check, Download, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  storageUsage: { size: string; percentage: number };
  notebookCount: number;
  pageCount: number;
  folderCount: number;
  onExportBackup: () => void;
  onResetWorkspace: () => void;
}

type SettingsTab = 'appearance' | 'storage' | 'about';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  swatches: { workspace: string; sidebar: string; accent: string };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    swatches: { workspace: '#F1F5F9', sidebar: '#FFFFFF', accent: '#3B82F6' },
  },
  {
    id: 'dark',
    label: 'Dark',
    swatches: { workspace: '#0F172A', sidebar: '#1E293B', accent: '#60A5FA' },
  },
  {
    id: 'sepia',
    label: 'Sepia',
    swatches: { workspace: '#ECE3D4', sidebar: '#FAF6EE', accent: '#8B6914' },
  },
  {
    id: 'night',
    label: 'Night',
    swatches: { workspace: '#040D21', sidebar: '#0B1528', accent: '#3B82F6' },
  },
  {
    id: 'classic',
    label: 'Classic',
    swatches: { workspace: '#E2E8F0', sidebar: '#FFFFFF', accent: '#2563EB' },
  },
];

const FONT_PACKS = [
  'Delius',
  'Handlee',
  'Kalam',
  'Caveat',
  'Gochi Hand',
  'Patrick Hand',
  'Architects Daughter',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  storageUsage,
  notebookCount,
  pageCount,
  folderCount,
  onExportBackup,
  onResetWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {/* Tab selection */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={15} /> Appearance
          </button>
          <button
            className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            <HardDrive size={15} /> Storage
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={15} /> About
          </button>
        </div>

        <div className="settings-content">
          {/* ─── Appearance Tab ─── */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-title">Theme</div>
              <div className="theme-picker-grid">
                {THEME_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className={`theme-swatch-card ${theme === opt.id ? 'active' : ''}`}
                    onClick={() => setTheme(opt.id)}
                  >
                    {/* Mini preview swatch */}
                    <div className="theme-swatch-preview" style={{ backgroundColor: opt.swatches.workspace }}>
                      <div
                        className="swatch-sidebar"
                        style={{ backgroundColor: opt.swatches.sidebar }}
                      />
                      <div
                        className="swatch-accent-dot"
                        style={{ backgroundColor: opt.swatches.accent }}
                      />
                      {theme === opt.id && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', color: opt.swatches.accent }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="theme-swatch-label">{opt.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Storage Tab ─── */}
          {activeTab === 'storage' && (
            <div className="settings-section">
              <div className="settings-section-title">Storage Usage</div>

              {/* Progress bar */}
              <div className="settings-storage-bar">
                <div className="settings-storage-labels">
                  <span>Usage</span>
                  <span>
                    {storageUsage.size} / 5.0 MB ({storageUsage.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="settings-storage-track">
                  <div
                    className="settings-storage-fill"
                    style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stat cards */}
              <div className="settings-stat-row">
                <div className="settings-stat-card">
                  <div className="stat-value">{notebookCount}</div>
                  <div className="stat-label">Notebooks</div>
                </div>
                <div className="settings-stat-card">
                  <div className="stat-value">{pageCount}</div>
                  <div className="stat-label">Pages</div>
                </div>
                <div className="settings-stat-card">
                  <div className="stat-value">{folderCount}</div>
                  <div className="stat-label">Folders</div>
                </div>
              </div>

              {/* Actions */}
              <div className="settings-btn-row">
                <button className="settings-btn" onClick={onExportBackup}>
                  <Download size={14} /> Export Backup
                </button>
                <button className="settings-btn danger" onClick={onResetWorkspace}>
                  <Trash2 size={14} /> Reset Workspace
                </button>
              </div>
            </div>
          )}

          {/* ─── About Tab ─── */}
          {activeTab === 'about' && (
            <div className="settings-section">
              <div className="settings-about-block">
                <h3>
                  HandNote
                  <span className="version-badge">v1.0.0</span>
                </h3>
                <p>
                  A handwritten notebook simulator for students and creatives.
                </p>

                <div className="settings-section-title" style={{ marginTop: '20px', marginBottom: '8px' }}>
                  Font Packs Loaded
                </div>
                <div className="font-list">
                  {FONT_PACKS.map((font) => (
                    <span key={font} className="font-pill">
                      {font}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  ⌨️ Press <kbd style={{ padding: '2px 5px', background: 'var(--bg-hover)', border: '1px solid var(--border-ui)', borderRadius: '4px' }}>?</kbd> to view all keyboard shortcuts
                </div>

                <div className="made-with">Made with ❤️ for pen-and-paper lovers</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

