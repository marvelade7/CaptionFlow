import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users, FileText, Download, Eye,
    CheckCircle2, XCircle, Clock, UploadCloud,
    Shield, ArrowRight, TrendingUp,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import StatCard from "../../components/StatCard.jsx";
import { getAdminDashboard, getAdminAnalytics, getAdminActivity } from "../../services/adminApi.js";
import api from "../../services/api.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSeconds(s) {
    if (!s) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const EVENT_LABELS = {
    USER_REGISTERED: "signed up",
    USER_LOGGED_IN: "logged in",
    USER_LOGOUT: "logged out",
    FILE_UPLOADED: "uploaded a file",
    TRANSCRIPTION_STARTED: "started a transcription",
    TRANSCRIPTION_COMPLETED: "completed a transcription",
    TRANSCRIPTION_FAILED: "had a transcription fail",
    FILE_DOWNLOADED: "downloaded a file",
    SUMMARY_GENERATED: "generated an AI summary",
    EXCERPTS_GENERATED: "generated excerpts",
    ACCOUNT_UPDATED: "updated their account",
};

function eventLabel(eventType) {
    return EVENT_LABELS[eventType] || eventType.toLowerCase().replace(/_/g, " ");
}

// ── Custom chart tooltip ───────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-[#ecebf3] bg-white px-3 py-2.5 shadow-lg text-xs">
            <p className="font-semibold text-[#0f0b1f] mb-1.5">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                    {p.name}: <span className="font-semibold ml-auto pl-3">{p.value}</span>
                </p>
            ))}
        </div>
    );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-[#f1f0f5] mb-4" />
            <div className="h-3 w-24 rounded bg-[#f1f0f5] mb-2" />
            <div className="h-6 w-16 rounded bg-[#ecebf3]" />
        </div>
    );
}

// ── Admin Banner ──────────────────────────────────────────────────────────────

function AdminBanner() {
    return (
        <div className="rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] p-5 text-white flex items-center justify-between gap-4 shadow-[0_4px_24px_rgba(124,58,237,0.25)]">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold">CaptionFlow Administration</p>
                    <p className="text-xs text-white/70 mt-0.5">
                        You have full admin access. Use these tools responsibly.
                    </p>
                </div>
            </div>
            <Link
                to="/dashboard/admin/analytics"
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition px-3 py-1.5 text-xs font-semibold shrink-0"
            >
                Full Analytics <ArrowRight size={13} />
            </Link>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [myTranscriptions, setMyTranscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    useEffect(() => {
        // Platform-wide stats
        getAdminDashboard()
            .then((res) => { if (res.data.success) setStats(res.data.data); })
            .catch(() => {})
            .finally(() => setLoading(false));

        // 30-day trend chart
        getAdminAnalytics("30d")
            .then((res) => { if (res.data.success) setChartData(res.data.data.slice(-14)); })
            .catch(() => {})
            .finally(() => setChartLoading(false));

        // Recent activity
        getAdminActivity({ page: 1, limit: 6 })
            .then((res) => { if (res.data.success) setActivity(res.data.data); })
            .catch(() => {});

        // Admin's own personal transcriptions
        api.get("/transcriptions")
            .then((res) => { if (res.data.success) setMyTranscriptions(res.data.data); })
            .catch(() => {});
    }, []);

    const successRate = stats
        ? stats.transcriptions.total > 0
            ? Math.round((stats.transcriptions.completed / stats.transcriptions.total) * 100)
            : 0
        : null;

    const myCompleted = myTranscriptions.filter((t) => t.status === "completed").length;
    const myTotalSeconds = myTranscriptions.reduce((s, t) => s + (t.duration || 0), 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Admin banner */}
            <AdminBanner />

            {/* ── Platform-wide stats ────────────────────────────────────── */}
            <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a8a3bd] mb-3 px-1">
                    CaptionFlow Overview
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        <>
                            <StatCard icon={Users} label="Total Users" value={stats?.users.total?.toLocaleString() ?? "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                            <StatCard icon={FileText} label="Total Transcriptions" value={stats?.transcriptions.total?.toLocaleString() ?? "—"} iconBg="#F1F0F5" iconColor="#3f3a52" />
                            <StatCard icon={Download} label="Total Downloads" value={stats?.downloads.total?.toLocaleString() ?? "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                            <StatCard icon={Eye} label="Total Visitors" value={stats?.visitors.total?.toLocaleString() ?? "—"} iconBg="#F1F0F5" iconColor="#3f3a52" />
                            <StatCard icon={CheckCircle2} label="Completed" value={stats?.transcriptions.completed?.toLocaleString() ?? "—"} iconBg="#ECFDF5" iconColor="#10b981" />
                            <StatCard icon={XCircle} label="Failed" value={stats?.transcriptions.failed?.toLocaleString() ?? "—"} iconBg="#FEF2F2" iconColor="#ef4444" />
                            <StatCard icon={Clock} label="Processing" value={stats?.transcriptions.processing?.toLocaleString() ?? "—"} iconBg="#FFFBEB" iconColor="#f59e0b" />
                            <StatCard icon={TrendingUp} label="Success Rate" value={successRate !== null ? `${successRate}%` : "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                        </>
                    )}
                </div>
            </div>

            {/* ── My personal stats ──────────────────────────────────────── */}
            <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a8a3bd] mb-3 px-1">
                    My Activity
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard icon={UploadCloud} label="My Uploads" value={myTranscriptions.length.toLocaleString()} iconBg="#EDE9FE" iconColor="#7c3aed" />
                    <StatCard icon={CheckCircle2} label="My Completed" value={myCompleted.toLocaleString()} iconBg="#ECFDF5" iconColor="#10b981" />
                    <StatCard icon={Clock} label="My Audio Processed" value={formatSeconds(myTotalSeconds)} iconBg="#F1F0F5" iconColor="#3f3a52" />
                </div>
            </div>

            {/* ── 30-day trend chart + recent activity ──────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                {/* Chart */}
                <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-bold text-[#0f0b1f]">30-Day Trends</h3>
                            <p className="text-xs text-[#a8a3bd] mt-0.5">Visitors, signups, and transcriptions</p>
                        </div>
                        <Link to="/dashboard/admin/analytics" className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9]">
                            Full analytics →
                        </Link>
                    </div>

                    {chartLoading ? (
                        <div className="h-52 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-sm text-[#a8a3bd]">
                            No trend data yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gTranscriptions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8a3bd" }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fontSize: 11, fill: "#a8a3bd" }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#7c3aed" fill="url(#gVisitors)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="signups" name="Signups" stroke="#10b981" fill="url(#gSignups)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="transcriptions" name="Transcriptions" stroke="#f59e0b" fill="url(#gTranscriptions)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-[#0f0b1f]">Recent Activity</h3>
                        <Link to="/dashboard/admin/activity" className="text-xs font-semibold text-[#7c3aed] hover:text-[#6d28d9]">
                            View all →
                        </Link>
                    </div>
                    {activity.length === 0 ? (
                        <p className="text-sm text-[#a8a3bd] text-center py-8">No activity yet.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-[#f5f3ff]">
                            {activity.map((log) => {
                                const name = log.user
                                    ? `${log.user.firstName} ${log.user.lastName}`
                                    : "Unknown";
                                return (
                                    <div key={log._id} className="py-3 flex items-start gap-3">
                                        <div className="h-7 w-7 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-[#7c3aed]">
                                                {name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-[#0f0b1f] leading-snug">
                                                <span className="font-semibold">{name}</span>{" "}
                                                {eventLabel(log.eventType)}
                                            </p>
                                            <p className="text-[11px] text-[#a8a3bd] mt-0.5">
                                                {formatDate(log.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quick links ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { to: "/dashboard/admin/analytics", label: "Analytics" },
                    { to: "/dashboard/admin/users", label: "Users" },
                    { to: "/dashboard/admin/transcriptions", label: "Transcriptions" },
                    { to: "/dashboard/admin/activity", label: "Activity" },
                    { to: "/dashboard/admin/errors", label: "Errors" },
                    { to: "/dashboard/upload", label: "New Upload" },
                ].map(({ to, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-[#ecebf3] bg-white py-3 px-3 text-xs font-semibold text-[#3f3a52] hover:bg-[#f5f3ff] hover:text-[#7c3aed] hover:border-[#d4c8f7] transition-colors text-center"
                    >
                        {label} <ArrowRight size={12} />
                    </Link>
                ))}
            </div>
        </div>
    );
}
