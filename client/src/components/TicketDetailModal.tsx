import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Sprint, TicketStatus } from '../types';
import {
  X,
  Send,
  MessageSquare,
  History,
  FileText,
  Trash2,
  Check,
  Edit2,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const STATUS_LIST: TicketStatus[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Closed',
];

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (ticket: Ticket, newStatus: string) => void;
  onUpdateDetails: (id: string, details: any) => void;
  onAddComment: (id: string, text: string) => void;
  onDeleteTicket: (id: string) => void;
  users: User[];
  sprints: Sprint[];
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateDetails,
  onAddComment,
  onDeleteTicket,
  users,
  sprints,
}) => {
  const { user, hasRole, canUpdateTicketStatus, canEditTicketDetails } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    sprintId: '',
    deadline: '',
    labels: [] as string[],
  });

  useEffect(() => {
    if (ticket) {
      setEditForm({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'Medium',
        assignedTo:
          typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo || '',
        sprintId:
          typeof ticket.sprint === 'object' ? ticket.sprint?._id : ticket.sprint || '',
        deadline: ticket.deadline ? ticket.deadline.split('T')[0] : '',
        labels: ticket.labels || [],
      });
      setIsEditing(false);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const canEditStatus = canUpdateTicketStatus(ticket);
  const canEditFields = canEditTicketDetails(ticket);
  const canDelete = hasRole('Project Admin', 'Team Lead');

  const assigneeId =
    typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo;
  const isAssignee = assigneeId?.toString() === user?._id?.toString();

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(ticket._id, commentText.trim());
    setCommentText('');
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDetails(ticket._id, editForm);
    setIsEditing(false);
  };

  const handleAddLabel = () => {
    if (!newLabelInput.trim()) return;
    const clean = newLabelInput.trim().toLowerCase();
    if (!editForm.labels.includes(clean)) {
      const updated = [...editForm.labels, clean];
      setEditForm({ ...editForm, labels: updated });
      onUpdateDetails(ticket._id, { labels: updated });
    }
    setNewLabelInput('');
  };

  const handleRemoveLabel = (lblToRemove: string) => {
    const updated = editForm.labels.filter((l) => l !== lblToRemove);
    setEditForm({ ...editForm, labels: updated });
    onUpdateDetails(ticket._id, { labels: updated });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatusDisplay = ticket.status === 'Solved' ? 'Done' : ticket.status;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '820px', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="ticket-id-tag" style={{ fontSize: '0.9rem' }}>
              {ticket.ticketId}
            </span>
            <span className="ticket-type-badge">{ticket.type}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Created {formatDate(ticket.createdAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {canDelete && (
              <button
                className="icon-btn"
                title="Delete Ticket (Admin/Lead)"
                onClick={() => {
                  if (window.confirm(`Delete ticket ${ticket.ticketId}?`)) {
                    onDeleteTicket(ticket._id);
                    onClose();
                  }
                }}
                style={{ color: 'var(--priority-urgent)' }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Permission Info Callout */}
        <div
          style={{
            padding: '0.6rem 1.5rem',
            background: canEditStatus
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: canEditStatus ? '#34D399' : '#F87171',
          }}
        >
          {canEditStatus ? (
            <>
              <CheckCircle2 size={15} />
              <span>
                {isAssignee
                  ? `You are assigned to this ticket — you can transition its status according to workflow rules.`
                  : `You have permission to transition this ticket status (${user?.role}).`}
              </span>
            </>
          ) : (
            <>
              <ShieldAlert size={15} />
              <span>
                Status update restricted: Only the assigned developer (
                {ticket.assignedTo?.name || 'Assigned User'}), Team Lead, or Admin can update this
                ticket.
              </span>
            </>
          )}
        </div>

        {/* Modal Body with Tabs */}
        <div className="modal-body">
          {/* Navigation Tabs */}
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Details & Workflow
            </button>
            <button
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Comments ({ticket.comments?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <History size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Activity Audit ({ticket.activity?.length || 0})
            </button>
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Title Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="form-label">Title</span>
                  {canEditFields && !isEditing && (
                    <button
                      className="role-switch-btn"
                      onClick={() => setIsEditing(true)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Edit2 size={12} /> Edit Details
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    style={{ marginTop: '0.35rem', fontWeight: 600 }}
                  />
                ) : (
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      marginTop: '0.25rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {ticket.title}
                  </h2>
                )}
              </div>

              {/* Status Workflow Selector Bar */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} color="var(--brand-accent)" />
                  <span>Workflow State Machine Transitions</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {STATUS_LIST.map((status) => {
                    const isCurrent = currentStatusDisplay === status;
                    return (
                      <button
                        key={status}
                        className={`role-switch-btn ${isCurrent ? 'active' : ''}`}
                        disabled={!canEditStatus}
                        onClick={() => onUpdateStatus(ticket, status)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          cursor: canEditStatus ? 'pointer' : 'not-allowed',
                          opacity: !canEditStatus && !isCurrent ? 0.4 : 1,
                        }}
                      >
                        {isCurrent && <Check size={14} />}
                        <span>{status}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attributes Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div className="form-label">Priority</div>
                  {isEditing ? (
                    <select
                      className="form-select"
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, priority: e.target.value as any }))
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  ) : (
                    <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                      {ticket.priority}
                    </div>
                  )}
                </div>

                <div>
                  <div className="form-label">Assigned To</div>
                  {isEditing && hasRole('Project Admin', 'Team Lead') ? (
                    <select
                      className="form-select"
                      value={editForm.assignedTo}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, assignedTo: e.target.value }))
                      }
                    >
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>
                        {ticket.assignedTo?.name || 'Unassigned'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({ticket.assignedTo?.role})
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="form-label">Sprint</div>
                  {isEditing && hasRole('Project Admin', 'Team Lead') ? (
                    <select
                      className="form-select"
                      value={editForm.sprintId}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, sprintId: e.target.value }))
                      }
                    >
                      <option value="">Backlog (No Sprint)</option>
                      {sprints.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
                      {ticket.sprint?.name || 'Backlog'}
                    </div>
                  )}
                </div>

                <div>
                  <div className="form-label">Deadline</div>
                  {isEditing ? (
                    <input
                      type="date"
                      className="form-input"
                      value={editForm.deadline}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, deadline: e.target.value }))
                      }
                    />
                  ) : (
                    <div style={{ marginTop: '0.25rem', fontWeight: 500 }}>
                      {ticket.deadline
                        ? new Date(ticket.deadline).toLocaleDateString()
                        : 'No deadline set'}
                    </div>
                  )}
                </div>
              </div>

              {/* Labels Section */}
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={13} />
                  <span>Issue Labels</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  {editForm.labels.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No labels</span>
                  ) : (
                    editForm.labels.map((lbl) => (
                      <span
                        key={lbl}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--brand-accent)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        #{lbl}
                        {canEditFields && (
                          <X
                            size={12}
                            style={{ cursor: 'pointer', opacity: 0.7 }}
                            onClick={() => handleRemoveLabel(lbl)}
                          />
                        )}
                      </span>
                    ))
                  )}

                  {canEditFields && (
                    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Add label..."
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          width: '100px',
                          outline: 'none',
                        }}
                        value={newLabelInput}
                        onChange={(e) => setNewLabelInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLabel();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="role-switch-btn"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={handleAddLabel}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="form-label">Description</div>
                {isEditing ? (
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    style={{ marginTop: '0.35rem' }}
                  />
                ) : (
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginTop: '0.35rem',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.9rem',
                    }}
                  >
                    {ticket.description || 'No description provided.'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveDetails}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMMENTS */}
          {activeTab === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Write a comment or status note..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={!commentText.trim()}>
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {!ticket.comments || ticket.comments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No comments yet on this ticket.
                  </div>
                ) : (
                  ticket.comments.map((comment, index) => (
                    <div key={comment._id || index} className="comment-card">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {comment.userName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--brand-accent)',
                            }}
                          >
                            {comment.userRole}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {comment.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY AUDIT */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!ticket.activity || ticket.activity.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No activity history recorded yet.
                </div>
              ) : (
                ticket.activity.map((act, index) => (
                  <div key={act._id || index} className="timeline-item">
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        border: '2px solid var(--brand-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <History size={14} color="var(--brand-accent)" />
                    </div>
                    <div style={{ flex: 1, fontSize: '0.85rem' }}>
                      <div>
                        <strong>{act.userName}</strong> changed status from{' '}
                        <span style={{ color: 'var(--text-muted)' }}>'{act.from || 'Created'}'</span> to{' '}
                        <span style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>
                          '{act.to}'
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatDate(act.date)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
