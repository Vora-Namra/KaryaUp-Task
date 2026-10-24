import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Users, Activity } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, demoUsers, switchDemoUser } = useAuth();

  const state = (location.state as {
    from?: string;
    requiredRoles?: string[];
    currentRole?: string;
  }) || {};

  const currentRole = state.currentRole || user?.role || 'Guest';
  const requiredRoles = state.requiredRoles || ['Project Admin', 'Team Lead'];
  const attemptedPath = state.from || location.pathname;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#EF4444',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          403 &mdash; Access Restricted
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          You do not have sufficient role permissions to access{' '}
          <code
            style={{
              background: 'var(--bg-tertiary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              color: 'var(--accent-primary)',
            }}
          >
            {attemptedPath}
          </code>
        </p>

        {/* Roles Details Box */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Your Current Role:</span>
            <span
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                fontWeight: 600,
              }}
            >
              {currentRole}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Required Role(s):</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {requiredRoles.map((r) => (
                <span
                  key={r}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Switch to an Authorized Demo Account */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Users size={14} />
            <span>Switch to an Authorized Demo Account:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {demoUsers
              .filter((u) => requiredRoles.includes(u.role))
              .map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    switchDemoUser(u);
                    navigate(attemptedPath, { replace: true });
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.6rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.72rem' }}>
                    {u.role}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/board')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Kanban Board</span>
          </button>
          <button
            onClick={() => navigate('/system-status')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Activity size={16} />
            <span>Check Permissions Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
