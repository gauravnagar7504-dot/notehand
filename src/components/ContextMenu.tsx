import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Copy,
  Clipboard,
  CopyPlus,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  Trash2,
} from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  isLocked: boolean;
  hasSelection: boolean;
  hasClipboard: boolean;
}

interface MenuItemConfig {
  type: 'item' | 'separator';
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 36;
const SEPARATOR_HEIGHT = 9;
const MENU_PADDING = 6;
const VIEWPORT_MARGIN = 8;

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onToggleLock,
  onBringToFront,
  onSendToBack,
  isLocked,
  hasSelection,
  hasClipboard,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  const menuItems: MenuItemConfig[] = [
    {
      type: 'item',
      label: 'Copy',
      icon: <Copy size={16} />,
      shortcut: 'Ctrl+C',
      onClick: onCopy,
      disabled: !hasSelection,
    },
    {
      type: 'item',
      label: 'Paste',
      icon: <Clipboard size={16} />,
      shortcut: 'Ctrl+V',
      onClick: onPaste,
      disabled: !hasClipboard,
    },
    {
      type: 'item',
      label: 'Duplicate',
      icon: <CopyPlus size={16} />,
      shortcut: 'Ctrl+D',
      onClick: onDuplicate,
      disabled: !hasSelection,
    },
    { type: 'separator' },
    {
      type: 'item',
      label: isLocked ? 'Unlock' : 'Lock',
      icon: isLocked ? <Unlock size={16} /> : <Lock size={16} />,
      onClick: onToggleLock,
      disabled: !hasSelection,
    },
    {
      type: 'item',
      label: 'Bring to Front',
      icon: <ChevronsUp size={16} />,
      shortcut: 'Ctrl+]',
      onClick: onBringToFront,
      disabled: !hasSelection,
    },
    {
      type: 'item',
      label: 'Send to Back',
      icon: <ChevronsDown size={16} />,
      shortcut: 'Ctrl+[',
      onClick: onSendToBack,
      disabled: !hasSelection,
    },
    { type: 'separator' },
    {
      type: 'item',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      shortcut: 'Del',
      onClick: onDelete,
      disabled: !hasSelection,
      danger: true,
    },
  ];

  // Calculate estimated menu height for viewport clamping
  const estimatedMenuHeight =
    MENU_PADDING * 2 +
    menuItems.reduce(
      (sum, item) => sum + (item.type === 'separator' ? SEPARATOR_HEIGHT : MENU_ITEM_HEIGHT),
      0
    );

  // Reposition when coordinates change to prevent viewport overflow
  useEffect(() => {
    if (!isOpen) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + MENU_WIDTH + VIEWPORT_MARGIN > vw) {
      adjustedX = x - MENU_WIDTH;
    }
    if (y + estimatedMenuHeight + VIEWPORT_MARGIN > vh) {
      adjustedY = y - estimatedMenuHeight;
    }

    // Ensure we never go off-screen on the top/left either
    adjustedX = Math.max(VIEWPORT_MARGIN, adjustedX);
    adjustedY = Math.max(VIEWPORT_MARGIN, adjustedY);

    setPosition({ x: adjustedX, y: adjustedY });
  }, [isOpen, x, y, estimatedMenuHeight]);

  // Dismiss on Escape key, click outside, and scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  const handleItemClick = useCallback(
    (item: MenuItemConfig) => {
      if (item.disabled || !item.onClick) return;
      item.onClick();
      onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 30000,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={`sep-${index}`} className="context-menu-separator" />;
        }

        return (
          <button
            key={item.label}
            className={`context-menu-item${item.disabled ? ' disabled' : ''}${item.danger ? ' danger' : ''}`}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            <span className="context-menu-item-icon">{item.icon}</span>
            <span className="context-menu-item-label">{item.label}</span>
            {item.shortcut && (
              <span className="ctx-shortcut">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
