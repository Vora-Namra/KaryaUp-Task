import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, TicketStatus } from '../types';
import {
  Trash2,
  ExternalLink,
  Flame,
  ArrowUp,
  ArrowDown,
  Equal,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';

const STATUS_LIST: TicketStatus[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Closed',
];

interface TableViewProps {
  tickets: Ticket[];
  totalTickets?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  loading?: boolean;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  onOpenDetail: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: string) => void;
  onDeleteTicket: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tickets,
  totalTickets,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  loading = false,
  onPageChange,
  onPageSizeChange,
  onOpenDetail,
  onStatusChange,
  onDeleteTicket,
}) => {
  const { user, hasRole, canUpdateTicketStatus } = useAuth();
  const canDelete = hasRole('Project Admin', 'Team Lead');

  const total = totalTickets ?? tickets.length;
  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Flame size={13} color="#EF4444" />;
      case 'High':
        return <ArrowUp size={13} color="#F97316" />;
      case 'Medium':
        return <Equal size={13} color="#3B82F6" />;
      default:
        return <ArrowDown size={13} color="#94A3B8" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'To Do':
      case 'Backlog':
        return { background: 'rgba(14, 165, 233, 0.15)', color: '#38BDF8' };
      case 'In Progress':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' };
      case 'In Review':
        return { background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' };
      case 'Done':
      case 'Solved':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' };
      case 'Closed':
      default:
        return { background: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF' };
    }
  };

  // Generate pagination page list with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="table-container" style={{ position: 'relative' }}>
      {/* Loading overlay for page transitions */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(2px)',
            color: 'var(--accent-primary)',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <Loader2 size={20} className="animate-spin" />
          <span>Loading page {currentPage}...</span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="karya-table">
          <thead>
            <tr>
              <th>Ticket Key</th>
              <th>Type</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Sprint</th>
              <th>Labels</th>
              <th>Assigned To</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}
                >
                  No issues found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const canEditStatus = canUpdateTicketStatus(ticket);
                const assigneeId =
                  typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo;
                const isAssignedToCurrent = assigneeId === user?._id;

                return (
                  <tr key={ticket._id}>
                    <td>
                      <span
                        className="ticket-id-tag"
                        onClick={() => onOpenDetail(ticket)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view details"
                      >
                        {ticket.ticketId}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge type-${ticket.type?.toLowerCase()}`}>
                        {ticket.type}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                        }}
                        onClick={() => onOpenDetail(ticket)}
                        title={ticket.title}
                      >
                        {ticket.title}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {getPriorityIcon(ticket.priority)}
                        <span style={{ fontSize: '0.8rem' }}>{ticket.priority}</span>
                      </div>
                    </td>
                    <td>
                      {canEditStatus ? (
                        <select
                          className="status-select-sm"
                          style={{
                            ...getStatusBadgeStyle(ticket.status),
                            fontWeight: 600,
                            border: '1px solid var(--border-medium)',
                            borderRadius: '12px',
                            padding: '0.2rem 0.5rem',
                            cursor: 'pointer',
                          }}
                          value={ticket.status}
                          onChange={(e) => onStatusChange(ticket, e.target.value)}
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          style={{
                            ...getStatusBadgeStyle(ticket.status),
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {ticket.status}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {typeof ticket.sprint === 'object' && ticket.sprint
                        ? ticket.sprint.name
                        : 'Backlog'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {ticket.labels && ticket.labels.length > 0 ? (
                          ticket.labels.map((lbl) => (
                            <span key={lbl} className="label-pill">
                              <Tag size={10} />
                              {lbl}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {typeof ticket.assignedTo === 'object' && ticket.assignedTo ? (
                          <>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: ticket.assignedTo.avatar || 'var(--brand-blue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                color: '#fff',
                                fontWeight: 700,
                              }}
                            >
                              {ticket.assignedTo.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>
                              {ticket.assignedTo.name}
                              {isAssignedToCurrent && (
                                <strong style={{ color: 'var(--brand-accent)', marginLeft: '4px' }}>
                                  (You)
                                </strong>
                              )}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : 'None'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="icon-btn"
                          onClick={() => onOpenDetail(ticket)}
                          title="View Full Details"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <ExternalLink size={14} />
                        </button>
                        {canDelete && (
                          <button
                            className="icon-btn"
                            onClick={() => onDeleteTicket(ticket._id)}
                            title="Delete Ticket (Admin/Lead)"
                            style={{
                              width: '30px',
                              height: '30px',
                              color: 'var(--priority-urgent)',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Bar */}
      {onPageChange && (
        <div className="table-pagination-bar">
          <div className="pagination-left">
            <span>
              Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
              <strong>{total}</strong> issues
            </span>

            {onPageSizeChange && (
              <div className="pagination-page-size">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="pagination-nav">
            {/* First Page */}
            <button
              className="pagination-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(1)}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous Page */}
            <button
              className="pagination-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(currentPage - 1)}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Number Buttons */}
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  &hellip;
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                  disabled={loading}
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </button>
              )
            )}

            {/* Next Page */}
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(currentPage + 1)}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last Page */}
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(totalPages)}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
