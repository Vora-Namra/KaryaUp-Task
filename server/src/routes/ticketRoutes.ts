import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  updateTicket,
  addComment,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, checkTicketStatusPermission } from '../middleware/roleMiddleware.js';
import {
  validate,
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  addCommentSchema,
} from '../validators/schemas.js';

const router = express.Router();

router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.post('/', protect, validate(createTicketSchema), createTicket);
router.patch(
  '/:id/status',
  protect,
  checkTicketStatusPermission,
  validate(updateTicketStatusSchema),
  updateTicketStatus
);
router.put('/:id', protect, validate(updateTicketSchema), updateTicket);
router.post('/:id/comments', protect, validate(addCommentSchema), addComment);
router.delete('/:id', protect, authorize('Project Admin', 'Team Lead'), deleteTicket);

export default router;
