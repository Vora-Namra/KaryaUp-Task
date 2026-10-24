import express from 'express';
import {
  getUsers,
  createUser,
  inviteEmployee,
  getInviteDetails,
  acceptInvite,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validate,
  createUserSchema,
  updateUserSchema,
  inviteEmployeeSchema,
  acceptInviteSchema,
} from '../validators/schemas.js';

const router = express.Router();

// Public routes for accepting sprint invitation and completing user profile
router.get('/invite/:token', getInviteDetails);
router.post('/accept-invite', validate(acceptInviteSchema), acceptInvite);

// GET all active users (accessible by authenticated users for assignee/membership pickers)
router.get('/', protect, getUsers);

// Invite new employee to sprint (Project Admin only, fills required details & triggers dummy email popup)
router.post(
  '/invite',
  protect,
  authorize('Project Admin'),
  validate(inviteEmployeeSchema),
  inviteEmployee
);

// User CRUD operations - strictly restricted to Project Admin only
router.post('/', protect, authorize('Project Admin'), validate(createUserSchema), createUser);
router.put('/:id', protect, authorize('Project Admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', protect, authorize('Project Admin'), deleteUser);

export default router;
