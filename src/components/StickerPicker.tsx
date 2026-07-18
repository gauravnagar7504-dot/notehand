import React, { useState, useRef } from 'react';
import { STICKER_PRESETS } from '../data/stickers';
import type { CustomSticker } from '../types';
import { Upload, Trash2, FolderHeart } from 'lucide-react';
import { generateId } from '../utils/storage';

interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (stickerId: string, isCustom: boolean, customDataUrl?: string) => void;
  customStickers: CustomSticker[];
  onAddCustomSticker: (sticker: CustomSticker) => void;
  onDeleteCustomSticker: (id: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
  customStickers,
  onAddCustomSticker,
  onDeleteCustomSticker
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [activeCategory, setActiveCategory] = useState<'all' | 'study' | 'shapes' | 'doodles' | 'cute' | 'decorations'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter built-in presets
  const filteredPresets = STICKER_PRESETS.filter(
    p => activeCategory === 'all' || p.category === activeCategory
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newSticker: CustomSticker = {
            id: 'cst-' + generateId(),
            name: file.name.split('.')[0] || 'Custom Sticker',
            collection: 'My Uploads',
            dataUrl: event.target.result as string,
            tags: []
          };
          onAddCustomSticker(newSticker);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sticker-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌸 Sticker Library</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {/* Tab selection */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            <FolderHeart size={15} /> Built-in Presets
          </button>
          <button
            className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <Upload size={15} /> Custom Uploads
          </button>
        </div>

        {/* PRESET STICKERS VIEW */}
        {activeTab === 'presets' && (
          <>
            {/* Category tabs */}
            <div className="category-filters-row">
              {(['all', 'study', 'shapes', 'doodles', 'cute', 'decorations'] as const).map(cat => (
                <button
                  key={cat}
                  className={`category-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="sticker-grid-panel">
              {filteredPresets.map(preset => (
                <div
                  key={preset.id}
                  className="sticker-grid-cell"
                  onClick={() => {
                    onSelectSticker(preset.id, false);
                    onClose();
                  }}
                  title={preset.name}
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={preset.viewBox}
                    dangerouslySetInnerHTML={{ __html: preset.path }}
                  />
                  <span className="sticker-cell-label">{preset.name}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CUSTOM UPLOADS VIEW */}
        {activeTab === 'custom' && (
          <div className="custom-stickers-pane">
            
            {/* Drag and Drop Container */}
            <div
              className="dropzone-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className="upload-icon-dnd" />
              <p>Drag & Drop PNG/SVG or click to upload</p>
              <span className="upload-sub">Supports transparent background images</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/svg+xml, image/webp"
                style={{ display: 'none' }}
              />
            </div>

            <div className="section-title" style={{ marginTop: '16px' }}>Uploaded Stickers ({customStickers.length})</div>
            
            {customStickers.length === 0 ? (
              <div className="empty-state" style={{ height: '120px' }}>No uploaded stickers yet. Drag and drop PNG files above!</div>
            ) : (
              <div className="sticker-grid-panel">
                {customStickers.map(sticker => (
                  <div
                    key={sticker.id}
                    className="sticker-grid-cell custom-cell"
                    onClick={() => {
                      onSelectSticker(sticker.id, true, sticker.dataUrl);
                      onClose();
                    }}
                    title={sticker.name}
                  >
                    <img src={sticker.dataUrl} alt={sticker.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    <button
                      className="delete-custom-sticker-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomSticker(sticker.id);
                      }}
                      title="Delete Uploaded Sticker"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
