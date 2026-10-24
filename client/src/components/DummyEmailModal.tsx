import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  X,
  ExternalLink,
  Copy,
  Check,
  Building,
  Milestone,
  Shield,
  Send,
  Sparkles,
} from 'lucide-react';

interface DummyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: {
    invitedUser: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    project: {
      _id: string;
      name: string;
      key: string;
    };
    sprint: {
      _id: string;
      name: string;
      status: string;
      goal?: string;
    } | null;
    projectRole: string;
    invitedBy: {
      name: string;
      email: string;
      role: string;
    };
    message?: string;
    sentAt: string;
  } | null;
  inviteToken: string;
}

export const DummyEmailModal: React.FC<DummyEmailModalProps> = ({
  isOpen,
  onClose,
  invitation,
  inviteToken,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !invitation) return null;

  const inviteUrl = `${window.location.origin}/accept-invite?token=${inviteToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenInvite = () => {
    onClose();
    navigate(`/accept-invite?token=${inviteToken}`);
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Email Client Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1e2d 0%, #2a2a3e 100%)',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    background: '#10B981',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Simulated Email
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Dummy Email Dispatch Preview
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px', color: '#fff' }}>
                Invitation Sent to {invitation.invitedUser.email}
              </h3>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} title="Close preview">
            <X size={18} />
          </button>
        </div>

        {/* Simulated Email Envelope Details */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>From:</span>
            <span style={{ fontWeight: 600 }}>
              KaryaUp System Notifications &lt;no-reply@karyaup.com&gt;
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>To:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              {invitation.invitedUser.name} &lt;{invitation.invitedUser.email}&gt;
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
            <span style={{ fontWeight: 600 }}>
              🚀 You have been invited to join{' '}
              {invitation.sprint ? `"${invitation.sprint.name}"` : 'the active sprint'} in{' '}
              {invitation.project.name}!
            </span>
          </div>
        </div>

        {/* Email HTML Body (Rendered as in Inbox) */}
        <div style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            {/* Branding Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  KaryaUp
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Task & Sprint Management
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(invitation.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Greeting & Invitation Note */}
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Hello {invitation.invitedUser.name},
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              <strong>{invitation.invitedBy.name}</strong> ({invitation.invitedBy.role}) has invited you to join the team and collaborate on project{' '}
              <strong>{invitation.project.name}</strong>.
            </p>

            {/* Sprint & Project Details Card */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <Building size={15} /> Project:
                </span>
                <span style={{ fontWeight: 600 }}>
                  {invitation.project.name} [{invitation.project.key}]
                </span>
              </div>

              {invitation.sprint && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Milestone size={15} color="#10B981" /> Target Sprint:
                  </span>
                  <span style={{ fontWeight: 600, color: '#10B981' }}>
                    {invitation.sprint.name} ({invitation.sprint.status})
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <Shield size={15} /> Assigned Roles:
                </span>
                <span>
                  <strong>{invitation.invitedUser.role}</strong> &bull; Project Role:{' '}
                  <strong>{invitation.projectRole}</strong>
                </span>
              </div>

              {invitation.message && (
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    marginTop: '0.25rem',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                  }}
                >
                  &ldquo;{invitation.message}&rdquo;
                </div>
              )}
            </div>

            {/* Instructions */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <strong style={{ color: 'var(--accent-primary)' }}>Notice:</strong> Admin has filled your initial invitation details. Please click the button below to complete your secure password, job designation, phone number, and skills to activate your account.
            </div>

            {/* Big Action CTA Button inside simulated email */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <button
                onClick={handleOpenInvite}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                }}
              >
                Accept Sprint Invitation & Complete Profile &rarr;
              </button>
            </div>

            {/* Direct Link Preview */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Direct URL:{' '}
              <span style={{ color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                {inviteUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Invitation Link'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Close Preview
            </button>
            <button
              onClick={handleOpenInvite}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <ExternalLink size={15} />
              <span>Open Link as Employee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DummyEmailModal;
