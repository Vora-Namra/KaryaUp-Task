import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { User, DemoUserAccount, UserRole, ProjectRole, Ticket, Project } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoUsers: DemoUserAccount[];
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role?: string) => Promise<any>;
  switchDemoUser: (demoAccount: DemoUserAccount) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  hasProjectRole: (project: Project | null, ...projectRoles: ProjectRole[]) => boolean;
  canEditTicketDetails: (ticket: Ticket | null) => boolean;
  canUpdateTicketStatus: (ticket: Ticket | null) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('karyaup_token') || null);
  const [demoUsers, setDemoUsers] = useState<DemoUserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const demoRes = await authService.getDemoUsers();
        if (demoRes.data && demoRes.data.demoAccounts) {
          setDemoUsers(demoRes.data.demoAccounts);
        }

        const savedToken = localStorage.getItem('karyaup_token');
        if (savedToken) {
          try {
            const meRes = await authService.getMe();
            if (meRes.data && meRes.data.user) {
              setUser(meRes.data.user);
            }
          } catch (err) {
            console.warn('Session expired, defaulting to first demo user');
            localStorage.removeItem('karyaup_token');
            setToken(null);
          }
        }

        // Keep user as null if not logged in so Login screen is presented
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('karyaup_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await authService.register({ name, email, password, role });
    if (res.data.success) {
      localStorage.setItem('karyaup_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const switchDemoUser = (demoAccount: DemoUserAccount) => {
    localStorage.setItem('karyaup_token', demoAccount.token);
    setToken(demoAccount.token);
    setUser({
      _id: demoAccount._id,
      name: demoAccount.name,
      email: demoAccount.email,
      role: demoAccount.role,
    });
  };

  const logout = () => {
    localStorage.removeItem('karyaup_token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasProjectRole = (project: Project | null, ...projectRoles: ProjectRole[]) => {
    if (!user || !project) return false;
    if (user.role === 'Project Admin') return true;
    const member = project.members?.find((m) => {
      const memberUserId = typeof m.user === 'object' ? m.user._id : m.user;
      return memberUserId?.toString() === user._id?.toString();
    });
    if (!member) return false;
    return projectRoles.includes(member.projectRole);
  };

  const canEditTicketDetails = (ticket: Ticket | null) => {
    if (!user || !ticket) return false;
    if (['Project Admin', 'Team Lead'].includes(user.role)) return true;
    const assigneeId = typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo;
    return assigneeId?.toString() === user._id?.toString();
  };

  const canUpdateTicketStatus = (ticket: Ticket | null) => {
    if (!user || !ticket) return false;
    if (['Project Admin', 'Team Lead'].includes(user.role)) return true;
    const assigneeId = typeof ticket.assignedTo === 'object' ? ticket.assignedTo?._id : ticket.assignedTo;
    if (assigneeId?.toString() === user._id?.toString()) return true;
    if (user.role === 'QA' && ['In Review', 'Done', 'Solved', 'To Do'].includes(ticket.status)) {
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        demoUsers,
        loading,
        login,
        register,
        switchDemoUser,
        logout,
        hasRole,
        hasProjectRole,
        canEditTicketDetails,
        canUpdateTicketStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
