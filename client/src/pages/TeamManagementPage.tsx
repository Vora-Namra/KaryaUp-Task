import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { User, ProjectRole, UserRole } from '../types';
import { userService } from '../services/api';
import { DummyEmailModal } from '../components/DummyEmailModal';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  Mail,
  UserCheck,
  X,
  Milestone,
  Send,
  Sparkles,
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    projects,
    selectedProject,
    sprints,
    refreshData,
    handleAddMember,
    handleRemoveMember,
    handleUpdateUser,
    handleDeleteUser,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'project_team' | 'platform_directory'>('project_team');

  // Add existing user to project state
  const [selectedExistingUserId, setSelectedExistingUserId] = useState('');
  const [selectedProjectRole, setSelectedProjectRole] = useState<ProjectRole>('Member');

  // Invite Employee Modal & Dummy Email state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [activeInvitation, setActiveInvitation] = useState<any>(null);
  const [activeInviteToken, setActiveInviteToken] = useState<string>('');
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Developer' as UserRole,
    sprintId: '',
    projectRole: 'Member' as ProjectRole,
    message: '',
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  // Edit User Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Developer' as UserRole,
    newPassword: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Search & filter for directory
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState('All');

  // Existing project member IDs
  const existingMemberIds = useMemo(() => {
    if (!selectedProject?.members) return new Set<string>();
    return new Set(
      selectedProject.members.map((m) =>
        typeof m.user === 'object' ? (m.user as any)._id : m.user
      )
    );
  }, [selectedProject]);

  // Platform users in DB who are NOT yet in this project
  const platformUsersNotInProject = useMemo(() => {
    return users.filter((u) => !existingMemberIds.has(u._id));
  }, [users, existingMemberIds]);

  // Filtered platform directory
  const filteredDirectoryUsers = useMemo(() => {
    return users.filter((u) => {
      if (directoryRoleFilter !== 'All' && u.role !== directoryRoleFilter) return false;
      if (directorySearch.trim()) {
        const q = directorySearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, directoryRoleFilter, directorySearch]);

  // Handle adding an existing employee to current project
  const handleAddExistingEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedExistingUserId) return;
    await handleAddMember(selectedProject._id, {
      userId: selectedExistingUserId,
      projectRole: selectedProjectRole,
    });
    setSelectedExistingUserId('');
  };

  // Handle inviting new employee to sprint (triggers dummy email pop-up)
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !selectedProject) return;
    try {
      setInviteSubmitting(true);
      const res = await userService.inviteEmployee({
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        projectId: selectedProject._id,
        projectRole: inviteForm.projectRole,
        sprintId: inviteForm.sprintId || (sprints.length > 0 ? sprints[0]._id : undefined),
        message: inviteForm.message.trim(),
      });

      if (res.data.success) {
        setInviteModalOpen(false);
        setActiveInvitation(res.data.invitation);
        setActiveInviteToken(res.data.inviteToken);
        setEmailModalOpen(true);
        setInviteForm({
          name: '',
          email: '',
          role: 'Developer',
          sprintId: '',
          projectRole: 'Member',
          message: '',
        });
        refreshData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispatch sprint invitation');
    } finally {
      setInviteSubmitting(false);
    }
  };

  // Open Edit User Modal
  const openEditUser = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      newPassword: '',
    });
    setEditModalOpen(true);
  };

  // Handle edit user submit
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setEditSubmitting(true);
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword.trim();
      }
      await handleUpdateUser(editingUser._id, payload);
      setEditModalOpen(false);
      setEditingUser(null);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUserClick = async (u: User) => {
    if (u._id === currentUser?._id) {
      alert('You cannot delete your own active Project Admin account.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${u.name}" (${u.email}) from the platform? This will also remove them from all projects.`
    );
    if (!confirmed) return;
    await handleDeleteUser(u._id);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Project Admin':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
      case 'Team Lead':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
      case 'Developer':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' };
      case 'QA':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' };
      default:
        return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Project Admin Access Only
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Team & User Management</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Add, update, and delete platform employees, or manage membership and roles in project{' '}
            <strong>{selectedProject?.name || 'KaryaUp'}</strong>.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setInviteModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Mail size={16} />
          <span>Invite New Employee to Sprint</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'project_team' ? 'active' : ''}`}
          onClick={() => setActiveTab('project_team')}
        >
          <Building size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Project Team ({selectedProject?.name || 'Active Project'}) &mdash;{' '}
          {selectedProject?.members?.length || 0} Members
        </button>
        <button
          className={`tab-btn ${activeTab === 'platform_directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('platform_directory')}
        >
          <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Platform Employee Directory ({users.length} in DB)
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PROJECT TEAM MEMBERSHIP (FOR SELECTED PROJECT)
          ========================================================================= */}
      {activeTab === 'project_team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card: Add Existing Employee to this Project */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--accent-primary)" />
              <span>Add Existing Platform Employee from Database</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Pick an employee already registered in the system/database and assign them to{' '}
              <strong>{selectedProject?.name}</strong>.
            </p>

            <form
              onSubmit={handleAddExistingEmployee}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <select
                className="form-select"
                style={{ flex: 1, minWidth: '240px' }}
                value={selectedExistingUserId}
                onChange={(e) => setSelectedExistingUserId(e.target.value)}
                required
              >
                <option value="">
                  {platformUsersNotInProject.length === 0
                    ? 'All platform employees are already members of this project'
                    : 'Select an employee from the database...'}
                </option>
                {platformUsersNotInProject.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) &mdash; {u.email}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: '160px' }}
                value={selectedProjectRole}
                onChange={(e) => setSelectedProjectRole(e.target.value as ProjectRole)}
              >
                <option value="Member">Role: Member</option>
                <option value="Admin">Role: Admin</option>
                <option value="Viewer">Role: Viewer</option>
              </select>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedExistingUserId}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserPlus size={15} />
                <span>Add to Project</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setInviteModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Mail size={15} />
                <span>+ Invite New Employee</span>
              </button>
            </form>
          </div>

          {/* Table of Members in this Project */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Current Members in {selectedProject?.name} ({selectedProject?.members?.length || 0})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Key: <strong>{selectedProject?.key}</strong>
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="karya-table" style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>System Role</th>
                    <th>Project Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!selectedProject?.members || selectedProject.members.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No members assigned to this project yet. Add members using the selector above.
                      </td>
                    </tr>
                  )}
                  {selectedProject?.members?.map((m: any) => {
                    const memberUser: User | null =
                      typeof m.user === 'object'
                        ? m.user
                        : users.find((u) => u._id === m.user) || null;

                    if (!memberUser) return null;

                    const roleColor = getRoleBadgeColor(memberUser.role);

                    return (
                      <tr key={memberUser._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: memberUser.avatar || 'var(--accent-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            >
                              {memberUser.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{memberUser.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{memberUser.email}</td>
                        <td>
                          <span
                            style={{
                              background: roleColor.bg,
                              color: roleColor.text,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {memberUser.role}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '120px' }}
                            value={m.projectRole}
                            onChange={(e) =>
                              handleAddMember(selectedProject._id, {
                                userId: memberUser._id,
                                projectRole: e.target.value as ProjectRole,
                              })
                            }
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="icon-btn"
                            title="Remove member from project"
                            onClick={() => handleRemoveMember(selectedProject._id, memberUser._id)}
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PLATFORM EMPLOYEE DIRECTORY (DATABASE CRUD)
          ========================================================================= */}
      {activeTab === 'platform_directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="search-input-wrap">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search employees by name or email..."
                  className="search-input"
                  style={{ width: '260px' }}
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={directoryRoleFilter}
                onChange={(e) => setDirectoryRoleFilter(e.target.value)}
              >
                <option value="All">All Roles ({users.length})</option>
                <option value="Project Admin">Project Admin</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
                <option value="QA">QA</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setInviteModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Mail size={15} />
              <span>Invite New Employee</span>
            </button>
          </div>

          {/* Table of All Platform Users */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="karya-table" style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Projects Assigned</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirectoryUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No employees found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDirectoryUsers.map((u) => {
                      const roleColor = getRoleBadgeColor(u.role);
                      const isSelf = u._id === currentUser?._id;

                      // Count how many projects this user is assigned to
                      const assignedProjects = projects.filter((p) =>
                        p.members?.some((m) => {
                          const mId = typeof m.user === 'object' ? (m.user as any)._id : m.user;
                          return mId === u._id;
                        })
                      );

                      return (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: u.avatar || 'var(--accent-primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600 }}>{u.name}</span>
                                {isSelf && (
                                  <span
                                    style={{
                                      marginLeft: '6px',
                                      fontSize: '0.7rem',
                                      color: 'var(--accent-primary)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td>
                            <span
                              style={{
                                background: roleColor.bg,
                                color: roleColor.text,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {assignedProjects.length === 0 ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                {assignedProjects.map((p) => (
                                  <span
                                    key={p._id}
                                    style={{
                                      background: 'var(--bg-tertiary)',
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {p.key}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                className="icon-btn"
                                title="Edit employee details"
                                onClick={() => openEditUser(u)}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className="icon-btn"
                                title={isSelf ? 'Cannot delete self' : 'Delete user from platform'}
                                disabled={isSelf}
                                onClick={() => handleDeleteUserClick(u)}
                                style={{
                                  color: isSelf ? 'var(--text-muted)' : '#EF4444',
                                  cursor: isSelf ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INVITE NEW EMPLOYEE (REQUIRED DETAILS FILLED BY ADMIN ONLY)
          ========================================================================= */}
      {inviteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={20} color="var(--accent-primary)" />
                <span>Invite New Employee to Sprint</span>
              </h2>
              <button className="icon-btn" onClick={() => setInviteModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                  }}
                >
                  <strong style={{ color: 'var(--accent-primary)' }}>Admin Workflow:</strong>{' '}
                  Fill the required invitation and sprint assignment details below. As soon as you send this, a{' '}
                  <strong>simulated email pop-up</strong> will be dispatched to the entered email address with an invitation to join the sprint. The employee will complete their own secure password, job title, phone, and skills.
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sarah Jenkins"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Email (for Sprint Invite) *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. sarah.jenkins@company.com"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Platform Role *</label>
                    <select
                      className="form-select"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                    >
                      <option value="Developer">Developer (Task execution & status updates)</option>
                      <option value="QA">QA (Testing & bug verification)</option>
                      <option value="Team Lead">Team Lead (Sprint planning & assignments)</option>
                      <option value="Project Admin">Project Admin (Full governance)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Role *</label>
                    <select
                      className="form-select"
                      value={inviteForm.projectRole}
                      onChange={(e) => setInviteForm({ ...inviteForm, projectRole: e.target.value as ProjectRole })}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Milestone size={14} color="#10B981" /> Target Sprint to Join *
                  </label>
                  <select
                    className="form-select"
                    value={inviteForm.sprintId}
                    onChange={(e) => setInviteForm({ ...inviteForm, sprintId: e.target.value })}
                  >
                    <option value="">
                      {sprints.length > 0
                        ? `Default Active Sprint (${sprints[0].name})`
                        : 'Current Project Backlog'}
                    </option>
                    {sprints.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.status}) {s.goal ? `— Goal: ${s.goal}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Personal Invitation Message (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Welcome to the team! Join this sprint and pick up your assigned tasks."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={inviteSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} />
                  <span>
                    {inviteSubmitting ? 'Sending Invitation...' : 'Send Sprint Invitation & Trigger Email'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* =========================================================================
          MODAL: EDIT EMPLOYEE (UPDATE DETAILS / ROLE / PASSWORD)
          ========================================================================= */}
      {editModalOpen && editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} color="var(--accent-primary)" />
                <span>Edit Employee: {editingUser.name}</span>
              </h2>
              <button className="icon-btn" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Platform Role *</label>
                  <select
                    className="form-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  >
                    <option value="Developer">Developer</option>
                    <option value="QA">QA</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Project Admin">Project Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reset Password (leave empty to keep current password)</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="New password (optional, min 6 characters)"
                    minLength={6}
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dummy Email Modal Pop-up */}
      <DummyEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        invitation={activeInvitation}
        inviteToken={activeInviteToken}
      />
    </div>
  );
};

export default TeamManagementPage;
