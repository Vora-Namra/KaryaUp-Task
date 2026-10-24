import { Response } from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AuthRequest } from '../types/index.js';

// @desc    Get all projects
// @route   GET /api/projects
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({})
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');
    res.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new project with unique key
// @route   POST /api/projects
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, key, description, members } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const normalizedKey = key.toUpperCase().trim();
    const existing = await Project.findOne({ key: normalizedKey });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Project key '${normalizedKey}' already exists. Project keys must be unique.`,
      });
      return;
    }

    const initialMembers =
      members && members.length > 0
        ? members
        : [{ user: req.user._id, projectRole: 'Admin' }];

    const project = await Project.create({
      name,
      key: normalizedKey,
      description: description || '',
      createdBy: req.user._id,
      ticketCounter: 100,
      members: initialMembers,
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');

    res.status(201).json({ success: true, project: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project settings
// @route   PUT /api/projects/:id
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, settings } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (settings) {
      project.settings = { ...project.settings, ...settings };
    }

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');

    res.json({ success: true, project: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update member in project
// @route   POST /api/projects/:id/members
export const addOrUpdateMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, projectRole = 'Member' } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User to add not found' });
      return;
    }

    const existingIndex = project.members.findIndex(
      (m) => m.user.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      project.members[existingIndex].projectRole = projectRole;
    } else {
      project.members.push({ user: user._id, projectRole, joinedAt: new Date() });
    }

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');

    res.json({ success: true, project: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId.toString()
    );

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members.user', 'name email role avatar');

    res.json({ success: true, project: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
