import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { ticketService, projectService, sprintService, userService } from '../services/api';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Database,
  Server,
  Key,
  Users,
  RefreshCw,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface EndpointCheck {
  name: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  latencyMs: number;
  dataSummary: string;
}

export const SystemStatusPage: React.FC = () => {
  const { user, token, demoUsers, switchDemoUser } = useAuth();
  const { tickets, sprints, projects, selectedProject } = useProject();

  const [testing, setTesting] = useState(false);
  const [endpoints, setEndpoints] = useState<EndpointCheck[]>([
    { name: 'Projects API', url: '/api/projects', status: 'pending', latencyMs: 0, dataSummary: '' },
    { name: 'Tickets API', url: '/api/tickets', status: 'pending', latencyMs: 0, dataSummary: '' },
    { name: 'Sprints API', url: '/api/sprints', status: 'pending', latencyMs: 0, dataSummary: '' },
    { name: 'Users API', url: '/api/users', status: 'pending', latencyMs: 0, dataSummary: '' },
  ]);

  const runDiagnostics = async () => {
    setTesting(true);

    const testEndpoint = async (
      name: string,
      url: string,
      fetchFn: () => Promise<any>,
      summaryExtractor: (data: any) => string
    ): Promise<EndpointCheck> => {
      const start = performance.now();
      try {
        const res = await fetchFn();
        const latency = Math.round(performance.now() - start);
        return {
          name,
          url,
          status: 'success',
          latencyMs: latency,
          dataSummary: summaryExtractor(res.data),
        };
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        return {
          name,
          url,
          status: 'error',
          latencyMs: latency,
          dataSummary: err.response?.data?.message || err.message || 'Connection failed',
        };
      }
    };

    const results = await Promise.all([
      testEndpoint('Projects API', '/api/projects', () => projectService.getProjects(), (d) => `${d.projects?.length || 0} projects loaded`),
      testEndpoint('Tickets API', '/api/tickets', () => ticketService.getTickets(), (d) => `${d.tickets?.length || 0} tickets indexed`),
      testEndpoint('Sprints API', '/api/sprints', () => sprintService.getSprints(), (d) => `${d.sprints?.length || 0} sprints active`),
      testEndpoint('Users API', '/api/users', () => userService.getUsers(), (d) => `${d.users?.length || 0} users in directory`),
    ]);

    setEndpoints(results);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const rolesMatrix = [
    {
      role: 'Project Admin',
      createProjects: true,
      manageMembers: true,
      createSprints: true,
      editAnyTicket: true,
      overrideStatus: true,
      description: 'Supreme governance over project settings, member roles, sprints, and all tickets.',
    },
    {
      role: 'Team Lead',
      createProjects: false,
      manageMembers: true,
      createSprints: true,
      editAnyTicket: true,
      overrideStatus: true,
      description: 'Sprint planning, ticket creation, task assignment, and delivery workflow governance.',
    },
    {
      role: 'Developer',
      createProjects: false,
      manageMembers: false,
      createSprints: false,
      editAnyTicket: false,
      overrideStatus: false,
      description: 'Can create tickets, add comments, and transition status on tasks assigned to them.',
    },
    {
      role: 'QA',
      createProjects: false,
      manageMembers: false,
      createSprints: false,
      editAnyTicket: false,
      overrideStatus: false,
      description: 'Can file bug tickets, add comments, and verify/close tickets in review or testing.',
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity color="var(--accent-primary)" size={24} />
            <span>System Status & Route Diagnostics</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Live inspection of backend services, auth session, JWT tokens, and role permission matrices.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={runDiagnostics}
          disabled={testing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={15} className={testing ? 'animate-spin' : ''} />
          <span>{testing ? 'Testing Endpoints...' : 'Re-Run Diagnostics'}</span>
        </button>
      </div>

      {/* Grid: 3 Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Backend Connectivity Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Server color="#10B981" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Backend Service</h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Host:</span>
              <code style={{ color: 'var(--text-primary)' }}>http://localhost:5000</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Environment:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>TypeScript / Node.js</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Validation Engine:</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Zod Schemas</span>
            </div>
          </div>
        </div>

        {/* Database & State Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Database color="#3B82F6" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Database & In-Memory State</h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Selected Project:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                {selectedProject?.name} [{selectedProject?.key}]
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Tickets Loaded:</span>
              <span style={{ fontWeight: 600 }}>{tickets.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sprints in Pipeline:</span>
              <span style={{ fontWeight: 600 }}>{sprints.length}</span>
            </div>
          </div>
        </div>

        {/* Active Session Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Key color="#F59E0B" size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Auth & JWT Session</h3>
          </div>
          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Logged User:</span>
              <span style={{ fontWeight: 600 }}>{user?.name || 'Unauthenticated'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Role:</span>
              <span
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {user?.role || 'Guest'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>JWT Token:</span>
              <span style={{ color: token ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                {token ? `Active (${token.substring(0, 12)}...)` : 'Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live API Health Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
          Real-time REST API Endpoint Health
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {endpoints.map((ep) => (
            <div
              key={ep.name}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ep.name}</span>
                {ep.status === 'success' ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#10B981',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={15} /> 200 OK
                  </span>
                ) : ep.status === 'error' ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#EF4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={15} /> Error
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Checking...</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <code style={{ color: 'var(--accent-primary)' }}>{ep.url}</code>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {ep.latencyMs} ms
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {ep.dataSummary || 'Awaiting response...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permission Matrix Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--accent-primary)" />
              <span>Role Permissions Matrix</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              How each role operates across project management, sprint planning, and ticket workflow validation.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="karya-table" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>System Role</th>
                <th style={{ textAlign: 'center' }}>Create Projects</th>
                <th style={{ textAlign: 'center' }}>Manage Members</th>
                <th style={{ textAlign: 'center' }}>Manage Sprints</th>
                <th style={{ textAlign: 'center' }}>Edit Any Ticket</th>
                <th style={{ textAlign: 'center' }}>Workflow Override</th>
                <th>Responsibilities</th>
              </tr>
            </thead>
            <tbody>
              {rolesMatrix.map((r) => {
                const isCurrent = user?.role === r.role;
                return (
                  <tr
                    key={r.role}
                    style={{
                      background: isCurrent ? 'rgba(59, 130, 246, 0.08)' : undefined,
                      borderLeft: isCurrent ? '3px solid var(--accent-primary)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>{r.role}</span>
                        {isCurrent && (
                          <span
                            style={{
                              background: 'var(--accent-primary)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '8px',
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.createProjects ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.manageMembers ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.createSprints ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.editAnyTicket ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.overrideStatus ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="var(--text-muted)" />}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {r.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instant Demo Role Switcher */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
            Instant Role Switcher (Test Protected Routes)
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {demoUsers.map((du) => {
            const isCurrent = user?.email === du.email;
            return (
              <button
                key={du._id}
                onClick={() => switchDemoUser(du)}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.875rem',
                  border: isCurrent ? '1.5px solid var(--accent-primary)' : undefined,
                  background: isCurrent ? 'rgba(59, 130, 246, 0.1)' : undefined,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{du.name}</strong>
                  {isCurrent && (
                    <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                  )}
                </div>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {du.role}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{du.email}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPage;
