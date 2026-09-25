import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  LayoutDashboard, BookOpen, Radio, 
  FileText, MessageSquare, Award,
  Settings, X, LogOut
} from 'lucide-react';
import { logout } from '../../features/authSlice';

interface StudentCyberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentCyberSidebar: React.FC<StudentCyberSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);

  const handlePrefetch = (path: string) => {
    try {
      if (path.includes('courses')) {
        queryClient.prefetchQuery({ queryKey: ['courses'], queryFn: async () => (await api.get('courses/')).data, staleTime: 1000 * 60 * 5 });
      } else if (path.includes('assignments')) {
        queryClient.prefetchQuery({ queryKey: ['student-assignments'], queryFn: async () => (await api.get('assignments/')).data, staleTime: 1000 * 60 * 5 });
      } else if (path.includes('certificates')) {
        queryClient.prefetchQuery({ queryKey: ['certificates'], queryFn: async () => (await api.get('certificates/')).data, staleTime: 1000 * 60 * 5 });
      } else if (path.includes('live')) {
        queryClient.prefetchQuery({ queryKey: ['live-classes'], queryFn: async () => (await api.get('courses/live/')).data, staleTime: 1000 * 60 * 5 });
      }
    } catch {
      // Background prefetch fail silently
    }
  };

  const [isStudentLive, setIsStudentLive] = React.useState<boolean>(() => {
    return localStorage.getItem('studentLiveMode') === 'true' ||
      Boolean(localStorage.getItem('loginPath')?.includes('live')) ||
      (user as any)?.student_type === 'LIVE_CLASS' ||
      (Boolean(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user') || '{}')?.student_type === 'LIVE_CLASS');
  });

  React.useEffect(() => {
    const handleStorage = () => {
      setIsStudentLive(
        localStorage.getItem('studentLiveMode') === 'true' ||
        Boolean(localStorage.getItem('loginPath')?.includes('live')) ||
        (user as any)?.student_type === 'LIVE_CLASS' ||
        (Boolean(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user') || '{}')?.student_type === 'LIVE_CLASS')
      );
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user]);

  const handleLogout = () => {
    const isLive = isStudentLive;
    dispatch(logout());
    if (isLive) {
      navigate('/student/live-login');
    } else {
      navigate('/student/login');
    }
  };

  const navItems = isStudentLive
    ? [
        { label: 'Dashboard', path: '/live-student', icon: LayoutDashboard, exact: true },
        { label: 'Live Videos', path: '/live-student/videos', icon: BookOpen },
        { label: 'Live Sessions', path: '/live-student/sessions', icon: Radio },
        { label: 'Assignments', path: '/live-student/assignments', icon: FileText },
        { label: 'Q&A Forum', path: '/live-student/forum', icon: MessageSquare },
        { label: 'Settings', path: '/live-student/profile', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
        { label: 'Courses', path: '/student/courses', icon: BookOpen },
        { label: 'Doubt Sessions', path: '/student/live', icon: Radio },
        { label: 'Certificates', path: '/student/certificates', icon: Award },
        { label: 'Q&A Forum', path: '/student/forum', icon: MessageSquare },
        { label: 'Settings', path: '/student/profile', icon: Settings },
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Cyber-Glass Sidebar Container (Sample UI Mockup Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 m-0 lg:m-3 h-full lg:h-[calc(100vh-1.5rem)] rounded-none lg:rounded-3xl cyber-glass-sidebar text-slate-100 p-4 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 space-y-4">
          {/* ── TOP HORIZONTAL BRANDING ── */}
          <div className="relative flex items-center gap-3 pt-2 pb-3 px-1 border-b border-teal-900/40">
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden absolute top-0 right-0 text-teal-300 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            {/* Logo Emblem */}
            <div className="p-1 rounded-xl bg-white/10 border border-teal-400/20 shadow-sm shrink-0">
              <img 
                src="/logo.png?v=3" 
                alt="Hadescore Logo" 
                className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              />
            </div>

            {/* Brand Typography */}
            <div>
              <h2 className="font-display font-black text-sm tracking-wider uppercase text-white leading-tight">
                HADESCORE
              </h2>
              <p className="text-[10px] font-semibold text-teal-300/80 tracking-wide mt-0.5">
                Learn • Build • Grow
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => onClose()}
                  onMouseEnter={() => handlePrefetch(item.path)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#1b7b7c] text-white font-bold shadow-md shadow-teal-950/40'
                        : 'text-[#a8cbcf] hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        size={17} 
                        className={`transition-transform duration-200 group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-[#80a9af] group-hover:text-white'
                        }`} 
                      />
                      <span className="flex-1 tracking-wide">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-3 border-t border-teal-900/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#a8cbcf] hover:text-white hover:bg-red-500/20 transition-all active:scale-95 w-full"
          >
            <LogOut 
              size={16} 
              className="text-[#80a9af] group-hover:text-red-400 transition-colors duration-200" 
            />
            <span className="flex-1 tracking-wide text-left">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
