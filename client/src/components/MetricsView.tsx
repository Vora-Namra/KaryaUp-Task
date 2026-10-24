import React from 'react';
import { Ticket, User } from '../types';
import { Layers, PlayCircle, CheckCircle2, AlertOctagon, Users } from 'lucide-react';

interface MetricsViewProps {
  tickets: Ticket[];
  users: User[];
}

export const MetricsView: React.FC<MetricsViewProps> = ({ tickets, users }) => {
  const total = tickets.length;
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
  const solved = tickets.filter(
    (t) => t.status === 'Done' || t.status === 'Solved' || t.status === 'Closed'
  ).length;
  const urgent = tickets.filter((t) => t.priority === 'Urgent').length;
  const overdue = tickets.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== 'Done' &&
      t.status !== 'Solved' &&
      t.status !== 'Closed'
  ).length;

  const solvedRate = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Assignee workload
  const assigneeStats = users.map((u) => {
    const userTickets = tickets.filter(
      (t) => (typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo) === u._id
    );
    const userSolved = userTickets.filter(
      (t) => t.status === 'Done' || t.status === 'Solved' || t.status === 'Closed'
    ).length;
    return {
      user: u,
      total: userTickets.length,
      solved: userSolved,
      inProgress: userTickets.filter((t) => t.status === 'In Progress').length,
    };
  });

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div
            className="metric-icon-wrap"
            style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div className="metric-num">{total}</div>
            <div className="metric-label">Total Project Tickets</div>
          </div>
        </div>

        <div className="metric-card">
          <div
            className="metric-icon-wrap"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}
          >
            <PlayCircle size={24} />
          </div>
          <div>
            <div className="metric-num">{inProgress}</div>
            <div className="metric-label">Active In Progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div
            className="metric-icon-wrap"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="metric-num">{solvedRate}%</div>
            <div className="metric-label">Solved & Done Rate ({solved}/{total})</div>
          </div>
        </div>

        <div className="metric-card">
          <div
            className="metric-icon-wrap"
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
          >
            <AlertOctagon size={24} />
          </div>
          <div>
            <div className="metric-num">{urgent} / {overdue}</div>
            <div className="metric-label">Urgent / Overdue Items</div>
          </div>
        </div>
      </div>

      {/* Team Workload Breakdown */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem',
          }}
        >
          <Users size={20} color="var(--brand-accent)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Team Role Workload & Delivery</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assigneeStats.map(({ user, total, solved, inProgress }) => {
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
            return (
              <div key={user._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '9999px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {total} assigned ({solved} done, {inProgress} in progress)
                  </span>
                </div>

                <div
                  style={{
                    height: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
