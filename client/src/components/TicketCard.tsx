import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, TicketStatus } from '../types';
import {
  ArrowUp,
  ArrowDown,
  Equal,
  Flame,
  Clock,
  UserCheck,
  Bug,
  Bookmark,
  CheckSquare,
  Tag,
} from 'lucide-react';

const STATUS_LIST: TicketStatus[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Closed',
];

interface TicketCardProps {
  ticket: Ticket;
  onOpenDetail: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: string) => void;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onOpenDetail,
  onStatusChange,
  isDragging,
  onDragStart,
}) => {
  const { user, canUpdateTicketStatus } = useAuth();

  const isAssignedToCurrentUser =
    (typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo) ===
    user?._id;

  const canEditStatus = canUpdateTicketStatus(ticket);

  // Type Icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug':
        return <Bug size={13} color="#EF4444" />;
      case 'Story':
        return <Bookmark size={13} color="#10B981" />;
      default:
        return <CheckSquare size={13} color="#3B82F6" />;
    }
  };

  // Priority Icon and class
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return {
          icon: <Flame size={13} />,
          className: 'priority-urgent',
        };
      case 'High':
        return {
          icon: <ArrowUp size={13} />,
          className: 'priority-high',
        };
      case 'Medium':
        return {
          icon: <Equal size={13} />,
          className: 'priority-medium',
        };
      case 'Low':
      default:
        return {
          icon: <ArrowDown size={13} />,
          className: 'priority-low',
        };
    }
  };

  const priorityInfo = getPriorityInfo(ticket.priority);

  // Check deadline
  const isOverdue =
    ticket.deadline &&
    new Date(ticket.deadline) < new Date() &&
    ticket.status !== 'Done' &&
    ticket.status !== 'Solved' &&
    ticket.status !== 'Closed';

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const assigneeName = typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.name : 'User';
  const assigneeRole = typeof ticket.assignedTo === 'object' ? ticket.assignedTo?.role : '';

  return (
    <div
      className={`ticket-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      onClick={() => onOpenDetail(ticket)}
    >
      <div className="ticket-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="ticket-id-tag">{ticket.ticketId}</span>
          <span
            className="ticket-type-badge"
            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            {getTypeIcon(ticket.type)}
            <span>{ticket.type}</span>
          </span>
        </div>

        {isAssignedToCurrentUser && (
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
            title="Ticket is assigned to you"
          >
            <UserCheck size={11} />
            <span>Assigned to You</span>
          </span>
        )}
      </div>

      <div className="ticket-card-title">{ticket.title}</div>

      {ticket.description && <div className="ticket-card-desc">{ticket.description}</div>}

      {/* Labels Pills */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {ticket.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.675rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--brand-accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Tag size={9} />
              {lbl}
            </span>
          ))}
          {ticket.labels.length > 3 && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              +{ticket.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Quick Status Transition Dropdown */}
      <div
        className="ticket-status-quick-bar"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="quick-status-label">Status:</span>
        <select
          className="quick-status-select"
          value={ticket.status === 'Solved' ? 'Done' : ticket.status}
          onChange={(e) => onStatusChange(ticket, e.target.value)}
          title={
            canEditStatus
              ? 'Update ticket status'
              : 'Only assigned user or Team Lead / Admin can update this ticket status'
          }
        >
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="ticket-card-footer">
        <div className={`priority-pill ${priorityInfo.className}`}>
          {priorityInfo.icon}
          <span>{ticket.priority}</span>
        </div>

        <div className="ticket-card-meta-right">
          {ticket.deadline && (
            <div
              className={`deadline-chip ${isOverdue ? 'overdue' : ''}`}
              title={`Deadline: ${new Date(ticket.deadline).toLocaleDateString()}`}
            >
              <Clock size={12} />
              <span>{formatDeadline(ticket.deadline)}</span>
            </div>
          )}

          {ticket.assignedTo && (
            <div
              className="assignee-avatar-chip"
              style={{
                backgroundColor:
                  assigneeRole === 'Developer'
                    ? '#10B981'
                    : assigneeRole === 'QA'
                    ? '#F59E0B'
                    : assigneeRole === 'Team Lead'
                    ? '#0EA5E9'
                    : '#6366F1',
              }}
              title={`Assigned to: ${assigneeName} (${assigneeRole})`}
            >
              {getInitials(assigneeName)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
