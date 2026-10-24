import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import {
  Layers,
  Plus,
  Sun,
  Moon,
  Shield,
  Briefcase,
  Code2,
  CheckCircle,
  LogIn,
  LogOut,
  Settings,
  FolderPlus,
} from 'lucide-react';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  onOpenCreateTicket: () => void;
  onOpenAuthModal: () => void;
  onOpenProjectSettings: () => void;
  onOpenCreateProject: () => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  onOpenCreateTicket,
  onOpenAuthModal,
  onOpenProjectSettings,
  onOpenCreateProject,
  projects,
  selectedProject,
  onSelectProject,
}) => {
  const { user, demoUsers, switchDemoUser, logout, hasRole } = useAuth();
  const canManageProject = hasRole('Project Admin', 'Team Lead');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Project Admin':
        return <Shield size={14} />;
      case 'Team Lead':
        return <Briefcase size={14} />;
      case 'Developer':
        return <Code2 size={14} />;
      case 'QA':
        return <CheckCircle size={14} />;
      default:
        return null;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand">
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <span>KaryaUp</span>
        </div>

        {/* Project Selector & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            className="filter-select"
            style={{
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
            }}
            value={selectedProject?._id || ''}
            onChange={(e) => {
              const proj = projects.find((p) => p._id === e.target.value);
              if (proj) onSelectProject(proj);
            }}
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          {canManageProject && (
            <>
              <button
                className="icon-btn"
                title="Project Settings & Members"
                onClick={onOpenProjectSettings}
                style={{ width: '32px', height: '32px' }}
              >
                <Settings size={15} />
              </button>

              <button
                className="icon-btn"
                title="Create New Project"
                onClick={onOpenCreateProject}
                style={{ width: '32px', height: '32px' }}
              >
                <FolderPlus size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="nav-right">
        {/* Quick Demo Switcher for 1-Click Role Testing */}
        <div className="role-switcher" title="Instant Role Switcher for Testing Permissions">
          {demoUsers.map((demo) => {
            const isActive = user?.email === demo.email;
            return (
              <button
                key={demo._id}
                className={`role-switch-btn ${isActive ? 'active' : ''}`}
                onClick={() => switchDemoUser(demo)}
                title={`Switch to ${demo.name} (${demo.role})`}
              >
                {getRoleIcon(demo.role)}
                <span>{demo.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.675rem', opacity: 0.8 }}>({demo.role})</span>
              </button>
            );
          })}
        </div>

        {/* Create Ticket Button */}
        <button className="btn-primary" onClick={onOpenCreateTicket}>
          <Plus size={16} />
          <span>Create Issue</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User Profile / Auth state */}
        {user ? (
          <div className="user-profile-badge">
            <div
              className="avatar-circle"
              style={{
                backgroundColor:
                  user.role === 'Project Admin'
                    ? '#6366F1'
                    : user.role === 'Team Lead'
                    ? '#0EA5E9'
                    : user.role === 'Developer'
                    ? '#10B981'
                    : '#F59E0B',
              }}
            >
              {getInitials(user.name)}
            </div>
            <div className="user-name-role">
              <span className="user-name-text">{user.name}</span>
              <span className="user-role-text">{user.role}</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                marginLeft: '4px',
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={onOpenAuthModal}>
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
