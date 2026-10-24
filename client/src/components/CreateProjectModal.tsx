import React, { useState } from 'react';
import { X, FolderPlus, Plus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; key: string; description?: string }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate key from first letters if user hasn't typed a custom key
    if (!key || key.length <= 4) {
      const generated = val
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (generated) setKey(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;
    onSubmit({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
    });
    setName('');
    setKey('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderPlus size={18} color="var(--brand-accent)" />
            <h2 className="modal-title">Create New Project</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. NextGen Web App"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Key * (Unique prefix for tickets)</label>
              <input
                type="text"
                required
                maxLength={10}
                className="form-input"
                placeholder="e.g. NGW"
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tickets will be numbered {key || 'KEY'}-101, {key || 'KEY'}-102, etc.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Describe project objectives and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
