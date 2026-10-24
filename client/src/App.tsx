import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './components/routes/PublicRoute';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { RoleProtectedRoute } from './components/routes/RoleProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectProvider } from './context/ProjectContext';

// Page-wise components
import { LoginPage } from './pages/LoginPage';
import { BoardPage } from './pages/BoardPage';
import { SprintsPage } from './pages/SprintsPage';
import { IssuesPage } from './pages/IssuesPage';
import { MetricsPage } from './pages/MetricsPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';

export default function App() {
  return (
    <Routes>
      {/* =========================================================================
          PUBLIC ROUTES (Unauthorized visitors only; redirects logged-in to /board)
          ========================================================================= */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Public Invitation Acceptance Flow */}
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      {/* =========================================================================
          UNAUTHORIZED / ACCESS RESTRICTED (Publicly informative 403 page)
          ========================================================================= */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* =========================================================================
          PROTECTED ROUTES (Requires valid JWT session; redirects unauthenticated to /login)
          ========================================================================= */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <ProjectProvider>
              <AppLayout />
            </ProjectProvider>
          }
        >
          {/* Default Root Redirect */}
          <Route path="/" element={<Navigate to="/board" replace />} />

          {/* Core Feature Pages */}
          <Route path="/board" element={<BoardPage />} />
          <Route path="/sprints" element={<SprintsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/system-status" element={<SystemStatusPage />} />

          {/* Role-Guarded Settings Page (Only Project Admin & Team Lead) */}
          <Route
            element={
              <RoleProtectedRoute allowedRoles={['Project Admin', 'Team Lead']} />
            }
          >
            <Route path="/settings" element={<ProjectSettingsPage />} />
          </Route>

          {/* Role-Guarded Team & User Management (STRICTLY Project Admin ONLY) */}
          <Route
            element={
              <RoleProtectedRoute allowedRoles={['Project Admin']} />
            }
          >
            <Route path="/team" element={<TeamManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* =========================================================================
          FALLBACK ROUTE (Unknown paths navigate back to board)
          ========================================================================= */}
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
