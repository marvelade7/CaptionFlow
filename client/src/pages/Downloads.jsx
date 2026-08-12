import { useEffect, useState, useCallback } from 'react';
import logo from '../assets/captionFlowLogo22.png';
import {
    Download, FileText, File, Sparkles, RefreshCw,
    Loader2, AlertTriangle, Check, Copy, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../services/api';
import { generateSrt, generateAss } from '../utils/subtitleHelpers';
import toast from 'react-hot-toast';

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

function downloadAIAsTxt(aiResult, baseName) {
    const blob = new Blob([buildAITextContent(aiResult)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}-AI-Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadAIAsPdf(aiResult, baseName) {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(buildAITextContent(aiResult), 170);
    let y = 20;
    for (let i = 0; i < splitText.length; i++) {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(splitText[i], 20, y);
        y += 7;
    }
    doc.save(`${baseName}-AI-Summary.pdf`);
}

// ─── AI Modal ─────────────────────────────────────────────────────────────────
function AIModal({ job, onClose }) {
    const baseName = job.originalFileName?.split(".")[0] || "transcript";
    const hasExisting = job.summary?.text && job.excerpts?.items?.length;

    const [status, setStatus]   = useState(hasExisting ? "completed" : "idle");
    const [aiResult, setResult] = useState(hasExisting ? { summary: job.summary, excerpts: job.excerpts } : null);
    const [error, setError]     = useState("");
    const [copied, setCopied]   = useState({});

    // Close on Escape key
    const handleKey = useCallback((e) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [handleKey]);

    const generate = () => {
        setStatus("generating");
        setError("");
        api.post(`/ai-summary/${job._id}/generate-summary`)
            .then((res) => {
                setResult(res.data);
                setStatus("completed");
                toast.success("AI Summary & Key Points generated!");
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Failed to generate AI content.";
                setError(msg);
                setStatus("failed");
                toast.error(msg);
            });
    };

    const copyText = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(prev => ({ ...prev, [id]: true }));
        setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
    };

    const copyAll = () => {
        if (!aiResult?.excerpts?.items) return;
        const text = aiResult.excerpts.items.map((item, i) => `${i + 1}. ${item}`).join("\n\n");
        copyText(text, "all");
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(15,11,31,0.5)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Modal card */}
            <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-[0_24px_64px_rgba(15,11,31,0.18)] overflow-hidden">

                {/* ── Header */}
                <div className="flex items-center justify-between border-b border-[#ecebf3] px-6 py-4 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <img src={logo} alt="CaptionFlow" className="h-8 w-auto shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0f0b1f] truncate max-w-[340px]" title={job.originalFileName}>
                                {job.originalFileName}
                            </p>
                            <p className="text-xs text-[#a8a3bd]">AI Summary & Key Excerpts</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 shrink-0 rounded-full p-1.5 text-[#a8a3bd] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-6">

                    {/* Idle */}
                    {status === "idle" && (
                        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f3ff]">
                                <Sparkles size={26} className="text-[#7c3aed]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0f0b1f]">No AI results yet</p>
                                <p className="mt-1 text-xs text-[#6b6680] max-w-xs">
                                    Generate a concise summary and key points from this transcript using AI.
                                </p>
                            </div>
                            <button
                                onClick={generate}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                            >
                                <Sparkles size={15} /> Generate Summary & Key Excerpts
                            </button>
                        </div>
                    )}

                    {/* Generating */}
                    {status === "generating" && (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
                            <p className="text-sm font-semibold text-[#0f0b1f]">Analyzing your transcript…</p>
                            <p className="text-xs text-[#6b6680]">This may take a few moments.</p>
                        </div>
                    )}

                    {/* Error */}
                    {status === "failed" && (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <AlertTriangle size={28} className="text-red-400" />
                            <p className="text-sm font-semibold text-red-600">Generation failed</p>
                            <p className="text-xs text-red-500 max-w-xs">{error}</p>
                            <button
                                onClick={generate}
                                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200 transition"
                            >
                                <RefreshCw size={14} /> Try Again
                            </button>
                        </div>
                    )}

                    {/* Completed */}
                    {status === "completed" && aiResult && (
                        <div className="flex flex-col gap-6">
                            {/* Summary block */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-[#0f0b1f]">AI Summary</h3>
                                    <button
                                        onClick={() => copyText(aiResult.summary?.text, "summary")}
                                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                    >
                                        {copied["summary"] ? <Check size={12} /> : <Copy size={12} />}
                                        {copied["summary"] ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <p className="text-sm text-[#3f3a52] leading-relaxed whitespace-pre-wrap rounded-xl border border-[#ecebf3] bg-[#fafaf9] p-4">
                                    {aiResult.summary?.text}
                                </p>
                            </div>

                            {/* Key Points */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-[#0f0b1f]">Key Excerpts</h3>
                                    <button
                                        onClick={copyAll}
                                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                    >
                                        {copied["all"] ? <Check size={12} /> : <Copy size={12} />}
                                        {copied["all"] ? "Copied All" : "Copy All"}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {aiResult.excerpts?.items?.map((point, idx) => (
                                        <div key={idx} className="group relative flex items-start gap-3 rounded-xl border border-[#ecebf3] bg-white p-3.5">
                                            <span className="text-xs font-bold text-[#7c3aed] mt-0.5 shrink-0">{idx + 1}.</span>
                                            <p className="text-sm text-[#3f3a52] leading-relaxed pr-7">{point}</p>
                                            <button
                                                onClick={() => copyText(point, `pt_${idx}`)}
                                                className="absolute top-3 right-3 p-1 rounded text-[#a8a3bd] hover:text-[#7c3aed] hover:bg-[#f5f3ff] opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                                                title="Copy"
                                            >
                                                {copied[`pt_${idx}`] ? <Check size={12} className="text-[#7c3aed]" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer actions (only when completed or after first attempt) */}
                {(status === "completed" || status === "failed") && (
                    <div className="shrink-0 flex flex-wrap items-center gap-2 border-t border-[#ecebf3] bg-[#fcfbfe] px-6 py-4">
                        {status === "completed" && (
                            <>
                                <button
                                    onClick={() => downloadAIAsTxt(aiResult, baseName)}
                                    className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] bg-white px-3 py-2 text-xs font-semibold text-[#3f3a52] hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                >
                                    <FileText size={13} /> Download TXT
                                </button>
                                <button
                                    onClick={() => downloadAIAsPdf(aiResult, baseName)}
                                    className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] bg-white px-3 py-2 text-xs font-semibold text-[#3f3a52] hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                >
                                    <File size={13} /> Download PDF
                                </button>
                            </>
                        )}
                        <button
                            onClick={generate}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#7c3aed] hover:bg-[#ede9fe] transition ml-auto"
                        >
                            <RefreshCw size={13} /> Regenerate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Downloads Page ───────────────────────────────────────────────────
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
