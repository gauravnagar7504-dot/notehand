import React, { useEffect } from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: 'info' | 'success' | 'warning';
  onClose: () => void;
}

const variantConfig = {
  info: { icon: Info, color: 'var(--accent-ui)' },
  success: { icon: CheckCircle, color: '#10B981' },
  warning: { icon: AlertTriangle, color: '#F59E0B' },
};

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  variant = 'info',
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { icon: Icon } = variantConfig[variant];

  const renderMessage = (text: string) =>
    text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="alert-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideIn 0.2s ease-out' }}
      >
        <div className="modal-header" style={{ width: '100%' }}>
          <h2>{title}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={`modal-icon ${variant}`}>
            <Icon size={36} />
          </div>
          <p className="modal-message">{renderMessage(message)}</p>
        </div>

        <div className="modal-actions">
          <button
            className={`modal-btn confirm-${variant}`}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
