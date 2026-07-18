import React from 'react';
import { PAGE_TEMPLATES } from '../data/templates';
import { Layout, FileText, Activity, Layers } from 'lucide-react';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="template-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600 }}>
            <Layout size={18} style={{ color: 'var(--accent-ui)' }} />
            Choose Page Template
          </h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="templates-info-sub">
          Select a template layout to start your notes. Each template adds hand-drawn structures, lists, boxes, or tables to speed up study notes creation.
        </div>

        <div className="templates-list-grid">
          {PAGE_TEMPLATES.map(tpl => (
            <div
              key={tpl.id}
              className="template-card"
              onClick={() => {
                onSelectTemplate(tpl.id);
                onClose();
              }}
            >
              <div className="template-card-icon">
                {tpl.id === 't-blank' && <FileText size={24} color="#64748B" />}
                {tpl.id === 't-ruled' && <FileText size={24} color="#3B82F6" />}
                {tpl.id === 't-cornell' && <Layers size={24} color="#8B5CF6" />}
                {tpl.id === 't-mindmap' && <Activity size={24} color="#10B981" />}
                {tpl.id === 't-formula' && <Layout size={24} color="#F43F5E" />}
              </div>
              <div className="template-card-body">
                <h3>{tpl.name}</h3>
                <p>{tpl.description}</p>
                <div className="template-paper-type">
                  Paper Grid Style: <span>{tpl.paperStyleType.toUpperCase()}</span>
                </div>
              </div>
              <button
                className="select-template-action-btn"
                onClick={() => {
                  onSelectTemplate(tpl.id);
                  onClose();
                }}
              >
                Use Layout
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
