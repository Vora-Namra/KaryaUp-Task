import React from 'react';
import { useProject } from '../context/ProjectContext';
import { SprintView } from '../components/SprintView';

export const SprintsPage: React.FC = () => {
  const {
    sprints,
    filteredTickets,
    openTicketDetail,
    setCreateSprintOpen,
    handleUpdateSprint,
    handleDeleteSprint,
    handleAssignTicketToSprint,
    setCreateTicketOpen,
  } = useProject();

  return (
    <SprintView
      sprints={sprints}
      tickets={filteredTickets}
      onOpenDetail={openTicketDetail}
      onOpenCreateSprint={() => setCreateSprintOpen(true)}
      onUpdateSprint={handleUpdateSprint}
      onDeleteSprint={handleDeleteSprint}
      onAssignTicketToSprint={handleAssignTicketToSprint}
      onOpenCreateTicket={() => setCreateTicketOpen(true)}
    />
  );
};

export default SprintsPage;
