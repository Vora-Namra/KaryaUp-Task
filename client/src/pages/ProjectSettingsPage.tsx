import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { ProjectRole } from '../types';
import { Users, Settings, UserPlus, Trash2, CheckCircle2, Shield, ExternalLink } from 'lucide-react';

export const ProjectSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, user: currentUser } = useAuth();
  const {
    selectedProject,
    users: allUsers,
    handleUpdateProject,
    handleAddMember,
    handleRemoveMember,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [projectName, setProjectName] = useState(selectedProject?.name || '');
  const [projectDesc, setProjectDesc] = useState(selectedProject?.description || '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('Member');

  if (!selectedProject) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No project selected.
      </div>
    );
  }

  // Only Project Admin has permission to add, update, and delete members/users
  const canManage = hasRole('Project Admin');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateProject(selectedProject._id, {
      name: projectName,
      description: projectDesc,
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    handleAddMember(selectedProject._id, {
      userId: selectedUserId,
      projectRole: selectedRole,
    });
    setSelectedUserId('');
  };

  const existingMemberIds = new Set(
    selectedProject.members?.map((m) => (typeof m.user === 'object' ? m.user._id : m.user)) || []
  );

  const availableUsersToAdd = allUsers.filter((u) => !existingMemberIds.has(u._id));

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="project-badge">{selectedProject.key}</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedProject.name} Settings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage project membership, access roles (Admin / Member / Viewer), and general metadata
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Team Members ({selectedProject.members?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} style={{ display: 'inline', marginRight: '6px' }} />
          General Settings
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {canManage ? (
            <form
              onSubmit={handleAddMemberSubmit}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <select
                className="form-select"
                style={{ flex: 1, minWidth: '200px' }}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select an employee from the database to add...</option>
                {availableUsersToAdd.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: '140px' }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>

              <button
                type="submit"
                className="btn-primary"
                disabled={!selectedUserId}
                style={{ padding: '0.5rem 1rem' }}
              >
                <UserPlus size={16} />
                <span>Add Member</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/team')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
              >
                <ExternalLink size={15} />
                <span>Full User Directory</span>
              </button>
            </form>
          ) : (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                color: '#EF4444',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Shield size={16} />
              <span>
                Read-Only: Only users with the <strong>Project Admin</strong> role can add, update roles, or delete project members.
              </span>
            </div>
          )}

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <table className="karya-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>System Role</th>
                  <th>Project Role</th>
                  {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {!selectedProject.members || selectedProject.members.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No members assigned to this project yet.
                    </td>
                  </tr>
                ) : (
                  selectedProject.members.map((member) => {
                    const memberUser = typeof member.user === 'object' ? member.user : null;
                    const isSelf = memberUser?._id === currentUser?._id;

                    return (
                      <tr key={memberUser?._id || Math.random()}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{memberUser?.name || 'User'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {memberUser?.email}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {memberUser?.role}
                          </span>
                        </td>
                        <td>
                          {canManage ? (
                            <select
                              className="quick-status-select"
                              value={member.projectRole}
                              onChange={(e) => {
                                if (memberUser) {
                                  handleAddMember(selectedProject._id, {
                                    userId: memberUser._id,
                                    projectRole: e.target.value as ProjectRole,
                                  });
                                }
                              }}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Member">Member</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--brand-accent)',
                              }}
                            >
                              {member.projectRole}
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td style={{ textAlign: 'right' }}>
                            {!isSelf && memberUser && (
                              <button
                                className="icon-btn"
                                style={{ width: '28px', height: '28px', color: 'var(--priority-urgent)' }}
                                title="Remove from project"
                                onClick={() => handleRemoveMember(selectedProject._id, memberUser._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={!canManage}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Key (Unique Ticket Prefix)</label>
            <input
              type="text"
              disabled
              className="form-input"
              value={selectedProject.key}
              style={{ opacity: 0.7, fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              className="form-textarea"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              disabled={!canManage}
            />
          </div>

          {canManage && (
            <div>
              <button type="submit" className="btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Project Settings</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default ProjectSettingsPage;
