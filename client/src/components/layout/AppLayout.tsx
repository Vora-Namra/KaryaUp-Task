import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Navbar } from '../Navbar';
import { TicketModal } from '../TicketModal';
import { TicketDetailModal } from '../TicketDetailModal';
import { CreateSprintModal } from '../CreateSprintModal';
import { CreateProjectModal } from '../CreateProjectModal';
import { ProjectSettingsModal } from '../ProjectSettingsModal';
import { Toast } from '../Toast';
import {
  Kanban,
  Table as TableIcon,
  BarChart3,
  Search,
  UserCheck,
  Flame,
  Clock,
  RefreshCw,
  Milestone,
  Settings,
  Activity,
  Users,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    filteredTickets,
    projects,
    selectedProject,
    setSelectedProject,
    sprints,
    users,
    allLabels,
    loading,
    refreshData,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    assigneeFilter,
    setAssigneeFilter,
    labelFilter,
    setLabelFilter,
    quickTab,
    setQuickTab,
    handleStatusChange,
    handleCreateTicket,
    handleUpdateDetails,
    handleAddComment,
    handleDeleteTicket,
    handleCreateSprint,
    handleCreateProject,
    handleUpdateProject,
    handleAddMember,
    handleRemoveMember,
    selectedTicket,
    setSelectedTicket,
    detailModalOpen,
    setDetailModalOpen,
    createTicketOpen,
    setCreateTicketOpen,
    createSprintOpen,
    setCreateSprintOpen,
    createProjectOpen,
    setCreateProjectOpen,
    projectSettingsOpen,
    setProjectSettingsOpen,
    toasts,
    removeToast,
  } = useProject();

  const [theme, setTheme] = useState<string>(localStorage.getItem('karyaup_theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('karyaup_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getRoleDescription = (role?: string) => {
    switch (role) {
      case 'Project Admin':
        return 'Full project governance: Manage team, configure projects, reassign tasks, and edit any ticket.';
      case 'Team Lead':
        return 'Sprint & task assignment: Assign tickets to developers & QA, prioritize backlog, and manage delivery.';
      case 'Developer':
        return 'Task execution: You can update the status of tickets assigned to you (To Do ➔ In Progress ➔ Done) and log comments.';
      case 'QA':
        return 'Quality assurance: Verify tickets in review/done, report bugs, and validate issue resolutions.';
      default:
        return 'Authenticated User';
    }
  };

  const currentPath = location.pathname;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenCreateTicket={() => setCreateTicketOpen(true)}
        onOpenAuthModal={() => {}}
        onOpenProjectSettings={() => setProjectSettingsOpen(true)}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />

      {/* Role Permission Context Banner */}
      <div className="role-permission-banner">
        <div className="role-permission-left">
          <span className="role-tag">{user?.role || 'Guest'}</span>
          <span>
            Logged in as <strong>{user?.name || 'Guest'}</strong> &mdash;{' '}
            {getRoleDescription(user?.role)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="icon-btn"
            onClick={refreshData}
            title="Refresh tickets and sprints"
            style={{ width: '28px', height: '28px' }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Toolbar: Views & Filters */}
        <div className="toolbar">
          <div className="toolbar-left">
            {/* Multi-Page View Navigation Buttons */}
            <div className="view-selector">
              <button
                className={`view-btn ${currentPath === '/board' || currentPath === '/' ? 'active' : ''}`}
                onClick={() => navigate('/board')}
              >
                <Kanban size={15} />
                <span>Kanban Board</span>
              </button>
              <button
                className={`view-btn ${currentPath === '/sprints' ? 'active' : ''}`}
                onClick={() => navigate('/sprints')}
              >
                <Milestone size={15} />
                <span>Sprints & Backlog</span>
              </button>
              <button
                className={`view-btn ${currentPath === '/issues' ? 'active' : ''}`}
                onClick={() => navigate('/issues')}
              >
                <TableIcon size={15} />
                <span>List / Table</span>
              </button>
              <button
                className={`view-btn ${currentPath === '/metrics' ? 'active' : ''}`}
                onClick={() => navigate('/metrics')}
              >
                <BarChart3 size={15} />
                <span>Metrics & Workload</span>
              </button>
              <button
                className={`view-btn ${currentPath === '/settings' ? 'active' : ''}`}
                onClick={() => navigate('/settings')}
              >
                <Settings size={15} />
                <span>Project Settings</span>
              </button>
              {/* Only visible to Project Admin */}
              {user?.role === 'Project Admin' && (
                <button
                  className={`view-btn ${currentPath === '/team' ? 'active' : ''}`}
                  onClick={() => navigate('/team')}
                  title="Project Admin Only: Manage users and project membership"
                  style={{
                    border: currentPath === '/team' ? '1px solid #EF4444' : undefined,
                    color: currentPath === '/team' ? '#EF4444' : undefined,
                  }}
                >
                  <Users size={15} color="#EF4444" />
                  <span>Team & Users</span>
                </button>
              )}
              <button
                className={`view-btn ${currentPath === '/system-status' ? 'active' : ''}`}
                onClick={() => navigate('/system-status')}
              >
                <Activity size={15} />
                <span>Diagnostics & Status</span>
              </button>
            </div>

            {/* Quick Filter Chips */}
            <button
              className={`filter-chip-btn ${quickTab === 'all' ? 'active' : ''}`}
              onClick={() => setQuickTab('all')}
            >
              All Issues ({filteredTickets.length})
            </button>
            <button
              className={`filter-chip-btn ${quickTab === 'my_tickets' ? 'active' : ''}`}
              onClick={() => setQuickTab('my_tickets')}
            >
              <UserCheck size={14} />
              <span>Assigned to Me</span>
            </button>
            <button
              className={`filter-chip-btn ${quickTab === 'urgent' ? 'active' : ''}`}
              onClick={() => setQuickTab('urgent')}
            >
              <Flame size={14} color="#EF4444" />
              <span>Urgent & High</span>
            </button>
            <button
              className={`filter-chip-btn ${quickTab === 'due_soon' ? 'active' : ''}`}
              onClick={() => setQuickTab('due_soon')}
            >
              <Clock size={14} color="#F59E0B" />
              <span>Due Soon</span>
            </button>
          </div>

          {/* Right Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search key, title, label..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              title="Filter by priority"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              title="Filter by type"
            >
              <option value="All">All Types</option>
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </select>

            <select
              className="filter-select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              title="Filter by assignee"
            >
              <option value="All">All Assignees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>

            {allLabels.length > 0 && (
              <select
                className="filter-select"
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                title="Filter by label"
              >
                <option value="All">All Labels</option>
                {allLabels.map((lbl) => (
                  <option key={lbl} value={lbl}>
                    #{lbl}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Page Content Rendered Here via Nested Route */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading tickets, sprints, and projects...
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Global Modals */}
      <TicketModal
        isOpen={createTicketOpen}
        onClose={() => setCreateTicketOpen(false)}
        onSubmit={handleCreateTicket}
        users={users}
        sprints={sprints}
        currentUserId={user?._id}
        projectKey={selectedProject?.key || 'KUP'}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdateStatus={handleStatusChange}
        onUpdateDetails={handleUpdateDetails}
        onAddComment={handleAddComment}
        onDeleteTicket={handleDeleteTicket}
        users={users}
        sprints={sprints}
      />

      <CreateSprintModal
        isOpen={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
        onSubmit={handleCreateSprint}
      />

      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      <ProjectSettingsModal
        project={selectedProject}
        isOpen={projectSettingsOpen}
        onClose={() => setProjectSettingsOpen(false)}
        onUpdateProject={handleUpdateProject}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        allUsers={users}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
