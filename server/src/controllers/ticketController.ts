import { Response } from 'express';
import Ticket from '../models/Ticket.js';
import Project from '../models/Project.js';
import { validateWorkflowTransition } from '../validators/schemas.js';
import { AuthRequest, TicketStatus } from '../types/index.js';

const VALID_STATUSES: TicketStatus[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
  'Solved',
  'Closed',
];

// @desc    Get all tickets with filters (project, status, priority, type, assignee, label, sprint, search)
// @route   GET /api/tickets
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      status,
      priority,
      type,
      assignedTo,
      assignedBy,
      label,
      sprintId,
      isBacklog,
      search,
    } = req.query as Record<string, string>;

    const query: any = {};

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    if (assignedBy) query.assignedBy = assignedBy;
    if (label) query.labels = label;

    if (sprintId) {
      query.sprint = sprintId;
    } else if (isBacklog === 'true') {
      query.sprint = null;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { labels: { $regex: search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 0;

    if (limit > 0) {
      const total = await Ticket.countDocuments(query);
      const skip = (page - 1) * limit;

      const tickets = await Ticket.find(query)
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar')
        .populate('project', 'name key')
        .populate('sprint', 'name status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(total / limit) || 1;

      res.json({
        success: true,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        count: tickets.length,
        tickets,
      });
      return;
    }

    const tickets = await Ticket.find(query)
      .populate('assignedTo', 'name email role avatar')
      .populate('assignedBy', 'name email role avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      total: tickets.length,
      page: 1,
      limit: tickets.length,
      totalPages: 1,
      hasMore: false,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket by ID or key (e.g. KUP-101)
// @route   GET /api/tickets/:id
export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idStr = String(id);
    let ticket;

    if (idStr.includes('-')) {
      ticket = await Ticket.findOne({ ticketId: idStr.toUpperCase() })
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar')
        .populate('project', 'name key')
        .populate('sprint', 'name status');
    } else {
      ticket = await Ticket.findById(idStr)
        .populate('assignedTo', 'name email role avatar')
        .populate('assignedBy', 'name email role avatar')
        .populate('project', 'name key')
        .populate('sprint', 'name status');
    }

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new issue / ticket
// @route   POST /api/tickets
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      projectId,
      sprintId,
      type = 'Task',
      priority = 'Medium',
      deadline,
      assignedTo,
      status = 'To Do',
      labels = [],
    } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    let project;
    if (projectId) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne();
    }

    if (!project) {
      res.status(400).json({ success: false, message: 'No project found to associate ticket with' });
      return;
    }

    project.ticketCounter = (project.ticketCounter || 100) + 1;
    await project.save();
    const ticketId = `${project.key}-${project.ticketCounter}`;

    const newTicket = await Ticket.create({
      ticketId,
      title,
      description: description || '',
      project: project._id,
      sprint: sprintId || null,
      type,
      priority,
      status: status === 'Done' ? 'Done' : status,
      deadline: deadline ? new Date(deadline) : null,
      labels: Array.isArray(labels)
        ? labels.map((l: string) => l.trim().toLowerCase()).filter(Boolean)
        : [],
      assignedBy: req.user._id,
      assignedTo: assignedTo || req.user._id,
      activity: [
        {
          user: req.user._id,
          userName: req.user.name,
          action: 'CREATED',
          from: '',
          to: status,
          date: new Date(),
        },
      ],
    });

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('assignedBy', 'name email role avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    res.status(201).json({ success: true, ticket: populatedTicket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status with workflow state machine validation
// @route   PATCH /api/tickets/:id/status
export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const ticket = req.ticket;

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
      return;
    }

    const previousStatus = ticket.status;
    if (previousStatus === status) {
      res.json({ success: true, ticket, message: 'Status already set to this value' });
      return;
    }

    // State Machine Validation
    const transitionCheck = validateWorkflowTransition(previousStatus, status, req.user?.role);
    if (!transitionCheck.valid) {
      res.status(400).json({
        success: false,
        message: transitionCheck.message,
      });
      return;
    }

    ticket.status = status;
    ticket.activity.push({
      user: req.user!._id,
      userName: req.user!.name,
      action: 'STATUS_CHANGED',
      from: previousStatus,
      to: status,
      date: new Date(),
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('assignedBy', 'name email role avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    res.json({
      success: true,
      message: `Status transitioned from '${previousStatus}' to '${status}' successfully`,
      ticket: populatedTicket,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket fields
// @route   PUT /api/tickets/:id
export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const isElevated = (['Project Admin', 'Team Lead'] as string[]).includes(req.user.role);
    const isAssignee = ticket.assignedTo.toString() === req.user._id.toString();

    if (!isElevated && !isAssignee) {
      res.status(403).json({
        success: false,
        message: 'Permission denied: Only Team Lead, Admin, or the assigned user can edit this ticket',
      });
      return;
    }

    const { title, description, priority, deadline, assignedTo, type, status, labels, sprintId } =
      req.body;

    if (title) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (type) ticket.type = type;
    if (labels !== undefined && Array.isArray(labels)) {
      ticket.labels = labels.map((l: string) => l.trim().toLowerCase()).filter(Boolean);
    }
    if (sprintId !== undefined) {
      ticket.sprint = sprintId || null;
    }

    if (assignedTo && isElevated) {
      ticket.assignedTo = assignedTo;
    }
    if (priority && (isElevated || isAssignee)) {
      ticket.priority = priority;
    }
    if (deadline !== undefined && (isElevated || isAssignee)) {
      ticket.deadline = deadline ? new Date(deadline) : null;
    }
    if (status && VALID_STATUSES.includes(status) && (isElevated || isAssignee)) {
      if (ticket.status !== status) {
        ticket.activity.push({
          user: req.user._id,
          userName: req.user.name,
          action: 'STATUS_CHANGED',
          from: ticket.status,
          to: status,
          date: new Date(),
        });
        ticket.status = status;
      }
    }

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('assignedBy', 'name email role avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    res.json({ success: true, ticket: populatedTicket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    ticket.comments.push({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      text: text.trim(),
      createdAt: new Date(),
    });

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('assignedBy', 'name email role avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status');

    res.status(201).json({ success: true, ticket: populatedTicket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ticket (Admin and Team Lead only)
// @route   DELETE /api/tickets/:id
export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (!req.user || !['Project Admin', 'Team Lead'].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Permission denied: Only Project Admin and Team Lead can delete tickets',
      });
      return;
    }

    await Ticket.findByIdAndDelete(id);
    res.json({ success: true, message: 'Ticket deleted successfully', ticketId: ticket.ticketId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
