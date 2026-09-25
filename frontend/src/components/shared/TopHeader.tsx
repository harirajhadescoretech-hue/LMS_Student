import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { logout } from '../../features/authSlice';
import { Menu, User, Settings, Award, Trophy, LogOut, ChevronDown, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from '../student/NotificationCenter';
import { getInitials } from '../../utils/stringUtils';

interface TopHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    const role = user?.role;
    const isLive = localStorage.getItem('studentLiveMode') === 'true' ||
      Boolean(localStorage.getItem('loginPath')?.includes('live')) ||
      (user as any)?.student_type === 'LIVE_CLASS';
    dispatch(logout());
    if (role === 'SUPER_ADMIN') navigate('/admin/login');
    else if (role === 'STAFF') navigate('/staff/login');
    else if (isLive) navigate('/student/live-login');
    else navigate('/student/login');
  };

  const getProfilePath = () => {
    if (user?.role === 'SUPER_ADMIN') return '/admin/profile';
    if (user?.role === 'STAFF') return '/staff/profile';
    return '/student/profile';
  };

  const getRoleLabel = () => {
    if (user?.role === 'SUPER_ADMIN') return 'Admin';
    if (user?.role === 'STAFF') return 'Mentor';
    return 'Student';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white border-b border-[#e2eded] px-4 sm:px-6 text-slate-800 shadow-sm" style={{ overflow: 'visible' }}>
      {/* Left side: Toggle Button for Staff & Admin */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl p-2 hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center Search Input (Sample UI Mockup) */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, students, or anything..."
            className="w-full h-10 pl-10 pr-4 bg-[#f0f4f8] hover:bg-[#ebf0f6] focus:bg-white border border-slate-200/70 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 rounded-full text-xs font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right side Actions & Profile Dropdown */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Notification Bell */}
        <NotificationCenter />

        {/* User Profile Dropdown Button (Sample UI Mockup: HM + Hadescore + Admin) */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer"
          >
            {/* Circular Teal Avatar with Initials */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#009e86] text-white font-black text-xs shadow-sm">
              {getInitials(user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '', 'HM')}
            </div>

            <div className="hidden text-left sm:block max-w-[130px] overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Hadescore'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                {getRoleLabel()}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-teal-600' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#e2eded] shadow-xl p-2 z-50 overflow-hidden text-slate-800"
              >
                {/* Header Summary inside dropdown */}
                <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#009e86] text-white font-bold text-xs shrink-0">
                      {getInitials(user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '', 'HM')}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Hadescore'}
                      </h4>
                      <p className="text-[10px] text-teal-700 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Dropdown Options List */}
                <div className="space-y-1">
                  <Link
                    to={getProfilePath()}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
