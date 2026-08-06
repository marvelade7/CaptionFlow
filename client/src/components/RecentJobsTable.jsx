import { Link } from "react-router-dom";

const STATUS_MAP = {
    uploaded:   { label: "Uploaded",   style: "bg-blue-50 text-blue-500" },
    queued:     { label: "Queued",     style: "bg-amber-50 text-amber-500" },
    processing: { label: "Processing", style: "bg-[#f5f3ff] text-[#7c3aed]" },
    completed:  { label: "Completed",  style: "bg-emerald-50 text-emerald-600" },
    failed:     { label: "Failed",     style: "bg-red-50 text-red-500" },
};

function formatDuration(seconds) {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function RecentJobsTable({ jobs = [], loading = false }) {
    return (
        <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0f0b1f]">Recent Transcription Jobs</h2>
                <Link
                    to="/dashboard/my-files"
                    className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9]"
                >
                    View All
                </Link>
            </div>

            <table className="mt-5 w-full text-left text-sm">
                <thead>
                    <tr className="text-xs uppercase tracking-wide text-[#a8a3bd]">
                        <th className="pb-3 font-semibold">File Name</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Duration</th>
                        <th className="pb-3 font-semibold">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} className="border-t border-[#ecebf3]">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <td key={j} className="py-4">
                                        <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-[#ecebf3]" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : jobs.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="py-10 text-center text-sm text-[#a8a3bd]"
                            >
                                No transcription jobs yet. Upload a file to get started!
                            </td>
                        </tr>
                    ) : (
                        jobs.map((job) => {
                            const statusInfo = STATUS_MAP[job.status] ?? {
                                label: job.status,
                                style: "bg-[#f1f0f5] text-[#6b6680]",
                            };
                            return (
                                <tr key={job._id} className="border-t border-[#ecebf3]">
                                    <td
                                        className="max-w-[220px] truncate py-4 font-medium text-[#0f0b1f]"
                                        title={job.originalFileName}
                                    >
                                        {job.originalFileName}
                                    </td>
                                    <td className="py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.style}`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="py-4 text-[#6b6680]">
                                        {formatDuration(job.duration)}
                                    </td>
                                    <td className="py-4 text-[#6b6680]">
                                        {formatDate(job.createdAt)}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

