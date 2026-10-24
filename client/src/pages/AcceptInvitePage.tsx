import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import {
  CheckCircle2,
  AlertCircle,
  Building,
  Milestone,
  Shield,
  Key,
  User,
  Briefcase,
  Phone,
  Tag,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AcceptInvitePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract invite token from query string
  const token = new URLSearchParams(location.search).get('token') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);

  // Remaining details filled by user only
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState('');

  // Fetch invitation details
  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please use the link sent in your invitation email.');
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await userService.getInviteDetails(token);
        if (res.data.success && res.data.invite) {
          setInviteData(res.data.invite);
          if (res.data.invite.role === 'QA') {
            setDepartment('Quality Assurance');
            setSkills(['Manual Testing', 'Cypress', 'API Testing']);
          } else if (res.data.invite.role === 'Team Lead') {
            setSkills(['Agile / Scrum', 'Architecture', 'Team Leadership']);
          }
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'This invitation link is invalid, expired, or has already been accepted.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!title.trim() || !department.trim() || !phone.trim()) {
      alert('Please fill in your Job Title, Department, and Contact Phone.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await userService.acceptInvite({
        token,
        password,
        title: title.trim(),
        department: department.trim(),
        phone: phone.trim(),
        skills,
        bio: bio.trim(),
      });

      if (res.data.success) {
        // Save token and log user in automatically
        localStorage.setItem('karyaup_token', res.data.token);
        // Force full page reload to root/board so AuthContext re-hydrates with new user session
        window.location.href = '/board';
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete profile activation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Validating sprint invitation...
      </div>
    );
  }

  if (error || !inviteData) {
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
            maxWidth: '500px',
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Invitation Expired or Invalid
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error || 'We could not locate this invitation.'}
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '2.5rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '740px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={12} /> Sprint Invitation
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome to KaryaUp, {inviteData.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            You have been invited to collaborate with your team. Review your assignment below and complete your remaining personal and technical profile details to activate your account.
          </p>
        </div>

        {/* Locked Details Filled by Admin */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Lock size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>
              Assigned by Project Admin (Locked)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-tertiary)',
              padding: '1.25rem',
              borderRadius: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Employee Email
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{inviteData.email}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Assigned Platform Role
              </span>
              <div style={{ marginTop: '2px' }}>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: 'var(--accent-primary)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  {inviteData.role}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Project
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>
                {inviteData.project?.name || 'KaryaUp Core Platform'} [
                {inviteData.project?.key || 'KUP'}]
              </div>
            </div>

            {inviteData.sprint && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Sprint
                </span>
                <div style={{ fontWeight: 600, marginTop: '2px', color: '#10B981' }}>
                  {inviteData.sprint.name} ({inviteData.sprint.status})
                </div>
              </div>
            )}
          </div>

          {inviteData.message && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
              }}
            >
              &ldquo;{inviteData.message}&rdquo;
            </div>
          )}
        </div>

        {/* Form: Remaining Details to be Filled by User Only */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <User size={18} color="#10B981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Complete Your Profile Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Password & Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={14} /> Create Your Password *
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={14} /> Confirm Password *
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Title & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Briefcase size={14} /> Job Title / Designation *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="Engineering">Engineering / Development</option>
                  <option value="Quality Assurance">Quality Assurance & QA</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                  <option value="Project Management">Project Management</option>
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} /> Contact Phone / Mobile *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +1 (555) 456-7890"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Technical Skills Tags */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={14} /> Technical Skills / Specializations
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a skill (e.g. Node.js, GraphQL, Cypress) and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSkill}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Add Skill
                </button>
              </div>

              {/* Skill Tags List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    #{s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: 0,
                        fontSize: '0.9rem',
                        lineHeight: 1,
                      }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bio / About */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} /> Bio / Professional Summary
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Share a short introduction with your sprint teammates..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                }}
              >
                <span>
                  {submitting ? 'Activating Profile & Joining Sprint...' : 'Complete Profile & Join Sprint'}
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
