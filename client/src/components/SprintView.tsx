import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprint, Ticket } from '../types';
import {
  Calendar,
  CheckCircle2,
  PlayCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowUp,
  ArrowDown,
  Equal,
  Sparkles,
  ArrowRight,
  Target,
} from 'lucide-react';

interface SprintViewProps {
  sprints: Sprint[];
  tickets: Ticket[];
  onOpenDetail: (ticket: Ticket) => void;
  onOpenCreateSprint: () => void;
  onUpdateSprint: (id: string, data: Partial<Sprint>) => void;
  onDeleteSprint: (id: string) => void;
  onAssignTicketToSprint: (sprintId: string, ticketId: string) => void;
  onOpenCreateTicket: () => void;
}

export const SprintView: React.FC<SprintViewProps> = ({
  sprints,
  tickets,
  onOpenDetail,
  onOpenCreateSprint,
  onUpdateSprint,
  onDeleteSprint,
  onAssignTicketToSprint,
  onOpenCreateTicket,
}) => {
  const { hasRole } = useAuth();
  const canManageSprint = hasRole('Project Admin', 'Team Lead');

  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSprint = sprints.find((s) => s.status === 'Active');
  const planningSprints = sprints.filter((s) => s.status === 'Planning');
  const backlogTickets = tickets.filter((t) => !t.sprint || t.status === 'Backlog');

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Flame size={12} color="#EF4444" />;
      case 'High':
        return <ArrowUp size={12} color="#F97316" />;
      case 'Medium':
        return <Equal size={12} color="#3B82F6" />;
      default:
        return <ArrowDown size={12} color="#94A3B8" />;
    }
  };

  const renderSprintItem = (sprint: Sprint) => {
    const isCollapsed = collapsedSprints[sprint._id];
    const sprintTickets = tickets.filter(
      (t) => (typeof t.sprint === 'object' ? t.sprint?._id : t.sprint) === sprint._id
    );

    const doneCount = sprintTickets.filter(
      (t) => t.status === 'Done' || t.status === 'Solved' || t.status === 'Closed'
    ).length;
    const progress =
      sprintTickets.length > 0 ? Math.round((doneCount / sprintTickets.length) * 100) : 0;

    return (
      <div
        key={sprint._id}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Sprint Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-tertiary)',
            borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => toggleCollapse(sprint._id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {sprint.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background:
                      sprint.status === 'Active'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(56, 189, 248, 0.15)',
                    color: sprint.status === 'Active' ? '#34D399' : '#38BDF8',
                  }}
                >
                  {sprint.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({sprintTickets.length} issues)
                </span>
              </div>

              {sprint.goal && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Target size={12} color="var(--brand-accent)" />
                  <span>Goal: {sprint.goal}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {sprint.startDate && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Calendar size={13} />
                <span>
                  {new Date(sprint.startDate).toLocaleDateString()}
                  {sprint.endDate && ` – ${new Date(sprint.endDate).toLocaleDateString()}`}
                </span>
              </div>
            )}

            {canManageSprint && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {sprint.status === 'Planning' ? (
                  <button
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => onUpdateSprint(sprint._id, { status: 'Active' })}
                  >
                    <PlayCircle size={13} />
                    <span>Start Sprint</span>
                  </button>
                ) : sprint.status === 'Active' ? (
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#10B981' }}
                    onClick={() => onUpdateSprint(sprint._id, { status: 'Completed' })}
                  >
                    <CheckCircle2 size={13} />
                    <span>Complete Sprint</span>
                  </button>
                ) : null}

                <button
                  className="icon-btn"
                  style={{ width: '28px', height: '28px', color: 'var(--priority-urgent)' }}
                  title="Delete Sprint"
                  onClick={() => onDeleteSprint(sprint._id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Active Sprint */}
        {!isCollapsed && sprintTickets.length > 0 && (
          <div style={{ padding: '0.5rem 1.25rem 0.25rem', background: 'var(--bg-secondary)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              <span>Sprint Completion</span>
              <span>
                {doneCount} of {sprintTickets.length} done ({progress}%)
              </span>
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--bg-tertiary)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Ticket List in Sprint */}
        {!isCollapsed && (
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sprintTickets.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '6px',
                }}
              >
                No issues in this sprint. Move issues from Backlog below into this sprint.
              </div>
            ) : (
              sprintTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => onOpenDetail(ticket)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span className="ticket-id-tag">{ticket.ticketId}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getPriorityIcon(ticket.priority)}
                    </div>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ticket.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--brand-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {ticket.status}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ticket.assignedTo?.name || 'Unassigned'}
                    </span>

                    {canManageSprint && (
                      <button
                        className="role-switch-btn"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignTicketToSprint('backlog', ticket._id);
                        }}
                        title="Move issue to Backlog"
                      >
                        Backlog ➔
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Sprint Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Sprint Planning & Backlog
          </h2>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
            }}
          >
            {sprints.length} sprints total
          </span>
        </div>

        {canManageSprint && (
          <button className="btn-primary" onClick={onOpenCreateSprint}>
            <Sparkles size={16} />
            <span>Create Sprint</span>
          </button>
        )}
      </div>

      {/* 1. Active & Planning Sprints List */}
      <div>{sprints.map((sprint) => renderSprintItem(sprint))}</div>

      {/* 2. Product Backlog Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Backlog</h3>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {backlogTickets.length} issues
            </span>
          </div>

          <button
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            onClick={onOpenCreateTicket}
          >
            <Plus size={14} />
            <span>Add Issue to Backlog</span>
          </button>
        </div>

        <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {backlogTickets.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              Backlog is clear! All items are assigned to sprints.
            </div>
          ) : (
            backlogTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => onOpenDetail(ticket)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <span className="ticket-id-tag">{ticket.ticketId}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getPriorityIcon(ticket.priority)}
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ticket.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ticket.assignedTo?.name || 'Unassigned'}
                  </span>

                  {canManageSprint && sprints.length > 0 && (
                    <select
                      className="filter-select"
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                      defaultValue=""
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignTicketToSprint(e.target.value, ticket._id);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Move to Sprint...
                      </option>
                      {sprints.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
