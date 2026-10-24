import React, { useState } from 'react';
import { User, Sprint } from '../types';
import { X, Plus, Sparkles, Tag } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  users: User[];
  sprints: Sprint[];
  currentUserId?: string;
  projectKey?: string;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  sprints,
  currentUserId,
  projectKey = 'KUP',
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task',
    priority: 'Medium',
    status: 'To Do',
    assignedTo: currentUserId || '',
    sprintId: '',
    deadline: '',
    labelsString: '',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const labels = formData.labelsString
      ? formData.labelsString
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      priority: formData.priority,
      status: formData.status,
      assignedTo: formData.assignedTo || null,
      sprintId: formData.sprintId || null,
      deadline: formData.deadline || null,
      labels,
    });

    onClose();
    setFormData({
      title: '',
      description: '',
      type: 'Task',
      priority: 'Medium',
      status: 'To Do',
      assignedTo: currentUserId || '',
      sprintId: '',
      deadline: '',
      labelsString: '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--brand-accent)" />
            <h2 className="modal-title">Create Issue ({projectKey})</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Summary / Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-input"
                placeholder="e.g. Implement input validation on login endpoint"
                value={formData.title}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Type</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent / Critical</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select
                  name="assignedTo"
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sprint</label>
                <select
                  name="sprintId"
                  className="form-select"
                  value={formData.sprintId}
                  onChange={handleChange}
                >
                  <option value="">Product Backlog (No Sprint)</option>
                  {sprints.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Deadline (Due Date)</label>
                <input
                  type="date"
                  name="deadline"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Labels Input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={13} />
                <span>Labels / Tags (comma separated)</span>
              </label>
              <input
                type="text"
                name="labelsString"
                className="form-input"
                placeholder="e.g. frontend, auth, high-priority, bug"
                value={formData.labelsString}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={4}
                className="form-textarea"
                placeholder="Provide detailed description, reproduction steps, or acceptance criteria..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
