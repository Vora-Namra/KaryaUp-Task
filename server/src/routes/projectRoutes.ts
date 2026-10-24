import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addOrUpdateMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  validate,
  createProjectSchema,
  updateProjectSchema,
  updateProjectMemberSchema,
} from '../validators/schemas.js';

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, authorize('Project Admin'), validate(createProjectSchema), createProject);
router.put('/:id', protect, authorize('Project Admin'), validate(updateProjectSchema), updateProject);
router.post('/:id/members', protect, authorize('Project Admin'), validate(updateProjectMemberSchema), addOrUpdateMember);
router.delete('/:id/members/:userId', protect, authorize('Project Admin'), removeMember);

export default router;
