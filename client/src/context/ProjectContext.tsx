import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ticketService, projectService, sprintService, userService } from '../services/api';
import { Ticket, Project, Sprint, User, ProjectRole } from '../types';

interface ProjectContextType {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (p: Project) => void;
  sprints: Sprint[];
  users: User[];
  allLabels: string[];
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (a: string) => void;
  labelFilter: string;
  setLabelFilter: (l: string) => void;
  quickTab: 'all' | 'my_tickets' | 'urgent' | 'due_soon';
  setQuickTab: (tab: 'all' | 'my_tickets' | 'urgent' | 'due_soon') => void;

  // Actions
  handleStatusChange: (ticket: Ticket, newStatus: string) => Promise<void>;
  handleCreateTicket: (formData: any) => Promise<void>;
  handleUpdateDetails: (id: string, details: any) => Promise<void>;
  handleAddComment: (id: string, text: string) => Promise<void>;
  handleDeleteTicket: (id: string) => Promise<void>;
  handleCreateSprint: (data: any) => Promise<void>;
  handleUpdateSprint: (id: string, data: any) => Promise<void>;
  handleDeleteSprint: (id: string) => Promise<void>;
  handleAssignTicketToSprint: (sprintId: string, ticketId: string) => Promise<void>;
  handleCreateProject: (data: any) => Promise<void>;
  handleUpdateProject: (id: string, data: any) => Promise<void>;
  handleAddMember: (id: string, data: { userId: string; projectRole: ProjectRole }) => Promise<void>;
  handleRemoveMember: (id: string, userId: string) => Promise<void>;
  handleCreateUser: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    projectId?: string;
    projectRole?: string;
  }) => Promise<any>;
  handleUpdateUser: (
    id: string,
    data: { name?: string; email?: string; password?: string; role?: string }
  ) => Promise<any>;
  handleDeleteUser: (id: string) => Promise<void>;

  // Modals & detail drawer
  selectedTicket: Ticket | null;
  setSelectedTicket: (t: Ticket | null) => void;
  detailModalOpen: boolean;
  setDetailModalOpen: (open: boolean) => void;
  createTicketOpen: boolean;
  setCreateTicketOpen: (open: boolean) => void;
  createSprintOpen: boolean;
  setCreateSprintOpen: (open: boolean) => void;
  createProjectOpen: boolean;
  setCreateProjectOpen: (open: boolean) => void;
  projectSettingsOpen: boolean;
  setProjectSettingsOpen: (open: boolean) => void;
  openTicketDetail: (ticket: Ticket) => void;

  // Toast notifications
  toasts: { id: number; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const [quickTab, setQuickTab] = useState<'all' | 'my_tickets' | 'urgent' | 'due_soon'>('all');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [ticketsRes, projectsRes, sprintsRes, usersRes] = await Promise.all([
        ticketService.getTickets(),
        projectService.getProjects(),
        sprintService.getSprints(),
        userService.getUsers(),
      ]);

      if (ticketsRes.data?.tickets) setTickets(ticketsRes.data.tickets);
      if (projectsRes.data?.projects) {
        setProjects(projectsRes.data.projects);
        if (projectsRes.data.projects.length > 0 && !selectedProject) {
          setSelectedProject(projectsRes.data.projects[0]);
        }
      }
      if (sprintsRes.data?.sprints) setSprints(sprintsRes.data.sprints);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const openTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
  };

  // Status Change with Zod / Workflow state machine validation
  const handleStatusChange = async (ticket: Ticket, newStatus: string) => {
    try {
      const res = await ticketService.updateStatus(ticket._id, newStatus);
      if (res.data.success) {
        setTickets((prev) =>
          prev.map((t) => (t._id === ticket._id ? res.data.ticket : t))
        );
        if (selectedTicket?._id === ticket._id) {
          setSelectedTicket(res.data.ticket);
        }
        addToast(`${ticket.ticketId} transitioned to "${newStatus}"`, 'success');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Workflow transition validation failed';
      addToast(errorMsg, 'error');
    }
  };

  const handleCreateTicket = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        projectId: selectedProject?._id,
      };
      const res = await ticketService.createTicket(payload);
      if (res.data.success) {
        setTickets((prev) => [res.data.ticket, ...prev]);
        addToast(`Issue ${res.data.ticket.ticketId} created successfully!`, 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create issue', 'error');
    }
  };

  const handleUpdateDetails = async (id: string, details: any) => {
    try {
      const res = await ticketService.updateTicket(id, details);
      if (res.data.success) {
        setTickets((prev) =>
          prev.map((t) => (t._id === id ? res.data.ticket : t))
        );
        setSelectedTicket(res.data.ticket);
        addToast('Issue details updated successfully', 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update details', 'error');
    }
  };

  const handleAddComment = async (id: string, text: string) => {
    try {
      const res = await ticketService.addComment(id, text);
      if (res.data.success) {
        setTickets((prev) =>
          prev.map((t) => (t._id === id ? res.data.ticket : t))
        );
        setSelectedTicket(res.data.ticket);
        addToast('Comment added', 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to add comment', 'error');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const res = await ticketService.deleteTicket(id);
      if (res.data.success) {
        setTickets((prev) => prev.filter((t) => t._id !== id));
        addToast('Ticket deleted successfully', 'info');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete ticket', 'error');
    }
  };

  const handleCreateSprint = async (sprintData: any) => {
    try {
      if (!selectedProject) return;
      const res = await sprintService.createSprint({
        ...sprintData,
        projectId: selectedProject._id,
      });
      if (res.data.success) {
        setSprints((prev) => [res.data.sprint, ...prev]);
        addToast(`Sprint "${res.data.sprint.name}" created!`, 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create sprint', 'error');
    }
  };

  const handleUpdateSprint = async (id: string, data: any) => {
    try {
      const res = await sprintService.updateSprint(id, data);
      if (res.data.success) {
        setSprints((prev) =>
          prev.map((s) => (s._id === id ? res.data.sprint : s))
        );
        addToast(`Sprint updated successfully`, 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update sprint', 'error');
    }
  };

  const handleDeleteSprint = async (id: string) => {
    if (!window.confirm('Delete this sprint? Issues will be returned to the Backlog.')) return;
    try {
      const res = await sprintService.deleteSprint(id);
      if (res.data.success) {
        setSprints((prev) => prev.filter((s) => s._id !== id));
        setTickets((prev) =>
          prev.map((t) => {
            const sprintId = typeof t.sprint === 'object' ? t.sprint?._id : t.sprint;
            return sprintId === id ? { ...t, sprint: null } : t;
          })
        );
        addToast('Sprint deleted and issues moved to Backlog', 'info');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete sprint', 'error');
    }
  };

  const handleAssignTicketToSprint = async (sprintId: string, ticketId: string) => {
    try {
      const res = await ticketService.updateTicket(ticketId, {
        sprintId: sprintId === 'backlog' ? null : sprintId,
      });
      if (res.data.success) {
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? res.data.ticket : t))
        );
        addToast(`Issue moved successfully`, 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to move issue', 'error');
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const res = await projectService.createProject(projectData);
      if (res.data.success) {
        setProjects((prev) => [...prev, res.data.project]);
        setSelectedProject(res.data.project);
        addToast(`Project "${res.data.project.name}" [${res.data.project.key}] created!`, 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const handleUpdateProject = async (id: string, data: any) => {
    try {
      const res = await projectService.updateProject(id, data);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? res.data.project : p))
        );
        setSelectedProject(res.data.project);
        addToast('Project settings saved', 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save settings', 'error');
    }
  };

  const handleAddMember = async (id: string, data: { userId: string; projectRole: ProjectRole }) => {
    try {
      const res = await projectService.addOrUpdateMember(id, data);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? res.data.project : p))
        );
        setSelectedProject(res.data.project);
        addToast('Project member updated', 'success');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update member', 'error');
    }
  };

  const handleRemoveMember = async (id: string, userId: string) => {
    try {
      const res = await projectService.removeMember(id, userId);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === id ? res.data.project : p))
        );
        setSelectedProject(res.data.project);
        addToast('Member removed from project', 'info');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const handleCreateUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    projectId?: string;
    projectRole?: string;
  }) => {
    try {
      const res = await userService.createUser(data);
      if (res.data.success) {
        setUsers((prev) => [...prev, res.data.user]);
        if (data.projectId) {
          await refreshData();
        }
        addToast(res.data.message || `User ${res.data.user.name} created!`, 'success');
        return res.data.user;
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
      throw error;
    }
  };

  const handleUpdateUser = async (
    id: string,
    data: { name?: string; email?: string; password?: string; role?: string }
  ) => {
    try {
      const res = await userService.updateUser(id, data);
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
        await refreshData();
        addToast(res.data.message || `User updated!`, 'success');
        return res.data.user;
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to update user', 'error');
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await userService.deleteUser(id);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        await refreshData();
        addToast(res.data.message || 'User deleted from platform', 'info');
      }
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete user', 'error');
      throw error;
    }
  };

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      t.labels?.forEach((l) => set.add(l));
    });
    return Array.from(set);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedProject) {
        const pId = typeof t.project === 'object' ? t.project?._id : t.project;
        if (pId && pId !== selectedProject._id) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchId = t.ticketId?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchLabel = t.labels?.some((l) => l.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchDesc && !matchLabel) return false;
      }

      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;

      if (assigneeFilter !== 'All') {
        const aId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
        if (aId !== assigneeFilter) return false;
      }

      if (labelFilter !== 'All') {
        if (!t.labels?.includes(labelFilter)) return false;
      }

      if (quickTab === 'my_tickets') {
        const aId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
        if (aId !== user?._id) return false;
      } else if (quickTab === 'urgent') {
        if (t.priority !== 'Urgent' && t.priority !== 'High') return false;
      } else if (quickTab === 'due_soon') {
        if (!t.deadline) return false;
        const diff = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (diff > 3 || t.status === 'Done' || t.status === 'Solved' || t.status === 'Closed') {
          return false;
        }
      }

      return true;
    });
  }, [tickets, selectedProject, searchQuery, priorityFilter, typeFilter, assigneeFilter, labelFilter, quickTab, user]);

  return (
    <ProjectContext.Provider
      value={{
        tickets,
        filteredTickets,
        projects,
        selectedProject,
        setSelectedProject,
        sprints,
        users,
        allLabels,
        loading,
        refreshData,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        typeFilter,
        setTypeFilter,
        assigneeFilter,
        setAssigneeFilter,
        labelFilter,
        setLabelFilter,
        quickTab,
        setQuickTab,
        handleStatusChange,
        handleCreateTicket,
        handleUpdateDetails,
        handleAddComment,
        handleDeleteTicket,
        handleCreateSprint,
        handleUpdateSprint,
        handleDeleteSprint,
        handleAssignTicketToSprint,
        handleCreateProject,
        handleUpdateProject,
        handleAddMember,
        handleRemoveMember,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser,
        selectedTicket,
        setSelectedTicket,
        detailModalOpen,
        setDetailModalOpen,
        createTicketOpen,
        setCreateTicketOpen,
        createSprintOpen,
        setCreateSprintOpen,
        createProjectOpen,
        setCreateProjectOpen,
        projectSettingsOpen,
        setProjectSettingsOpen,
        openTicketDetail,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
