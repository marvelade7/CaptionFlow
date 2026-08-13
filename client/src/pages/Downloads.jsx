import { useEffect, useState } from 'react';
import {
    Download, FileText, Sparkles, X
} from 'lucide-react';
import api from '../services/api';
import { generateSrt, generateAss } from '../utils/subtitleHelpers';
import toast from 'react-hot-toast';
import AIModal from '../components/AIModal';

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildAITextContent(aiResult) {
    if (!aiResult) return "";
    let content = "AI Summary:\n" + (aiResult.summary?.text || "") + "\n\n";
    content += "Key Points:\n";
    aiResult.excerpts?.items?.forEach((item, i) => {
        content += `${i + 1}. ${item}\n\n`;
    });
    return content;
}


export default function Downloads() {
    const [transcriptions, setTranscriptions] = useState([]);
    const [loading, setLoading]               = useState(true);
    const [activeModal, setActiveModal]       = useState(null); // job object or null

    useEffect(() => {
        api.get("/transcriptions")
            .then((res) => {
                if (res.data.success) {
                    setTranscriptions(res.data.data.filter(t => t.status === "completed"));
                }
            })
            .catch((err) => console.error("Failed to load transcriptions:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = (job, format) => {
        let content = "";
        if (format === "txt") content = job.transcript;
        else if (format === "srt") content = generateSrt(job.segments);
        else if (format === "ass") content = generateAss(job.segments);

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job.originalFileName.split(".")[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* ── Modal */}
            {activeModal && (
                <AIModal job={activeModal} onClose={() => setActiveModal(null)} />
            )}

            {/* ── Page card */}
            <div
                className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]"
                data-aos="fade-up"
            >
                <h2 className="text-lg font-bold text-[#0f0b1f]">Downloads</h2>
                <p className="mt-1 text-xs text-[#6b6680]">
                    Download your transcripts or generate AI summaries for any completed file.
                </p>

                <div className="mt-5 flex flex-col divide-y divide-[#ecebf3]">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-[#a8a3bd]">Loading downloads…</div>
                    ) : transcriptions.length === 0 ? (
                        <div className="py-8 text-center text-sm text-[#a8a3bd]">
                            No completed transcriptions available to download yet.
                        </div>
                    ) : (
                        transcriptions.map((job, idx) => (
                            <div
                                key={job._id}
                                data-aos="fade-up"
                                data-aos-delay={idx * 60}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4"
                            >
                                {/* File info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f3ff]">
                                        <FileText size={16} className="text-[#7c3aed]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className="text-sm font-medium text-[#0f0b1f] max-w-[180px] sm:max-w-[260px] md:max-w-[360px] truncate"
                                            title={job.originalFileName}
                                        >
                                            {job.originalFileName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-[#a8a3bd]">{formatDate(job.createdAt)}</p>
                                            {job.summary?.text && (
                                                <span className="rounded-full bg-[#f0eeff] px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
                                                    AI ready
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
                                    {/* Transcript downloads */}
                                    {["srt", "txt", "ass"].map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => handleDownload(job, fmt)}
                                            className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] px-3 py-1.5 text-xs font-semibold text-[#3f3a52] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                                        >
                                            <Download size={13} />
                                            {fmt.toUpperCase()}
                                        </button>
                                    ))}

                                    {/* AI Summary button */}
                                    <button
                                        onClick={() => setActiveModal(job)}
                                        className="flex items-center gap-1.5 rounded-lg border border-[#e0dbf7] bg-[#f5f3ff] px-3 py-1.5 text-xs font-semibold text-[#7c3aed] transition hover:bg-[#ede9fe] hover:border-[#c4b5fd]"
                                    >
                                        <Sparkles size={13} />
                                        {job.summary?.text ? "View Summary & Key Excerpts" : "AI Summary"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
