import React from 'react';
import { useProject } from '../context/ProjectContext';
import { KanbanBoard } from '../components/KanbanBoard';

export const BoardPage: React.FC = () => {
  const {
    filteredTickets,
    openTicketDetail,
    handleStatusChange,
    setCreateTicketOpen,
  } = useProject();

  return (
    <KanbanBoard
      tickets={filteredTickets}
      onOpenDetail={openTicketDetail}
      onStatusChange={handleStatusChange}
      onOpenCreateTicket={() => setCreateTicketOpen(true)}
    />
  );
};

export default BoardPage;
