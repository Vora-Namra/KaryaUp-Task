import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Sprint from '../models/Sprint.js';
import { AuthRequest } from '../types/index.js';
import { generateToken } from './authController.js';

// @desc    Get all active users for ticket assignment & member select
// @route   GET /api/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ isInvited: { $ne: true } })
      .select('-password')
      .sort({ name: 1 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new employee/user on platform (Project Admin only)
// @route   POST /api/users
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'Developer', projectId, projectRole = 'Member' } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists on the platform' });
      return;
    }

    const defaultColors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const randomAvatar = defaultColors[Math.floor(Math.random() * defaultColors.length)];

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      avatar: randomAvatar,
      isInvited: false,
    });

    // If projectId was passed, automatically attach employee as member to the project
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        project.members.push({
          user: user._id,
          projectRole,
          joinedAt: new Date(),
        });
        await project.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `Employee "${user.name}" created successfully on platform`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite employee to sprint with admin-provided details and return dummy email invitation payload
// @route   POST /api/users/invite
export const inviteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role = 'Developer', projectId, projectRole = 'Member', sprintId, message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Selected project not found' });
      return;
    }

    let sprint = null;
    if (sprintId && sprintId !== 'backlog') {
      sprint = await Sprint.findById(sprintId);
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && !existing.isInvited) {
      res.status(400).json({
        success: false,
        message: `Employee "${existing.name}" (${existing.email}) is already an active platform user. You can add them directly to this project from the existing employees dropdown.`,
      });
      return;
    }

    const defaultColors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const randomAvatar = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const tempPassword = crypto.randomBytes(12).toString('hex');

    let user;
    if (existing && existing.isInvited) {
      existing.name = name;
      existing.role = role;
      existing.inviteToken = inviteToken;
      existing.inviteProject = project._id;
      existing.inviteSprint = sprint ? sprint._id : undefined;
      existing.inviteProjectRole = projectRole;
      existing.inviteMessage = message || '';
      user = await existing.save();
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: tempPassword,
        role,
        avatar: randomAvatar,
        isInvited: true,
        inviteToken,
        inviteProject: project._id,
        inviteSprint: sprint ? sprint._id : undefined,
        inviteProjectRole: projectRole,
        inviteMessage: message || '',
      });
    }

    res.status(201).json({
      success: true,
      message: `Invitation generated for ${user.email} to join sprint and project`,
      inviteToken,
      inviteUrl: `/accept-invite?token=${inviteToken}`,
      invitation: {
        invitedUser: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        project: {
          _id: project._id,
          name: project.name,
          key: project.key,
        },
        sprint: sprint
          ? {
              _id: sprint._id,
              name: sprint.name,
              status: sprint.status,
              goal: sprint.goal,
            }
          : null,
        projectRole,
        invitedBy: {
          name: req.user?.name || 'Project Admin',
          email: req.user?.email || 'admin@karyaup.com',
          role: req.user?.role || 'Project Admin',
        },
        message:
          message ||
          `You've been invited to join ${sprint ? `"${sprint.name}"` : 'the active sprint'} in project "${project.name}" on KaryaUp. Click the button below to complete your profile details and start collaborating.`,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invitation details by token (public endpoint)
// @route   GET /api/users/invite/:token
export const getInviteDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ inviteToken: token, isInvited: true })
      .populate('inviteProject', 'name key description')
      .populate('inviteSprint', 'name status goal startDate endDate');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'This invitation link is invalid, expired, or has already been accepted.',
      });
      return;
    }

    res.json({
      success: true,
      invite: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        project: user.inviteProject,
        sprint: user.inviteSprint,
        projectRole: user.inviteProjectRole || 'Member',
        message: user.inviteMessage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept invite & complete remaining user details (password, title, department, phone, skills, bio)
// @route   POST /api/users/accept-invite
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, title, department, phone, skills, bio } = req.body;

    const user = await User.findOne({ inviteToken: token, isInvited: true });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation token. Please request a new invite from your Project Admin.',
      });
      return;
    }

    // Set remaining details entered by the user
    user.password = password; // pre('save') will hash it
    user.title = title;
    user.department = department;
    user.phone = phone;
    user.skills = skills || [];
    user.bio = bio || '';
    user.isInvited = false;
    user.inviteToken = null;

    await user.save();

    // Attach user as member of project if not already present
    if (user.inviteProject) {
      const project = await Project.findById(user.inviteProject);
      if (project) {
        const isMember = project.members.some(
          (m) => m.user.toString() === user._id.toString()
        );
        if (!isMember) {
          project.members.push({
            user: user._id,
            projectRole: user.inviteProjectRole || 'Member',
            joinedAt: new Date(),
          });
          await project.save();
        }
      }
    }

    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome to KaryaUp, ${user.name}! Your profile is fully activated and you are ready to collaborate.`,
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        department: user.department,
        skills: user.skills,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee/user details (Project Admin only)
// @route   PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, role, title, department, phone, skills, bio } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(400).json({ success: false, message: 'Email is already taken by another user' });
        return;
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (title !== undefined) user.title = title;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (skills !== undefined) user.skills = skills;
    if (bio !== undefined) user.bio = bio;
    if (password) user.password = password; // pre('save') hashes it

    await user.save();

    res.json({
      success: true,
      message: `User "${user.name}" updated successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        department: user.department,
        skills: user.skills,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user from platform (Project Admin only)
// @route   DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent Project Admin from self-deleting active account
    if (req.user?._id?.toString() === id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot delete your own active Project Admin account' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await User.findByIdAndDelete(id);

    // Remove deleted user from all projects
    await Project.updateMany({}, { $pull: { members: { user: id } } });

    res.json({
      success: true,
      message: `User "${user.name}" deleted from platform and removed from all projects`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
