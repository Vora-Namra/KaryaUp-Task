import React, { useState, useEffect } from 'react';
import { Project, User, ProjectRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, Users, Settings, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';

interface ProjectSettingsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (id: string, data: { name?: string; description?: string }) => void;
  onAddMember: (id: string, data: { userId: string; projectRole: ProjectRole }) => void;
  onRemoveMember: (id: string, userId: string) => void;
  allUsers: User[];
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onAddMember,
  onRemoveMember,
  allUsers,
}) => {
  const { hasRole, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'members'>('members');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('Member');

  useEffect(() => {
    if (project) {
      setProjectName(project.name || '');
      setProjectDesc(project.description || '');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const canManage = hasRole('Project Admin', 'Team Lead');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject(project._id, {
      name: projectName,
      description: projectDesc,
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    onAddMember(project._id, {
      userId: selectedUserId,
      projectRole: selectedRole,
    });
    setSelectedUserId('');
  };

  const existingMemberIds = new Set(
    project.members?.map((m) => (typeof m.user === 'object' ? m.user._id : m.user)) || []
  );

  const availableUsersToAdd = allUsers.filter((u) => !existingMemberIds.has(u._id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="project-badge">{project.key}</span>
            <h2 className="modal-title">Project Settings & Members</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Selection */}
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <Users size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Members ({project.members?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={15} style={{ display: 'inline', marginRight: '6px' }} />
              General Settings
            </button>
          </div>

          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Add Member Form (Admin only) */}
              {canManage && (
                <form
                  onSubmit={handleAddMemberSubmit}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    background: 'var(--bg-tertiary)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <select
                    className="form-select"
                    style={{ flex: 1, minWidth: '180px' }}
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user to add...</option>
                    {availableUsersToAdd.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role}) - {u.email}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    style={{ width: '130px' }}
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
                    style={{ padding: '0.5rem 0.85rem' }}
                  >
                    <UserPlus size={15} />
                    <span>Add Member</span>
                  </button>
                </form>
              )}

              {/* Members List */}
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
                    {(!project.members || project.members.length === 0) ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No members in this project.
                        </td>
                      </tr>
                    ) : (
                      project.members.map((member) => {
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
                                      onAddMember(project._id, {
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
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      color: 'var(--priority-urgent)',
                                    }}
                                    title="Remove from project"
                                    onClick={() => onRemoveMember(project._id, memberUser._id)}
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
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <label className="form-label">Project Key (Unique)</label>
                <input
                  type="text"
                  disabled
                  className="form-input"
                  value={project.key}
                  style={{ opacity: 0.7, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  disabled={!canManage}
                />
              </div>

              {canManage && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary">
                    <CheckCircle2 size={16} />
                    <span>Save Project Settings</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
