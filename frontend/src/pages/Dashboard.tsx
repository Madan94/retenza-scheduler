import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Template {
  id: string;
  name: string;
  content: string;
  channel: string;
  isAiGenerated?: boolean;
}

interface Schedule {
  id: string;
  recipient: string;
  scheduledAt: string;
  status: string;
  recurring: boolean;
  recurrenceInterval: string | null;
  recurrenceValue: number | null;
  recurrenceUnit: string | null;
  lastSentAt: string | null;
  template?: { name: string; channel: string };
}

function formatInterval(schedule: Schedule) {
  if (!schedule.recurring) return "";
  if (schedule.recurrenceInterval === "custom") {
    return `Every ${schedule.recurrenceValue} ${schedule.recurrenceUnit}`;
  }
  const labels: Record<string, string> = {
    hourly: "Every hour",
    daily: "Every day",
    weekly: "Every week",
    monthly: "Every month",
  };
  return labels[schedule.recurrenceInterval ?? ""] ?? schedule.recurrenceInterval;
}

function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const templatesRes = await api.get("/templates");
      const schedulesRes = await api.get("/schedules");
      setTemplates(templatesRes.data);
      setSchedules(schedulesRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelSchedule = async (id: string) => {
    if (!confirm("Stop this recurring schedule?")) return;
    try {
      await api.patch(`/schedules/${id}/cancel`);
      fetchData();
    } catch (err) {
      alert("Failed to cancel schedule");
    }
  };

  const activeSchedules = schedules.filter((s) => s.status === "active").length;
  const sentMessages = schedules.filter((s) => s.status === "sent").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Welcome Section */}
      <div className="text-center py-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
          Automate messaging with <span className="text-brand-gold">intelligent templates</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Create structured notification templates, draft automatically with Gemini AI, and schedule reliable deliveries across Email and Telegram channels.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/schedule"
            className="px-6 py-3 font-semibold rounded-xl bg-brand-gold text-slate-950 hover:bg-brand-gold-hover transition-all shadow-sm flex items-center gap-2"
          >
            Schedule Message →
          </Link>
          <Link
            to="/template"
            className="px-6 py-3 font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            Manage Templates
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Templates</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">{templates.length}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Schedules</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">{activeSchedules}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Messages Sent</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">{sentMessages}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Templates */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Message Templates</h2>
            <Link
              to="/template"
              className="text-sm font-semibold text-slate-900 hover:text-brand-gold flex items-center gap-1 transition-colors"
            >
              + Create New
            </Link>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                No templates created yet. Get started by drafting one.
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 p-5 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-bold text-slate-900 tracking-tight">{template.name}</span>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {template.isAiGenerated && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-brand-gold border border-amber-500/20">
                          ⚡ AI
                        </span>
                      )}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        template.channel === "telegram"
                          ? "bg-sky-50 text-sky-600 border border-sky-100"
                          : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      }`}>
                        {template.channel}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium mb-1 line-clamp-3">
                    {template.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Messages */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Scheduled Queue</h2>
            <Link
              to="/schedule"
              className="text-sm font-semibold text-slate-900 hover:text-brand-gold flex items-center gap-1 transition-colors"
            >
              + Add Schedule
            </Link>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {schedules.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                No active schedules in queue. Schedule your first alert.
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-slate-50/50 border border-slate-100 p-5 rounded-xl space-y-3 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {schedule.template?.name ?? "Custom Message"}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        To: <span className="font-mono text-slate-700">{schedule.recipient}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        schedule.status === "active"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : schedule.status === "sent"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : schedule.status === "cancelled"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-500 font-medium pt-1 border-t border-slate-100/60">
                    <p className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Next Run:</span>
                      {new Date(schedule.scheduledAt).toLocaleString()}
                    </p>
                    {schedule.recurring && (
                      <p className="text-blue-600 font-semibold flex items-center gap-1">
                        <span>🔄 Recurring:</span>
                        {formatInterval(schedule)}
                      </p>
                    )}
                    {schedule.lastSentAt && (
                      <p className="text-[10px] text-slate-400">
                        Last Run: {new Date(schedule.lastSentAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {schedule.recurring && schedule.status !== "cancelled" && schedule.status !== "sent" && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => cancelSchedule(schedule.id)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors cursor-pointer"
                      >
                        Stop Recurring Schedule
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
