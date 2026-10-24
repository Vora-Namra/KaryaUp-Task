export type UserRole = 'Project Admin' | 'Team Lead' | 'Developer' | 'QA';
export type ProjectRole = 'Admin' | 'Member' | 'Viewer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  isInvited?: boolean;
  createdAt?: string;
}

export interface DemoUserAccount {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface ProjectMember {
  user: User;
  projectRole: ProjectRole;
  joinedAt?: string;
}

export interface ProjectSettings {
  allowViewerComments?: boolean;
  lead?: string | User;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  createdBy: User;
  ticketCounter: number;
  members: ProjectMember[];
  settings?: ProjectSettings;
  createdAt?: string;
  updatedAt?: string;
}

export type SprintStatus = 'Planning' | 'Active' | 'Completed';

export interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  project: string | Project;
  createdBy: User;
  totalTickets?: number;
  doneTickets?: number;
  inProgressTickets?: number;
  todoTickets?: number;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketType = 'Task' | 'Bug' | 'Story' | 'Epic';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus =
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'In Review'
  | 'Done'
  | 'Solved'
  | 'Closed';

export interface Comment {
  _id?: string;
  user: string | User;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
}

export interface Activity {
  _id?: string;
  user: string | User;
  userName: string;
  action: string;
  from?: string;
  to?: string;
  date: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description?: string;
  project: Project;
  sprint?: Sprint | null;
  labels?: string[];
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  deadline?: string | null;
  assignedBy: User;
  assignedTo: User;
  comments: Comment[];
  activity: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  priority: string;
  type: string;
  assignee: string;
  label: string;
  sprint: string;
  quickTab: 'all' | 'my_tickets' | 'urgent' | 'due_soon';
}
