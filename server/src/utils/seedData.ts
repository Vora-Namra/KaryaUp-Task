import User from '../models/User.js';
import Project from '../models/Project.js';
import Ticket from '../models/Ticket.js';
import Sprint from '../models/Sprint.js';

export const seedInitialData = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Ensure Sprint 1 exists if users are already present
      const sprintCount = await Sprint.countDocuments();
      if (sprintCount === 0) {
        const project = await Project.findOne();
        const admin = await User.findOne({ role: 'Project Admin' });
        if (project && admin) {
          const now = new Date();
          const sprint = await Sprint.create({
            name: 'Sprint 1 - Core Delivery',
            goal: 'Deliver authentication, role-based workflows, Kanban board, and Sprint management.',
            project: project._id,
            startDate: now,
            endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            status: 'Active',
            createdBy: admin._id,
          });
          await Ticket.updateMany({ project: project._id }, { $set: { sprint: sprint._id } });
        }
      }
      return;
    }

    console.log('[Seed] Seeding initial users, project, sprints, and tickets...');

    // 1. Create Users for all 4 roles
    const users = await User.create([
      {
        name: 'John Admin',
        email: 'admin@karyaup.com',
        password: 'Password123!',
        role: 'Project Admin',
        avatar: '#6366F1',
      },
      {
        name: 'Sarah Lead',
        email: 'lead@karyaup.com',
        password: 'Password123!',
        role: 'Team Lead',
        avatar: '#0EA5E9',
      },
      {
        name: 'Alex Developer',
        email: 'dev@karyaup.com',
        password: 'Password123!',
        role: 'Developer',
        avatar: '#10B981',
      },
      {
        name: 'Emma QA',
        email: 'qa@karyaup.com',
        password: 'Password123!',
        role: 'QA',
        avatar: '#F59E0B',
      },
    ]);
    const admin = users[0];
    const lead = users[1];
    const dev = users[2];
    const qa = users[3];

    // 2. Create Project with project roles
    const project = await Project.create({
      name: 'KaryaUp Platform',
      key: 'KUP',
      description: 'Enterprise Jira-like Project & Task Management Suite for high-performing engineering teams.',
      createdBy: admin._id,
      ticketCounter: 108,
      members: [
        { user: admin._id, projectRole: 'Admin' },
        { user: lead._id, projectRole: 'Admin' },
        { user: dev._id, projectRole: 'Member' },
        { user: qa._id, projectRole: 'Member' },
      ],
      settings: {
        allowViewerComments: true,
        lead: lead._id,
      },
    });

    const now = new Date();
    const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    // 3. Create Sprints
    const sprint1 = await Sprint.create({
      name: 'Sprint 1 - Foundations & Core Workflow',
      goal: 'Deliver JWT Authentication, RBAC, Sprint Management & Jira Kanban Board.',
      project: project._id,
      startDate: now,
      endDate: addDays(14),
      status: 'Active',
      createdBy: lead._id,
    });

    await Sprint.create({
      name: 'Sprint 2 - Quality, Analytics & Reports',
      goal: 'Automate regression test matrix, cross-browser compatibility, and multi-project analytics.',
      project: project._id,
      startDate: addDays(15),
      endDate: addDays(28),
      status: 'Planning',
      createdBy: lead._id,
    });

    // 4. Create Tickets with labels and sprint assignments
    const sampleTickets = [
      {
        ticketId: 'KUP-101',
        title: 'Architect JWT Auth with Role-Based Access Control',
        description: 'Implement secure JWT token verification, role enforcement (Admin, Team Lead, Developer, QA), and automatic session persistence.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['auth', 'security', 'backend'],
        type: 'Story',
        priority: 'High',
        status: 'Done',
        deadline: addDays(2),
        assignedBy: lead._id,
        assignedTo: dev._id,
        comments: [
          {
            user: dev._id,
            userName: dev.name,
            userRole: dev.role,
            text: 'Completed JWT generation and middleware verification. Verified token expiration handle.',
            createdAt: new Date(now.getTime() - 86400000),
          },
          {
            user: qa._id,
            userName: qa.name,
            userRole: qa.role,
            text: 'All endpoints pass RBAC security test matrix.',
            createdAt: now,
          },
        ],
        activity: [
          {
            user: lead._id,
            userName: lead.name,
            action: 'CREATED',
            from: '',
            to: 'To Do',
            date: new Date(now.getTime() - 172800000),
          },
          {
            user: dev._id,
            userName: dev.name,
            action: 'STATUS_CHANGED',
            from: 'To Do',
            to: 'In Progress',
            date: new Date(now.getTime() - 120000000),
          },
          {
            user: dev._id,
            userName: dev.name,
            action: 'STATUS_CHANGED',
            from: 'In Progress',
            to: 'Done',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-102',
        title: 'Interactive Kanban Board with Drag-and-Drop & Instant Status Updates',
        description: 'Provide an intuitive Jira-style Kanban board allowing users to drag cards between status columns and trigger backend status updates.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['frontend', 'ui', 'kanban'],
        type: 'Task',
        priority: 'Urgent',
        status: 'In Progress',
        deadline: addDays(1),
        assignedBy: lead._id,
        assignedTo: dev._id,
        comments: [
          {
            user: dev._id,
            userName: dev.name,
            userRole: dev.role,
            text: 'Working on drag event handlers and fallback dropdown selectors on cards for mobile screens.',
            createdAt: now,
          },
        ],
        activity: [
          {
            user: lead._id,
            userName: lead.name,
            action: 'CREATED',
            from: '',
            to: 'To Do',
            date: new Date(now.getTime() - 86400000),
          },
          {
            user: dev._id,
            userName: dev.name,
            action: 'STATUS_CHANGED',
            from: 'To Do',
            to: 'In Progress',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-103',
        title: 'Assigned User Status Update Permission Enforcement',
        description: 'Ensure that only the assigned user, Team Lead, or Project Admin can change ticket status, preventing unauthorized modifications.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['security', 'workflow', 'rbac'],
        type: 'Task',
        priority: 'High',
        status: 'In Review',
        deadline: addDays(3),
        assignedBy: lead._id,
        assignedTo: dev._id,
        comments: [
          {
            user: dev._id,
            userName: dev.name,
            userRole: dev.role,
            text: 'Middleware checkTicketStatusPermission in place. Ready for QA validation.',
            createdAt: now,
          },
        ],
        activity: [
          {
            user: dev._id,
            userName: dev.name,
            action: 'STATUS_CHANGED',
            from: 'In Progress',
            to: 'In Review',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-104',
        title: 'Cross-browser Regression & Responsiveness Testing',
        description: 'Conduct comprehensive QA test suite on Chromium, Firefox, WebKit, and mobile viewports.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['qa', 'testing', 'cross-browser'],
        type: 'Task',
        priority: 'Medium',
        status: 'To Do',
        deadline: addDays(4),
        assignedBy: lead._id,
        assignedTo: qa._id,
        comments: [],
        activity: [
          {
            user: lead._id,
            userName: lead.name,
            action: 'CREATED',
            from: '',
            to: 'To Do',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-105',
        title: 'Fix edge case with ticket ID counter race condition',
        description: 'Address ticket collision when multiple tickets are created in parallel under high concurrency.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['bug', 'backend', 'concurrency'],
        type: 'Bug',
        priority: 'Urgent',
        status: 'To Do',
        deadline: addDays(1),
        assignedBy: lead._id,
        assignedTo: dev._id,
        comments: [],
        activity: [
          {
            user: lead._id,
            userName: lead.name,
            action: 'CREATED',
            from: '',
            to: 'To Do',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-106',
        title: 'Sprint Management & Backlog Planning Interface',
        description: 'Allow creating sprints, starting sprints, assigning tasks from backlog, and tracking sprint burn rate.',
        project: project._id,
        sprint: sprint1._id,
        labels: ['scrum', 'sprint', 'feature'],
        type: 'Story',
        priority: 'High',
        status: 'In Progress',
        deadline: addDays(5),
        assignedBy: admin._id,
        assignedTo: dev._id,
        comments: [
          {
            user: dev._id,
            userName: dev.name,
            userRole: dev.role,
            text: 'Added sprint model, backlog view, and drag & drop sprint allocator.',
            createdAt: now,
          },
        ],
        activity: [
          {
            user: dev._id,
            userName: dev.name,
            action: 'STATUS_CHANGED',
            from: 'To Do',
            to: 'In Progress',
            date: now,
          },
        ],
      },
      {
        ticketId: 'KUP-107',
        title: 'API Rate Limiting & Input Validation Hardening with Zod',
        description: 'Add express rate limiter and sanitize all incoming payload parameters to protect endpoints with schema validation.',
        project: project._id,
        sprint: null,
        labels: ['security', 'validation', 'zod'],
        type: 'Task',
        priority: 'Low',
        status: 'Backlog',
        deadline: addDays(7),
        assignedBy: admin._id,
        assignedTo: dev._id,
        comments: [],
        activity: [],
      },
      {
        ticketId: 'KUP-108',
        title: 'Project Member Management & Role Delegation',
        description: 'Enable Admins to invite members, assign Admin/Member/Viewer project roles, and configure project settings.',
        project: project._id,
        sprint: null,
        labels: ['admin', 'permissions', 'team'],
        type: 'Story',
        priority: 'Medium',
        status: 'Backlog',
        deadline: addDays(10),
        assignedBy: lead._id,
        assignedTo: dev._id,
        comments: [],
        activity: [],
      },
    ];

    await Ticket.insertMany(sampleTickets);
    console.log('[Seed] Seeding completed successfully! 4 users, 1 project, 2 sprints, 8 tickets created.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

export default seedInitialData;
