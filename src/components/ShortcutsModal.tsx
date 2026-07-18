import React from 'react';
import { Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Tools',
    icon: '🛠️',
    shortcuts: [
      { keys: ['V'], description: 'Select' },
      { keys: ['T'], description: 'Text' },
      { keys: ['P'], description: 'Pen' },
      { keys: ['H'], description: 'Highlighter' },
      { keys: ['E'], description: 'Eraser' },
    ],
  },
  {
    title: 'Edit',
    icon: '✏️',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Delete'], description: 'Delete Element' },
    ],
  },
  {
    title: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Search' },
      { keys: ['Esc'], description: 'Deselect / Cancel' },
    ],
  },
  {
    title: 'Elements',
    icon: '📐',
    shortcuts: [
      { keys: ['↑', '↓', '←', '→'], description: 'Nudge (1px)' },
      { keys: ['Shift', 'Arrows'], description: 'Nudge (10px)' },
    ],
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Keyboard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Keyboard Shortcuts</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="shortcuts-grid">
          {SHORTCUT_CATEGORIES.map((category) => (
            <div key={category.title} className="shortcut-category">
              <h4>
                <span style={{ marginRight: '6px' }}>{category.icon}</span>
                {category.title}
              </h4>
              <div className="shortcut-list">
                {category.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-row">
                    <span className="shortcut-label">{shortcut.description}</span>
                    <span className="shortcut-combo">
                      {shortcut.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && <span style={{ margin: '0 2px', color: 'var(--text-muted)' }}>+</span>}
                          <kbd>{key}</kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

