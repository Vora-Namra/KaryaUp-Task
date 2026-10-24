import { Response, NextFunction } from 'express';
import Ticket from '../models/Ticket.js';
import { AuthRequest, UserRole } from '../types/index.js';

/**
 * Checks if current user possesses one of the allowed global roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'Guest'}' is not authorized. Required: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
};

/**
 * Checks if the user is authorized to update the status of a specific ticket.
 * Rules:
 * 1. Project Admin and Team Lead can change any ticket status.
 * 2. Assigned user (Developer or QA) can update their assigned ticket.
 * 3. QA role can review/verify tickets in 'In Review', 'Done', 'Solved', or 'To Do'.
 */
export const checkTicketStatusPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const isElevated = (['Project Admin', 'Team Lead'] as UserRole[]).includes(req.user.role);
    const isAssignee = ticket.assignedTo.toString() === req.user._id.toString();
    const isQAOnReview =
      req.user.role === 'QA' &&
      ['In Review', 'Done', 'Solved', 'To Do'].includes(ticket.status);

    if (isElevated || isAssignee || isQAOnReview) {
      req.ticket = ticket;
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Permission Denied: You can only update the status of tickets assigned to you, or you must be a Team Lead / Project Admin. (Currently assigned to user ID: ${ticket.assignedTo})`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
