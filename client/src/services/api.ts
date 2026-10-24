import axios, { AxiosResponse } from 'axios';
import {
  User,
  Project,
  Sprint,
  Ticket,
  DemoUserAccount,
  ProjectRole,
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('karyaup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; user: User; token: string }>('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ success: boolean; user: User; token: string }>('/auth/register', data),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
  getDemoUsers: () =>
    api.get<{ success: boolean; demoAccounts: DemoUserAccount[] }>('/auth/demo-users'),
};

// Users
export const userService = {
  getUsers: () => api.get<{ success: boolean; users: User[] }>('/users'),
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    projectId?: string;
    projectRole?: string;
  }) => api.post<{ success: boolean; message: string; user: User }>('/users', data),
  updateUser: (
    id: string,
    data: { name?: string; email?: string; password?: string; role?: string }
  ) => api.put<{ success: boolean; message: string; user: User }>(`/users/${id}`, data),
  deleteUser: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),
  inviteEmployee: (data: {
    name: string;
    email: string;
    role: string;
    projectId: string;
    projectRole: string;
    sprintId?: string;
    message?: string;
  }) =>
    api.post<{
      success: boolean;
      message: string;
      inviteToken: string;
      inviteUrl: string;
      invitation: any;
    }>('/users/invite', data),
  getInviteDetails: (token: string) =>
    api.get<{ success: boolean; invite: any }>(`/users/invite/${token}`),
  acceptInvite: (data: {
    token: string;
    password: string;
    title: string;
    department: string;
    phone: string;
    skills?: string[];
    bio?: string;
  }) =>
    api.post<{
      success: boolean;
      message: string;
      token: string;
      user: User;
    }>('/users/accept-invite', data),
};

// Projects & Members
export const projectService = {
  getProjects: () => api.get<{ success: boolean; count: number; projects: Project[] }>('/projects'),
  getProjectById: (id: string) =>
    api.get<{ success: boolean; project: Project }>(`/projects/${id}`),
  createProject: (data: { name: string; key: string; description?: string }) =>
    api.post<{ success: boolean; project: Project }>('/projects', data),
  updateProject: (id: string, data: { name?: string; description?: string; settings?: any }) =>
    api.put<{ success: boolean; project: Project }>(`/projects/${id}`, data),
  addOrUpdateMember: (id: string, data: { userId: string; projectRole: ProjectRole }) =>
    api.post<{ success: boolean; project: Project }>(`/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete<{ success: boolean; project: Project }>(`/projects/${id}/members/${userId}`),
};

// Sprints
export const sprintService = {
  getSprints: (projectId?: string) =>
    api.get<{ success: boolean; count: number; sprints: Sprint[] }>('/sprints', {
      params: { projectId },
    }),
  createSprint: (data: {
    name: string;
    goal?: string;
    projectId: string;
    startDate?: string;
    endDate?: string;
  }) => api.post<{ success: boolean; sprint: Sprint }>('/sprints', data),
  updateSprint: (
    id: string,
    data: {
      name?: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
      status?: 'Planning' | 'Active' | 'Completed';
    }
  ) => api.put<{ success: boolean; sprint: Sprint }>(`/sprints/${id}`, data),
  assignTicketToSprint: (sprintId: string, ticketId: string) =>
    api.patch<{ success: boolean; ticket: Ticket }>(`/sprints/${sprintId}/tickets`, { ticketId }),
  deleteSprint: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/sprints/${id}`),
};

// Tickets
export const ticketService = {
  getTickets: (params?: Record<string, any>) =>
    api.get<{
      success: boolean;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
      count: number;
      tickets: Ticket[];
    }>('/tickets', { params }),
  getTicketById: (id: string) =>
    api.get<{ success: boolean; ticket: Ticket }>(`/tickets/${id}`),
  createTicket: (data: {
    title: string;
    description?: string;
    projectId?: string;
    sprintId?: string | null;
    type?: string;
    priority?: string;
    status?: string;
    deadline?: string | null;
    assignedTo?: string | null;
    labels?: string[];
  }) => api.post<{ success: boolean; ticket: Ticket }>('/tickets', data),
  updateTicket: (id: string, data: Record<string, any>) =>
    api.put<{ success: boolean; ticket: Ticket }>(`/tickets/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch<{ success: boolean; message: string; ticket: Ticket }>(`/tickets/${id}/status`, {
      status,
    }),
  addComment: (id: string, text: string) =>
    api.post<{ success: boolean; ticket: Ticket }>(`/tickets/${id}/comments`, { text }),
  deleteTicket: (id: string) =>
    api.delete<{ success: boolean; message: string; ticketId: string }>(`/tickets/${id}`),
};

export default api;
