import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'Project Admin' | 'Team Lead' | 'Developer' | 'QA';
export type ProjectRole = 'Admin' | 'Member' | 'Viewer';
export type SprintStatus = 'Planning' | 'Active' | 'Completed';
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

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  isInvited?: boolean;
  inviteToken?: string | null;
  inviteProject?: Types.ObjectId;
  inviteSprint?: Types.ObjectId;
  inviteProjectRole?: ProjectRole;
  inviteMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(entered: string): Promise<boolean>;
}

export interface IProjectMember {
  user: Types.ObjectId | IUser;
  projectRole: ProjectRole;
  joinedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  key: string;
  description: string;
  createdBy: Types.ObjectId | IUser;
  ticketCounter: number;
  members: IProjectMember[];
  settings?: {
    allowViewerComments?: boolean;
    lead?: Types.ObjectId | IUser;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ISprint extends Document {
  _id: Types.ObjectId;
  name: string;
  goal: string;
  startDate?: Date;
  endDate?: Date;
  status: SprintStatus;
  project: Types.ObjectId | IProject;
  createdBy: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id?: Types.ObjectId;
  user: Types.ObjectId | IUser;
  userName: string;
  userRole: string;
  text: string;
  createdAt: Date;
}

export interface IActivity {
  _id?: Types.ObjectId;
  user: Types.ObjectId | IUser;
  userName: string;
  action: string;
  from?: string;
  to?: string;
  date: Date;
}

export interface ITicket extends Document {
  _id: Types.ObjectId;
  ticketId: string;
  title: string;
  description: string;
  project: Types.ObjectId | IProject;
  sprint?: Types.ObjectId | ISprint | null;
  labels: string[];
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  deadline?: Date | null;
  assignedBy: Types.ObjectId | IUser;
  assignedTo: Types.ObjectId | IUser;
  comments: IComment[];
  activity: IActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  ticket?: ITicket;
}
