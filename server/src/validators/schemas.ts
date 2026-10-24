import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodIssue } from 'zod';
import { TicketStatus, UserRole } from '../types/index.js';

/**
 * Universal Express middleware for Zod schema validation
 */
export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Input validation failed',
        errors: error.issues.map((e: ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// 1. Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(60),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Project Admin', 'Team Lead', 'Developer', 'QA']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Project Admin', 'Team Lead', 'Developer', 'QA']).default('Developer'),
  projectId: z.string().optional(),
  projectRole: z.enum(['Admin', 'Member', 'Viewer']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  email: z.string().email('Valid email address required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['Project Admin', 'Team Lead', 'Developer', 'QA']).optional(),
});

export const inviteEmployeeSchema = z.object({
  name: z.string().min(2, 'Employee name must be at least 2 characters').max(60),
  email: z.string().email('Valid email address required'),
  role: z.enum(['Project Admin', 'Team Lead', 'Developer', 'QA']).default('Developer'),
  projectId: z.string().min(1, 'Project selection is required'),
  projectRole: z.enum(['Admin', 'Member', 'Viewer']).default('Member'),
  sprintId: z.string().optional(),
  message: z.string().optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  title: z.string().min(2, 'Job title is required').max(80),
  department: z.string().min(2, 'Department is required').max(60),
  phone: z.string().min(4, 'Valid contact number is required').max(30),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
});

// 2. Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(80),
  key: z
    .string()
    .min(2, 'Key must be at least 2 characters')
    .max(10, 'Key maximum length is 10 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Project key must contain only letters and numbers (alphanumeric)'),
  description: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        projectRole: z.enum(['Admin', 'Member', 'Viewer']).default('Member'),
      })
    )
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().optional(),
  settings: z
    .object({
      allowViewerComments: z.boolean().optional(),
      lead: z.string().optional(),
    })
    .optional(),
});

export const updateProjectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  projectRole: z.enum(['Admin', 'Member', 'Viewer']),
});

// 3. Ticket / Issue Schemas
const ticketStatusValues = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Solved',
  'Closed',
] as const;

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Ticket title must be at least 3 characters').max(150),
  description: z.string().optional(),
  projectId: z.string().optional(),
  sprintId: z.string().nullable().optional(),
  type: z.enum(['Task', 'Bug', 'Story', 'Epic']).default('Task'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  status: z.enum(ticketStatusValues).default('To Do'),
  deadline: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().optional(),
  type: z.enum(['Task', 'Bug', 'Story', 'Epic']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  status: z.enum(ticketStatusValues).optional(),
  deadline: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  sprintId: z.string().nullable().optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatusValues),
});

export const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(2000),
});

// 4. Sprint Schemas
export const createSprintSchema = z.object({
  name: z.string().min(2, 'Sprint name must be at least 2 characters').max(80),
  goal: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateSprintSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['Planning', 'Active', 'Completed']).optional(),
});

export const assignTicketToSprintSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
});

// 5. Workflow State Machine Rules
export const ALLOWED_WORKFLOW_TRANSITIONS: Record<string, string[]> = {
  Backlog: ['To Do'],
  'To Do': ['In Progress', 'Backlog'],
  'In Progress': ['In Review', 'To Do', 'Done', 'Solved'],
  'In Review': ['Done', 'Solved', 'In Progress'],
  Done: ['Closed', 'In Progress'],
  Solved: ['Closed', 'In Progress'],
  Closed: ['To Do'],
};

export const validateWorkflowTransition = (
  fromStatus: string,
  toStatus: string,
  userRole?: UserRole
): { valid: boolean; message?: string } => {
  if (fromStatus === toStatus) return { valid: true };

  // Project Admin and Team Lead have override authority
  if (userRole && ['Project Admin', 'Team Lead'].includes(userRole)) {
    return { valid: true };
  }

  const allowed = ALLOWED_WORKFLOW_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    return {
      valid: false,
      message: `Invalid workflow transition: Cannot move directly from '${fromStatus}' to '${toStatus}'. Allowed transitions: ${
        allowed.join(', ') || 'None'
      }`,
    };
  }

  return { valid: true };
};
