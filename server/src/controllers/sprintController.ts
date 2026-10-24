import { Response } from 'express';
import Sprint from '../models/Sprint.js';
import Ticket from '../models/Ticket.js';
import Project from '../models/Project.js';
import { AuthRequest } from '../types/index.js';

// @desc    Get all sprints for a project
// @route   GET /api/sprints
export const getSprints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const query: any = {};
    if (projectId) {
      query.project = projectId;
    }

    const sprints = await Sprint.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const sprintsWithMetrics = await Promise.all(
      sprints.map(async (sprint) => {
        const tickets = await Ticket.find({ sprint: sprint._id }).select('status priority');
        const totalTickets = tickets.length;
        const doneTickets = tickets.filter(
          (t) => t.status === 'Done' || t.status === 'Solved' || t.status === 'Closed'
        ).length;
        const inProgressTickets = tickets.filter((t) => t.status === 'In Progress').length;
        const todoTickets = tickets.filter((t) => t.status === 'To Do').length;

        return {
          ...sprint.toObject(),
          totalTickets,
          doneTickets,
          inProgressTickets,
          todoTickets,
          progressPercent: totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0,
        };
      })
    );

    res.json({ success: true, count: sprintsWithMetrics.length, sprints: sprintsWithMetrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new sprint
// @route   POST /api/sprints
export const createSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, goal, projectId, startDate, endDate } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const sprint = await Sprint.create({
      name,
      goal: goal || '',
      project: project._id,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: 'Planning',
      createdBy: req.user._id,
    });

    const populated = await Sprint.findById(sprint._id).populate('createdBy', 'name email role');
    res.status(201).json({
      success: true,
      sprint: {
        ...populated?.toObject(),
        totalTickets: 0,
        doneTickets: 0,
        progressPercent: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sprint (dates, goal, status)
// @route   PUT /api/sprints/:id
export const updateSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, status } = req.body;

    const sprint = await Sprint.findById(id);
    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }

    if (name) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (startDate) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;

    if (status && ['Planning', 'Active', 'Completed'].includes(status)) {
      if (status === 'Active' && sprint.status !== 'Active') {
        const activeSprint = await Sprint.findOne({
          project: sprint.project,
          status: 'Active',
          _id: { $ne: sprint._id },
        });
        if (activeSprint) {
          res.status(400).json({
            success: false,
            message: `Sprint '${activeSprint.name}' is already active. Please complete it before starting a new sprint.`,
          });
          return;
        }
      }
      sprint.status = status;
    }

    await sprint.save();

    const populated = await Sprint.findById(sprint._id).populate('createdBy', 'name email role');
    res.json({ success: true, sprint: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Move ticket into or out of sprint
// @route   PATCH /api/sprints/:id/tickets
export const assignTicketToSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (id === 'backlog' || id === 'null') {
      ticket.sprint = null;
    } else {
      const sprint = await Sprint.findById(id);
      if (!sprint) {
        res.status(404).json({ success: false, message: 'Sprint not found' });
        return;
      }
      ticket.sprint = sprint._id;
      if (ticket.status === 'Backlog') {
        ticket.status = 'To Do';
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

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
export const deleteSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findById(id);
    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }

    // Move tickets back to backlog
    await Ticket.updateMany({ sprint: sprint._id }, { $set: { sprint: null } });
    await Sprint.findByIdAndDelete(id);

    res.json({ success: true, message: 'Sprint deleted; issues returned to backlog' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
