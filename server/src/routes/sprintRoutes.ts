import express from 'express';
import {
  getSprints,
  createSprint,
  updateSprint,
  assignTicketToSprint,
  deleteSprint,
} from '../controllers/sprintController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validate,
  createSprintSchema,
  updateSprintSchema,
  assignTicketToSprintSchema,
} from '../validators/schemas.js';

const router = express.Router();

router.get('/', protect, getSprints);
router.post('/', protect, validate(createSprintSchema), createSprint);
router.put('/:id', protect, validate(updateSprintSchema), updateSprint);
router.patch('/:id/tickets', protect, validate(assignTicketToSprintSchema), assignTicketToSprint);
router.delete('/:id', protect, deleteSprint);

export default router;
