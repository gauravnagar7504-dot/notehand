import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  info: { icon: AlertCircle, color: 'var(--accent-ui)' },
  warning: { icon: AlertTriangle, color: '#F59E0B' },
  danger: { icon: Trash2, color: '#EF4444' },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const { icon: Icon } = variantConfig[variant];

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideIn 0.2s ease-out' }}
      >
        <div className="modal-header" style={{ width: '100%' }}>
          <h2>{title}</h2>
          <button className="close-modal-btn" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={`modal-icon ${variant}`}>
            <Icon size={36} />
          </div>
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`modal-btn confirm-${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
