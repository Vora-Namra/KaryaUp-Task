import React, { useState } from 'react';
import { Ticket } from '../types';
import { TicketCard } from './TicketCard';

const COLUMNS = [
  { id: 'To Do', title: 'To Do', color: '#0EA5E9' },
  { id: 'In Progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'In Review', title: 'In Review', color: '#8B5CF6' },
  { id: 'Done', title: 'Done', color: '#10B981' },
  { id: 'Closed', title: 'Closed', color: '#6B7280' },
];

interface KanbanBoardProps {
  tickets: Ticket[];
  onOpenDetail: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: string) => void;
  onOpenCreateTicket: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onOpenDetail,
  onStatusChange,
}) => {
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticket: Ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.setData('text/plain', ticket._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTicket) return;

    if (draggedTicket.status !== targetStatus) {
      onStatusChange(draggedTicket, targetStatus);
    }
    setDraggedTicket(null);
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const columnTickets = tickets.filter((t) => {
          if (col.id === 'To Do') {
            return t.status === 'To Do' || t.status === 'Backlog';
          }
          if (col.id === 'Done') {
            return t.status === 'Done' || t.status === 'Solved';
          }
          return t.status === col.id;
        });

        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`kanban-column ${isOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title-group">
                <span
                  className="status-indicator-dot"
                  style={{ backgroundColor: col.color }}
                />
                <span className="column-title">{col.title}</span>
              </div>
              <span className="column-count">{columnTickets.length}</span>
            </div>

            <div className="column-card-list">
              {columnTickets.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '8px',
                    margin: 'auto 0',
                  }}
                >
                  Drop tickets here
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onOpenDetail={onOpenDetail}
                    onStatusChange={onStatusChange}
                    isDragging={draggedTicket?._id === ticket._id}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
