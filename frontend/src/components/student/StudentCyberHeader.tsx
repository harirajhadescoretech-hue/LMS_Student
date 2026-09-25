import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { Search, Wifi, Clock, Sun, Bell, Menu, BookOpen } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { getInitials } from '../../utils/stringUtils';

interface StudentCyberHeaderProps {
  onToggleSidebar: () => void;
}

export const StudentCyberHeader: React.FC<StudentCyberHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');

  const [isStudentLive, setIsStudentLive] = useState<boolean>(() => {
    return localStorage.getItem('studentLiveMode') === 'true' ||
      Boolean(localStorage.getItem('loginPath')?.includes('live')) ||
      (user as any)?.student_type === 'LIVE_CLASS' ||
      (Boolean(localStorage.getItem('user')) && JSON.parse(localStorage.getItem('user') || '{}')?.student_type === 'LIVE_CLASS');
  });

  const toggleStudentMode = () => {
    const nextVal = !isStudentLive;
    setIsStudentLive(nextVal);
    localStorage.setItem('studentLiveMode', String(nextVal));
    window.dispatchEvent(new Event('storage'));
    if (nextVal) {
      navigate('/live-student');
    } else {
      navigate('/student');
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full h-14 flex items-center justify-between gap-3 px-3 py-1 mb-4 bg-white/95 border border-[#e2eded] rounded-2xl shadow-sm text-slate-800 backdrop-blur-md relative" style={{ zIndex: 40, overflow: 'visible' }}>
      {/* Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-teal-700 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search courses, topics, or skills..."
            className="w-full h-10 pl-10 pr-4 bg-[#f0f4f8] hover:bg-[#ebf0f6] focus:bg-white border border-slate-200/70 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 rounded-full outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/student/courses');
              }
            }}
          />
        </div>
      </div>

      {/* Right side status indicators (Mode, Time, Weather, Bell, Avatar) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mode Indicator: Course Mode vs Live Mode (Clickable toggle) */}
        <button 
          onClick={toggleStudentMode}
          title="Click to toggle Course/Live Mode"
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isStudentLive 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}
        >
          {isStudentLive ? (
            <>
              <Wifi size={13} className="text-emerald-600 animate-pulse" />
              <span className="text-[10px] text-emerald-800 font-extrabold tracking-wide">Live Mode</span>
            </>
          ) : (
            <>
              <BookOpen size={13} className="text-teal-600" />
              <span className="text-[10px] text-teal-800 font-extrabold tracking-wide">Course Mode</span>
            </>
          )}
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
          <Clock size={13} className="text-teal-600" />
          <span>{currentTime || '9:41 AM'}</span>
        </div>

        {/* Notification Bell */}
        <NotificationCenter />

        {/* Student Avatar */}
        <div
          onClick={() => navigate('/student/profile')}
          className="relative cursor-pointer group"
          title="My Profile"
        >
          <div className="h-9 w-9 rounded-full bg-[#009e86] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            {getInitials(user?.name || user?.first_name, 'ST')}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
        </div>
      </div>
    </header>
  );
};
