import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getAdminAnalytics, getAdminDashboard } from "../../services/adminApi.js";
import StatCard from "../../components/StatCard.jsx";
import {
    Users, FileText, Download, Eye,
    CheckCircle2, XCircle, Clock, TrendingUp,
} from "lucide-react";

// ── Range selector ────────────────────────────────────────────────────────────

const RANGES = [
    { value: "7d",  label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
];

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-[#ecebf3] bg-white px-3 py-2.5 shadow-lg text-xs">
            <p className="font-semibold text-[#0f0b1f] mb-1.5">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                    <span style={{ color: p.color }}>{p.name}:</span>
                    <span className="font-semibold text-[#0f0b1f] ml-auto pl-3">{p.value}</span>
                </p>
            ))}
        </div>
    );
}

// ── Chart card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, loading }) {
    return (
        <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
            <h3 className="text-sm font-bold text-[#0f0b1f]">{title}</h3>
            {subtitle && <p className="text-xs text-[#a8a3bd] mt-0.5 mb-4">{subtitle}</p>}
            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="h-7 w-7 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="mt-4">{children}</div>
            )}
        </div>
    );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a3bd] mb-3 px-1">
            {children}
        </p>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
    const [range, setRange] = useState("30d");
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingChart, setLoadingChart] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchChart = useCallback(() => {
        setLoadingChart(true);
        getAdminAnalytics(range)
            .then((res) => { if (res.data.success) setChartData(res.data.data); })
            .catch(() => {})
            .finally(() => setLoadingChart(false));
    }, [range]);

    useEffect(() => { fetchChart(); }, [fetchChart]);

    useEffect(() => {
        getAdminDashboard()
            .then((res) => { if (res.data.success) setStats(res.data.data); })
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, []);

    const successRate = stats && stats.transcriptions.total > 0
        ? Math.round((stats.transcriptions.completed / stats.transcriptions.total) * 100)
        : null;

    const formatSeconds = (s) => {
        if (!s) return "0h";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const CHART_COLORS = {
        visitors:       "#7c3aed",
        signups:        "#10b981",
        transcriptions: "#f59e0b",
        downloads:      "#3b82f6",
    };

    const renderAreaChart = (keys) => (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    {keys.map((k) => (
                        <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS[k]} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={CHART_COLORS[k]} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8a3bd" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#a8a3bd" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {keys.map((k) => (
                    <Area
                        key={k}
                        type="monotone"
                        dataKey={k}
                        name={k.charAt(0).toUpperCase() + k.slice(1)}
                        stroke={CHART_COLORS[k]}
                        fill={`url(#grad-${k})`}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );

    const renderBarChart = (keys) => (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={6} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8a3bd" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#a8a3bd" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {keys.map((k) => (
                    <Bar key={k} dataKey={k} name={k.charAt(0).toUpperCase() + k.slice(1)} fill={CHART_COLORS[k]} radius={[3, 3, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Range picker */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-base font-bold text-[#0f0b1f]">Platform Analytics</h2>
                    <p className="text-xs text-[#a8a3bd] mt-0.5">Aggregated metrics across CaptionFlow</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-[#ecebf3] bg-white p-1">
                    {RANGES.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setRange(value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                range === value
                                    ? "bg-[#7c3aed] text-white shadow-sm"
                                    : "text-[#6b6680] hover:bg-[#f5f3ff]"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Platform summary stats ──────────────────────────────────── */}
            <div>
                <SectionLabel>Platform Summary</SectionLabel>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {loadingStats ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl border border-[#ecebf3] bg-white animate-pulse" />
                        ))
                    ) : (
                        <>
                            <StatCard icon={Users} label="Total Users" value={stats?.users.total?.toLocaleString() ?? "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                            <StatCard icon={FileText} label="Total Transcriptions" value={stats?.transcriptions.total?.toLocaleString() ?? "—"} iconBg="#F1F0F5" iconColor="#3f3a52" />
                            <StatCard icon={Download} label="Total Downloads" value={stats?.downloads.total?.toLocaleString() ?? "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                            <StatCard icon={Eye} label="Total Visitors" value={stats?.visitors.total?.toLocaleString() ?? "—"} iconBg="#F1F0F5" iconColor="#3f3a52" />
                        </>
                    )}
                </div>
            </div>

            {/* ── Transcription health ────────────────────────────────────── */}
            <div>
                <SectionLabel>Transcription Health</SectionLabel>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {loadingStats ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl border border-[#ecebf3] bg-white animate-pulse" />
                        ))
                    ) : (
                        <>
                            <StatCard icon={CheckCircle2} label="Completed" value={stats?.transcriptions.completed?.toLocaleString() ?? "—"} iconBg="#ECFDF5" iconColor="#10b981" />
                            <StatCard icon={XCircle} label="Failed" value={stats?.transcriptions.failed?.toLocaleString() ?? "—"} iconBg="#FEF2F2" iconColor="#ef4444" />
                            <StatCard icon={Clock} label="Avg Duration" value={formatSeconds(stats?.transcriptions.averageAudioDuration)} iconBg="#FFFBEB" iconColor="#f59e0b" />
                            <StatCard icon={TrendingUp} label="Success Rate" value={successRate !== null ? `${successRate}%` : "—"} iconBg="#EDE9FE" iconColor="#7c3aed" />
                        </>
                    )}
                </div>
            </div>

            {/* ── Charts ─────────────────────────────────────────────────── */}
            <div>
                <SectionLabel>Daily Trends</SectionLabel>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <ChartCard title="Traffic & Signups" subtitle="Daily visitors and new registrations" loading={loadingChart}>
                        {renderAreaChart(["visitors", "signups"])}
                    </ChartCard>
                    <ChartCard title="Transcriptions & Downloads" subtitle="Daily transcription jobs and file downloads" loading={loadingChart}>
                        {renderAreaChart(["transcriptions", "downloads"])}
                    </ChartCard>
                    <ChartCard title="Activity Volume" subtitle="Combined daily platform activity" loading={loadingChart}>
                        {renderBarChart(["visitors", "transcriptions", "downloads"])}
                    </ChartCard>
                    <ChartCard title="Growth" subtitle="User signups vs. transcription volume" loading={loadingChart}>
                        {renderAreaChart(["signups", "transcriptions"])}
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}
