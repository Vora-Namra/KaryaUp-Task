import express from 'express';
import { register, login, getMe, getDemoUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, registerSchema, loginSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoUsers);

export default router;
