import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginSuccess } from '../../features/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Lock, Mail, GraduationCap, Briefcase, Shield,
  ChevronRight, KeyRound, Zap, BookOpen, Award, BarChart3,
  ArrowLeft, LogIn, MessageSquare, Video, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStudentSecurity from '../../hooks/useStudentSecurity';

// ── Schema ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginPageProps { 
  role?: 'SUPER_ADMIN' | 'STAFF' | 'STUDENT'; 
  mode?: 'COURSE' | 'LIVE';
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE — Hadescore Modern EdTech Template (Zero-Scroll Viewport Layout)
// ═══════════════════════════════════════════════════════════════════════════════
const LoginPage: React.FC<LoginPageProps> = ({ role, mode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>('LOGIN');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [isStudentLiveMode, setIsStudentLiveMode] = useState<boolean>(
    mode === 'LIVE' || (mode === undefined && localStorage.getItem('studentLiveMode') === 'true')
  );

  useEffect(() => { 
    if (mode === 'LIVE') {
      localStorage.setItem('studentLiveMode', 'true');
      setIsStudentLiveMode(true);
    } else if (mode === 'COURSE') {
      localStorage.setItem('studentLiveMode', 'false');
      setIsStudentLiveMode(false);
    }
  }, [mode]);

  const currentRole = role || (
    location.pathname.startsWith('/admin') ? 'SUPER_ADMIN' :
    location.pathname.startsWith('/staff') ? 'STAFF' : 'STUDENT'
  );

  // Security: Disable right-click & developer inspection shortcut keys for Student login ONLY
  useStudentSecurity(currentRole === 'STUDENT');

  // ── Role Specific Customization ─────────────────────────────────────────
  const portalConfig = {
    SUPER_ADMIN: {
      badgeText: "SYSTEM CONTROL",
      badgeIcon: Shield,
      heroLine1: "Sign in to",
      heroLine2: "Admin Access",
      heroSubtitle: "Manage platform architecture, user roles, security, courses, and system analytics.",
      features: [
        {
          title: "Governance",
          desc: "Full role & course control",
          icon: Shield,
          iconBg: "bg-sky-100 text-sky-600",
        },
        {
          title: "Analytics",
          desc: "Real-time user insights",
          icon: BarChart3,
          iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
          title: "Security",
          desc: "Audited role permissions",
          icon: Lock,
          iconBg: "bg-indigo-100 text-indigo-600",
        }
      ]
    },
    STAFF: {
      badgeText: "MENTOR WORKSPACE",
      badgeIcon: Briefcase,
      heroLine1: "Sign in to",
      heroLine2: "Mentor Access",
      heroSubtitle: "Manage student reviews, evaluate submissions, and conduct live mentoring sessions.",
      features: [
        {
          title: "Cohorts",
          desc: "Track batch performance",
          icon: Briefcase,
          iconBg: "bg-sky-100 text-sky-600",
        },
        {
          title: "Reviews",
          desc: "Grade task submissions",
          icon: Award,
          iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
          title: "Mentorship",
          desc: "Host live 1-on-1 calls",
          icon: Sparkles,
          iconBg: "bg-indigo-100 text-indigo-600",
        }
      ]
    },
    STUDENT: isStudentLiveMode ? {
      badgeText: "LIVE SESSIONS PLATFORM",
      badgeIcon: Zap,
      heroLine1: "Sign in to",
      heroLine2: "Live Class Access",
      heroSubtitle: "Join interactive live mentoring sessions, collaborate, and accelerate your mastery.",
      features: [
        {
          title: "Live Stream",
          desc: "Real-time lectures & mentorship",
          icon: Video,
          iconBg: "bg-sky-100 text-sky-600",
        },
        {
          title: "Engage",
          desc: "Instant Q&A and doubt clearance",
          icon: MessageSquare,
          iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
          title: "Accelerate",
          desc: "Fast-track mentor feedback",
          icon: Zap,
          iconBg: "bg-indigo-100 text-indigo-600",
        }
      ]
    } : {
      badgeText: "COURSE PLATFORM",
      badgeIcon: GraduationCap,
      heroLine1: "Sign in to",
      heroLine2: "Course Access",
      heroSubtitle: "Enter your credentials to continue and explore your learning dashboard.",
      features: [
        {
          title: "Learn",
          desc: "Access courses anytime, anywhere",
          icon: BookOpen,
          iconBg: "bg-sky-100 text-sky-600",
        },
        {
          title: "Build",
          desc: "Track progress and achieve goals",
          icon: BarChart3,
          iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
          title: "Grow",
          desc: "Get certified for a better future",
          icon: Award,
          iconBg: "bg-indigo-100 text-indigo-600",
        }
      ]
    }
  }[currentRole];

  const BadgeIcon = portalConfig.badgeIcon;

  // ── Form ────────────────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const onSubmit = useCallback(async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await api.post('auth/login/', { email: data.email, password: data.password });
      const { user, access, refresh } = res.data;
      if (user.role !== currentRole) {
        toast.error(`Access Denied: Your role is ${user.role}, but this is the ${currentRole} portal.`, { duration: 6000 });
        setLoading(false);
        return;
      }

      // Check student portal mode matching
      if (user.role === 'STUDENT') {
        const studentType = user.student_type || 'COURSE';
        if (isStudentLiveMode && studentType === 'COURSE') {
          toast.error("Access Denied: You are registered for standard Course Access. Please log in at /student/login", { duration: 6000 });
          setLoading(false);
          return;
        }
        if (!isStudentLiveMode && studentType === 'LIVE_CLASS') {
          toast.error("Access Denied: You are registered for Live Class Mentoring. Please log in at /student/live-login", { duration: 6000 });
          setLoading(false);
          return;
        }
      }

      const roleLoginPath: Record<string, string> = {
        SUPER_ADMIN: '/admin/login',
        STAFF: '/staff/login',
        STUDENT: isStudentLiveMode ? '/student/live-login' : '/student/login',
      };
      const loginPath = roleLoginPath[user.role] || '/student/login';
      if (user.role === 'STUDENT') {
        localStorage.setItem('studentLiveMode', isStudentLiveMode ? 'true' : 'false');
      }
      dispatch(loginSuccess({ user, access, refresh, loginPath }));
      toast.success(`Welcome back, ${user.first_name || 'User'}!`);
      if (user.role === 'SUPER_ADMIN') navigate('/admin');
      else if (user.role === 'STAFF') navigate('/staff');
      else if (isStudentLiveMode) navigate('/live-student');
      else navigate('/student');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid credentials.", { duration: 6000 });
    } finally { setLoading(false); }
  }, [currentRole, isStudentLiveMode, dispatch, navigate]);

  const handleForgotPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { toast.error("Please enter your email address."); return; }
    setLoading(true);
    try {
      const res = await api.post('auth/forgot-password/', { email: resetEmail });
      toast.success(res.data.detail || "Verification code sent to your email.");
      setView('RESET_PASSWORD');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send code.", { duration: 6000 });
    } finally { setLoading(false); }
  }, [resetEmail]);

  const handleResetPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) { toast.error("All fields are required."); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await api.post('auth/reset-password/', { email: resetEmail, otp, new_password: newPassword });
      toast.success(res.data.detail || "Password reset successfully.");
      setView('LOGIN'); setOtp(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password.", { duration: 6000 });
    } finally { setLoading(false); }
  }, [otp, newPassword, confirmPassword, resetEmail]);

  // Input styles
  const inputBaseCls = "w-full h-[46px] pl-10 pr-4 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl outline-none text-[13px] text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 shadow-sm";
  const inputPassCls = "w-full h-[46px] pl-10 pr-10 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl outline-none text-[13px] text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 shadow-sm";

  return (
    <div className="relative min-h-screen lg:h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#edf6fd] to-[#e4f2fd] overflow-x-hidden lg:overflow-hidden font-sans selection:bg-cyan-500/20 selection:text-cyan-800">
      
      {/* ── BACKGROUND FLUID SHAPES & ACCENTS ────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Soft Organic Cyan Fluid Blob - Top Right */}
        <div className="absolute -top-28 -right-28 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-cyan-200/35 via-sky-200/25 to-blue-200/15 blur-3xl" />
        
        {/* Soft Organic Cyan Fluid Blob - Bottom Left */}
        <div className="absolute -bottom-28 -left-28 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-sky-200/40 via-cyan-100/30 to-blue-100/15 blur-3xl" />

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[28rem] rounded-full bg-white/60 blur-3xl" />

        {/* Decorative Dot Matrix in Top Right (Matching Template) */}
        <div className="absolute top-6 right-8 sm:top-10 sm:right-12 grid grid-cols-5 gap-2.5 opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          ))}
        </div>

        {/* Subtle Wave SVG curves in background */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-[240px] opacity-35"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="url(#wave-gradient)"
            d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#cffafe" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── MAIN CONTENT CONTAINER (2 COLUMNS - FITS 100vh) ───── */}
      <div className="relative z-10 w-full max-w-[1300px] h-full lg:max-h-screen mx-auto px-6 sm:px-10 lg:px-12 py-4 lg:py-5 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: HERO SHOWCASE (Proportional Compact Layout)      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[56%] flex flex-col justify-between h-full max-h-[94vh] py-1">
          
          {/* Top Section: Brand + Badge + Headings */}
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 rounded-xl bg-white/80 shadow-sm border border-slate-200/60 backdrop-blur-md">
                <img
                  src="/logo.png?v=3"
                  alt="Hadescore Logo"
                  className="h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-[0_2px_6px_rgba(6,182,212,0.3)]"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-[0.16em] text-slate-900 uppercase leading-none">
                  HADESCORE
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wider mt-1 flex items-center gap-1.5">
                  <span>Learn</span>
                  <span className="text-cyan-500 text-[9px]">•</span>
                  <span>Build</span>
                  <span className="text-cyan-500 text-[9px]">•</span>
                  <span>Grow</span>
                </p>
              </div>
            </div>

            {/* Role / Portal Pill Badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] bg-sky-100/90 text-sky-700 border border-sky-200/90 shadow-sm backdrop-blur-sm">
                <BadgeIcon size={12} className="text-sky-600" />
                <span>{portalConfig.badgeText}</span>
              </span>
            </div>

            {/* Hero Headings */}
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-black text-slate-900 tracking-tight leading-[1.1]">
              {portalConfig.heroLine1} <br />
              <span className="bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#0ea5e9] bg-clip-text text-transparent">
                {portalConfig.heroLine2}
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium max-w-lg mt-1.5 leading-snug line-clamp-2">
              {portalConfig.heroSubtitle}
            </p>
          </div>

          {/* Center: 3D Laptop Isometric Showcase (Auto-Scales Without Overflow) */}
          <div className="relative w-full my-auto py-2 flex items-center justify-center lg:justify-start">
            <motion.div
              className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px] xl:max-w-[430px]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/login_illustration.jpg"
                alt="Hadescore Platform Dashboard"
                className="w-full max-h-[26vh] lg:max-h-[30vh] object-contain drop-shadow-[0_16px_35px_rgba(2,132,199,0.18)] rounded-2xl mx-auto lg:mx-0"
              />
            </motion.div>
          </div>

          {/* Bottom Section: 3 Feature Highlights (Learn, Build, Grow) + Slogan */}
          <div>
            <div className="w-full grid grid-cols-3 gap-3 pt-1">
              {portalConfig.features.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <div className={`p-2 rounded-xl ${item.iconBg} shadow-sm shrink-0 mt-0.5`}>
                      <IconComp size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Script Tagline Accent (Matching Template) */}
            <div className="hidden sm:flex items-center gap-3 mt-3 pt-2 border-t border-slate-200/60 w-full max-w-lg">
              <span className="font-serif italic text-xs text-slate-500 font-medium tracking-wide">
                Better Learning <span className="font-sans not-italic text-cyan-600 font-bold mx-1">→</span> Brighter Future
              </span>
              <div className="flex-1 h-[1px] bg-slate-300/70" />
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: FLOATING CLEAN LOGIN CARD                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[44%] xl:w-[40%] flex items-center justify-center lg:justify-end my-auto">
          <motion.div
            className="w-full max-w-[420px] bg-white/95 rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(2,132,199,0.14),0_8px_20px_-5px_rgba(15,23,42,0.04)] border border-white/90 backdrop-blur-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top Subtle Cyan Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#10b981]" />

            {/* Centered Brand on Card */}
            <div className="text-center mb-4 pt-1">
              <div className="inline-block p-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm mb-2">
                <img
                  src="/logo.png?v=3"
                  alt="Hadescore"
                  className="h-9 w-9 object-contain drop-shadow-[0_2px_6px_rgba(6,182,212,0.22)] mx-auto"
                />
              </div>
              <h3 className="text-base font-black tracking-[0.18em] uppercase text-slate-800 leading-none">
                HADESCORE
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5">
                {view === 'LOGIN' && "Welcome back! Please sign in to continue."}
                {view === 'FORGOT_PASSWORD' && "Enter your admin email to receive an OTP code."}
                {view === 'RESET_PASSWORD' && `Verification code sent to ${resetEmail}`}
              </p>
            </div>

            {/* ── FORMS ── */}
            <AnimatePresence mode="wait">
              
              {/* ── 1. LOGIN FORM ── */}
              {view === 'LOGIN' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  {/* EMAIL ADDRESS */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                          focusedField === 'email' ? 'text-cyan-600' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        autoComplete="email"
                        {...register('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`${inputBaseCls} ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1 pl-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
                        PASSWORD
                      </label>
                      {currentRole === 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => { setView('FORGOT_PASSWORD'); setResetEmail(''); }}
                          className="text-[10px] font-bold text-sky-600 hover:text-cyan-600 transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                          focusedField === 'password' ? 'text-cyan-600' : 'text-slate-400'
                        }`}
                      />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...register('password')}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`${inputPassCls} ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[10px] font-semibold mt-1 pl-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[46px] mt-1.5 rounded-xl text-sm font-bold tracking-wide text-white bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#10b981] hover:brightness-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-cyan-600/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={16} />
                        <span>Sign In</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* ── 2. FORGOT PASSWORD FORM (Super Admin) ── */}
              {view === 'FORGOT_PASSWORD' && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                      ADMIN EMAIL
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your registered admin email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className={inputBaseCls}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[46px] rounded-xl text-sm font-bold tracking-wide text-white bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#10b981] hover:brightness-105 shadow-md shadow-cyan-600/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ChevronRight size={15} />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setView('LOGIN')}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors pt-0.5"
                  >
                    <ArrowLeft size={12} /> Back to Sign In
                  </button>
                </motion.form>
              )}

              {/* ── 3. RESET PASSWORD FORM (Super Admin) ── */}
              {view === 'RESET_PASSWORD' && (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleResetPasswordSubmit}
                  className="space-y-2.5"
                >
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                      VERIFICATION CODE (OTP)
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="reset-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className={`${inputBaseCls} tracking-[0.25em] font-mono text-center font-bold`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="reset-new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputPassCls}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        id="reset-confirm-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputPassCls}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-[46px] mt-1 rounded-xl text-sm font-bold tracking-wide text-white bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#10b981] hover:brightness-105 shadow-md shadow-cyan-600/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ChevronRight size={15} />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setView('LOGIN')}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-sky-600 transition-colors pt-0.5"
                  >
                    <ArrowLeft size={12} /> Cancel & Return
                  </button>
                </motion.form>
              )}

            </AnimatePresence>

          </motion.div>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
