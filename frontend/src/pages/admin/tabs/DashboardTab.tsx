import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import api from "../../../services/api";
import {
  Users,
  BookOpen,
  RefreshCw,
  Activity,
  Clock,
  Layers,
  FileCheck,
  Video,
  ChevronRight,
  TrendingUp,
  Shield,
  Calendar,
  Quote,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { formatDisplayDate } from "../../../utils/dateTimeUtils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";


interface AuditLog {
  id: number;
  user: string;
  action: string;
  ip_address?: string;
  created_at: string;
}

interface AdminStats {
  pending_assignments: number;
  total_staff: number;
  active_staff: number;
  total_students: number;
  active_students?: number;
  expired_students?: number;
  total_courses: number;
  published_courses?: number;
  draft_courses?: number;
  total_categories?: number;
  total_lessons?: number;
  total_videos?: number;
  total_assignments?: number;
  total_quizzes?: number;
  certificates_issued?: number;
  attendance_percentage?: number;
  daily_logins?: number;
  weekly_logins?: number;
  monthly_logins?: number;
  live_classes_today?: number;
  storage_usage?: string;
  recent_activity: AuditLog[];
  live_classes_trend?: { date: string; count: number }[];
  platform_activity_trend?: { date: string; count: number }[];
  upcoming_sessions?: {
    id: number;
    title: string;
    scheduled_time: string;
    meeting_url: string;
  }[];
  total_live_classes?: number;
}

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const color = payload[0].stroke && payload[0].stroke !== 'none' ? payload[0].stroke : payload[0].fill;
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg flex flex-col gap-1.5 z-50">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-bold text-foreground">{payload[0].value} <span className="text-[10px] text-muted-foreground font-medium uppercase">{payload[0].name}</span></span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const [liveMode, setLiveMode] = React.useState(
    localStorage.getItem("super_adminLiveMode") === "true",
  );

  React.useEffect(() => {
    const handleStorage = () => {
      setLiveMode(localStorage.getItem("super_adminLiveMode") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const { data: stats, refetch } = useQuery<AdminStats>({
    queryKey: ["admin-dashboard-stats", liveMode],
    enabled: Boolean(accessToken && user),
    queryFn: async () => {
      const res = await api.get(`analytics/dashboard/?live_mode=${liveMode}`);
      return res.data;
    },
    placeholderData: (prev) => prev,
    refetchInterval: accessToken ? 8000 : false,
  });


  const cards = liveMode
    ? [
        {
          label: "Mentors",
          count: stats?.total_staff ?? 0,
          sub: `${stats?.active_staff ?? 0} active`,
          icon: Users,
          iconBg: "bg-indigo-50 text-indigo-600",
          tab: "staff",
        },
        {
          label: "Students",
          count: stats?.total_students ?? 0,
          sub: `${stats?.active_students ?? 0} active`,
          icon: Users,
          iconBg: "bg-sky-50 text-sky-600",
          tab: "students",
        },
        {
          label: "Live Sessions",
          count: stats?.total_live_classes ?? stats?.live_classes_today ?? 0,
          sub: `${stats?.live_classes_today ?? 0} scheduled today`,
          icon: Video,
          iconBg: "bg-amber-50 text-amber-600",
          tab: "live",
        },
      ]
    : [
        {
          label: "COURSES",
          count: stats?.total_courses ?? 0,
          sub: `${stats?.total_categories ?? 0} Categories`,
          icon: BookOpen,
          iconBg: "bg-[#e6fbf4] text-[#00a884]",
          tab: "courses",
        },
        {
          label: "STUDENTS",
          count: stats?.total_students ?? 0,
          sub: `${stats?.active_students ?? 0} Active`,
          icon: Users,
          iconBg: "bg-sky-50 text-sky-600",
          tab: "students",
        },
        {
          label: "CONTENT",
          count: stats?.total_lessons ?? 0,
          sub: `${stats?.total_videos ?? 0} Video resources`,
          icon: Layers,
          iconBg: "bg-purple-50 text-purple-600",
          tab: "courses",
        },
        {
          label: "CERTIFICATES",
          count: stats?.certificates_issued ?? 0,
          sub: `${stats?.pending_assignments ?? 0} Pending`,
          icon: FileCheck,
          iconBg: "bg-amber-50 text-amber-600",
          tab: "certificates",
        },
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-4 text-xs pb-6">
      {/* Top Hero Greeting Card (Sample UI Mockup) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#e2eded] shadow-sm relative overflow-hidden"
      >
        {/* Left: Shield Emblem & Title */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#e6fbf4] text-[#00a884] border border-[#bbf7e2] shrink-0">
            <Shield size={28} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 leading-tight">
              {liveMode ? "Live Command Center" : "Platform Command Center"}
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              {liveMode ? "Real-time Live Sessions & Attendance" : "Course Analytics & Content Engine"}
            </p>
          </div>
        </div>

        {/* Right: Date Pill & Quote (Sample UI Mockup) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date pill */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-slate-700">
            <Calendar size={18} className="text-[#009e86]" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">
                {formatDisplayDate(new Date())}
              </p>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>
          </div>

          {/* Inspirational Quote Pill */}
          <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-2xl bg-[#f0fdf9] border border-[#bbf7e2] shadow-sm max-w-xs">
            <Quote size={16} className="text-[#009e86] shrink-0 mt-0.5 rotate-180" />
            <div>
              <p className="text-[11px] italic font-medium text-slate-700 leading-tight">
                “Small steps every day lead to big results.”
              </p>
              <div className="w-6 h-0.5 bg-[#009e86] rounded-full mt-1.5" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {/* Top Stats Row (Sample UI Mockup Style) */}
        <div className={`grid flex-none gap-3 sm:grid-cols-2 ${liveMode ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {cards.map((c, i) => (
            <motion.div
              variants={itemVariants}
              key={i}
              onClick={() => onNavigate(c.tab)}
              className="rounded-2xl border border-[#e2eded] bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all cursor-pointer flex flex-col justify-between h-[106px] group"
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${c.iconBg} shadow-sm shrink-0`}>
                    <c.icon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {c.label}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">
                      {c.count}
                    </h3>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all mt-1" />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px]">
                <span className="text-slate-500 font-medium">{c.sub}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <span>↑</span>
                  <span>+0%</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard Grid Area */}
        <div className="grid gap-4 lg:grid-cols-12">
          
          {/* Main Chart */}
          <motion.div 
            variants={itemVariants} 
            className={`${liveMode ? "lg:col-span-12" : "lg:col-span-8"} rounded-2xl border border-border bg-card shadow-sm p-4 flex flex-col relative overflow-hidden h-[360px]`}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <TrendingUp size={16} className="text-muted-foreground" />
                  <span>{liveMode ? "Daily Active Mentees" : "Platform Content Distribution"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {liveMode ? "Active student logins recorded over the last 7 days" : "Breakdown of educational resources across the platform"}
                </p>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {liveMode ? (
                  <BarChart data={stats?.live_classes_trend || []}>
                    <defs>
                      <linearGradient id="grad0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#4f46e5" /></linearGradient>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#0891b2" /></linearGradient>
                      <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                      <linearGradient id="grad4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
                      <linearGradient id="grad5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
                      <linearGradient id="grad6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      allowDecimals={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }} />
                    <Bar 
                      dataKey="count" 
                      name="Active Students"
                      radius={[6, 6, 0, 0]} 
                      barSize={32}
                      fill="hsl(var(--primary))"
                    >
                      {(stats?.live_classes_trend || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad${index % 7})`} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={[
                    { name: 'Categories', value: stats?.total_categories || 0 },
                    { name: 'Courses', value: stats?.total_courses || 0 },
                    { name: 'Lessons', value: stats?.total_lessons || 0 },
                    { name: 'Videos', value: stats?.total_videos || 0 },
                    { name: 'Quizzes', value: stats?.total_quizzes || 0 },
                    { name: 'Assignments', value: stats?.total_assignments || 0 },
                  ]}>
                    <defs>
                      <linearGradient id="cGrad0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#4f46e5" /></linearGradient>
                      <linearGradient id="cGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
                      <linearGradient id="cGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#0891b2" /></linearGradient>
                      <linearGradient id="cGrad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                      <linearGradient id="cGrad4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
                      <linearGradient id="cGrad5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      allowDecimals={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }} />
                    <Bar 
                      dataKey="value" 
                      name="Resources"
                      radius={[6, 6, 0, 0]} 
                      barSize={36}
                    >
                      {[
                        { name: 'Categories', value: stats?.total_categories || 0 },
                        { name: 'Courses', value: stats?.total_courses || 0 },
                        { name: 'Lessons', value: stats?.total_lessons || 0 },
                        { name: 'Videos', value: stats?.total_videos || 0 },
                        { name: 'Quizzes', value: stats?.total_quizzes || 0 },
                        { name: 'Assignments', value: stats?.total_assignments || 0 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#cGrad${index % 6})`} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
              <style>{`.recharts-surface { border: none !important; outline: none !important; }`}</style>
            </div>
          </motion.div>

          {/* Right Sidebar Area (Only visible in Course mode) */}
          {!liveMode && (
            <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm p-4 flex flex-col h-[360px]">
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-border flex-none">
                  <Activity size={18} className="text-muted-foreground" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">System Health</h3>
                    <p className="text-[10px] text-muted-foreground">Active Database Monitoring</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 justify-center overflow-y-auto scrollbar-none">
                  {[
                    { label: "Categories", value: stats?.total_categories ?? 0, icon: Layers },
                    { label: "Quizzes", value: stats?.total_quizzes ?? 0, icon: Activity },
                    { label: "Assignments", value: stats?.total_assignments ?? 0, icon: FileCheck },
                  ].map((mini, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <mini.icon size={16} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">
                          {mini.label}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-foreground">
                        {mini.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default DashboardTab;
