import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    UploadCloud, FileAudio, FileVideo, CheckCircle2,
    XCircle, Loader2, Copy, Check, AlertTriangle, X, Download,
    Sparkles, RefreshCw, FileText, File
} from "lucide-react";
import jsPDF from "jspdf";
import api from "../services/api";
import toast from "react-hot-toast";
import { generateSrt, generateAss } from "../utils/subtitleHelpers";

// ─── Constants ───────────────────────────────────────────────────────────────
const ACCEPTED = ["mp3", "wav", "m4a", "flac", "mp4", "mov", "mkv", "webm"];
const MAX_BYTES = 300 * 1024 * 1024; // 300 MB
const AUDIO_EXTS = ["mp3", "wav", "m4a", "flac"];
const POLL_INTERVAL = 3000; // ms

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(b) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

function fileExt(name) {
    return name.split(".").pop().toLowerCase();
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function FormatBadge({ fmt }) {
    return (
        <span className="rounded-lg border border-[#ecebf3] bg-[#f9f8fc] px-2.5 py-1 text-xs font-semibold text-[#6b6680]">
            {fmt.toUpperCase()}
        </span>
    );
}

function StatusBadge({ status }) {
    const map = {
        uploaded:   { label: "Uploaded",   cls: "bg-blue-50 text-blue-600 border-blue-100" },
        queued:     { label: "Queued",      cls: "bg-yellow-50 text-yellow-600 border-yellow-100" },
        processing: { label: "Processing…", cls: "bg-purple-50 text-[#7c3aed] border-purple-100" },
        completed:  { label: "Completed",   cls: "bg-green-50 text-green-600 border-green-100" },
        failed:     { label: "Failed",      cls: "bg-red-50 text-red-500 border-red-100" },
    };
    const { label, cls } = map[status] || map.uploaded;
    return (
        <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cls}`}>
            {label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Upload() {
    const inputRef = useRef(null);
    const location = useLocation();
    const [dragging, setDragging] = useState(false);
    const [file, setFile]         = useState(null);   // selected File object
    const [error, setError]       = useState("");

    // Upload flow
    const [uploading, setUploading]   = useState(false);
    const [uploadPct, setUploadPct]   = useState(0);
    const [jobId, setJobId]           = useState(null);  // saved transcription _id

    // Polling result
    const [job, setJob]               = useState(null);  // full transcription object
    const [copied, setCopied]         = useState(false);

    // AI Summary flow
    const [aiStatus, setAiStatus]     = useState("idle"); // idle | generating | completed | failed
    const [aiResult, setAiResult]     = useState(null);
    const [aiError, setAiError]       = useState("");
    const [aiCopiedStates, setAiCopiedStates] = useState({});

    // ── File validation ───────────────────────────────────────────────────────
    const validate = useCallback((f) => {
        if (!f) return "No file selected.";
        const ext = fileExt(f.name);
        if (!ACCEPTED.includes(ext)) return `Unsupported format. Allowed: ${ACCEPTED.join(", ")}`;
        if (f.size > MAX_BYTES) return `File is too large (max ${formatBytes(MAX_BYTES)}).`;
        return "";
    }, []);

    // Handle preloaded file from landing page
    useEffect(() => {
        if (location.state?.pendingFile) {
            const pending = location.state.pendingFile;
            const err = validate(pending);
            if (!err) {
                setFile(pending);
                toast.success(`Loaded "${pending.name}" ready for upload!`, { id: "preload-file" });
            } else {
                setError(err);
            }
        }
    }, [location.state, validate]);

    const pick = (f) => {
        const msg = validate(f);
        setError(msg);
        setFile(msg ? null : f);
        setJob(null);
        setJobId(null);
    };

    // ── Drag-and-drop ────────────────────────────────────────────────────────
    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files[0]);
    };

    // ── Upload ────────────────────────────────────────────────────────────────
    const handleUpload = () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setUploadPct(0);
        setError("");

        api.post("/transcriptions/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploadPct(pct);
            },
        })
            .then((res) => {
                if (res.data.success) {
                    setJobId(res.data.data._id);
                    setJob(res.data.data);
                    toast.success("File uploaded! Transcription started…");
                }
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Upload failed.";
                setError(msg);
                toast.error(msg);
            })
            .finally(() => setUploading(false));
    };

    // ── Polling ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!jobId || job?.status === "completed" || job?.status === "failed") return;

        const interval = setInterval(() => {
            api.get(`/transcriptions/${jobId}`)
                .then((res) => {
                    if (res.data.success) setJob(res.data.data);
                })
                .catch(() => clearInterval(interval));
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [jobId, job?.status]);

    // ── Sync AI State ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (job && job.status === "completed") {
            if (job.summary?.text && job.excerpts?.items?.length) {
                setAiResult({ summary: job.summary, excerpts: job.excerpts });
                setAiStatus("completed");
            } else if (job.aiProcessingStatus === "failed") {
                setAiStatus("failed");
                setAiError("Previous AI generation failed.");
            }
        }
    }, [job]);

    // ── AI Generation & Download ──────────────────────────────────────────────
    const generateAI = () => {
        if (!jobId) return;
        setAiStatus("generating");
        setAiError("");

        api.post(`/ai-summary/${jobId}/generate-summary`)
            .then((res) => {
                setAiResult(res.data);
                setAiStatus("completed");
                toast.success("AI Summary & Excerpts generated!");
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Failed to generate AI content.";
                setAiError(msg);
                setAiStatus("failed");
                toast.error(msg);
            });
    };

    const getAITextContent = () => {
        if (!aiResult) return "";
        let content = "AI Summary:\n" + (aiResult.summary?.text || "") + "\n\n";
        content += "Key Excerpts:\n";
        if (aiResult.excerpts?.items) {
            aiResult.excerpts.items.forEach((item, i) => {
                content += `${i + 1}. ${item}\n\n`;
            });
        }
        return content;
    };

    const downloadAITxt = () => {
        if (!aiResult) return;
        const blob = new Blob([getAITextContent()], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job?.originalFileName?.split(".")[0] || 'transcript'}-AI-Summary.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAIPdf = () => {
        if (!aiResult) return;
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(getAITextContent(), 170);
        let y = 20;
        for (let i = 0; i < splitText.length; i++) {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(splitText[i], 20, y);
            y += 7;
        }
        doc.save(`${job?.originalFileName?.split(".")[0] || 'transcript'}-AI-Summary.pdf`);
    };

    const copyAIText = (text, id) => {
        navigator.clipboard.writeText(text);
        setAiCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => setAiCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    };

    const copyAllExcerpts = () => {
        if (!aiResult?.excerpts?.items) return;
        const text = aiResult.excerpts.items.map((item, i) => `${i + 1}. ${item}`).join("\n\n");
        copyAIText(text, "all_excerpts");
    };

    // ── Copy transcript ───────────────────────────────────────────────────────
    const copyTranscript = () => {
        navigator.clipboard.writeText(job?.transcript || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Download transcript ───────────────────────────────────────────────────
    const handleDownload = (format) => {
        if (!job) return;

        let content = "";
        let mime = "text/plain";

        if (format === "txt") {
            content = job.transcript;
        } else if (format === "srt") {
            content = generateSrt(job.segments);
        } else if (format === "ass") {
            content = generateAss(job.segments);
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job.originalFileName.split(".")[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const reset = () => {
        setFile(null);
        setError("");
        setUploading(false);
        setUploadPct(0);
        setJobId(null);
        setJob(null);
        setAiStatus("idle");
        setAiResult(null);
        setAiError("");
        setAiCopiedStates({});
    };

    const ext = file ? fileExt(file.name) : null;
    const isAudio = ext && AUDIO_EXTS.includes(ext);
    const FileIcon = isAudio ? FileAudio : FileVideo;

    return (
        <div className="flex flex-col gap-6" data-aos="fade-up">

            {/* ── Drop zone ─────────────────────────────────────────────────── */}
            {!jobId && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => !file && inputRef.current?.click()}
                    className={`relative flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white transition-all
                        ${dragging ? "border-[#7c3aed] bg-[#f5f3ff]" : "border-[#ecebf3] hover:border-[#c4b5fd] hover:bg-[#f9f8fc]"}
                        ${file ? "cursor-default" : "cursor-pointer"}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED.map((e) => `.${e}`).join(",")}
                        className="hidden"
                        onChange={(e) => pick(e.target.files[0])}
                    />

                    {!file ? (
                        /* No file yet */
                        <div className="flex flex-col items-center gap-3 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f3ff]">
                                <UploadCloud size={26} className="text-[#7c3aed]" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-[#0f0b1f]">
                                    Drag & drop your audio or video file here
                                </p>
                                <p className="mt-1 text-sm text-[#6b6680]">
                                    or click to browse — up to 300 MB
                                </p>
                            </div>
                            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                                {ACCEPTED.map((f) => <FormatBadge key={f} fmt={f} />)}
                            </div>
                        </div>
                    ) : (
                        /* File selected */
                        <div className="flex w-full flex-col items-center gap-4 px-8">
                            {/* Dismiss */}
                            <button
                                onClick={(e) => { e.stopPropagation(); reset(); }}
                                className="absolute right-4 top-4 rounded-full p-1 text-[#a8a3bd] hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f3ff]">
                                <FileIcon size={26} className="text-[#7c3aed]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#0f0b1f]">{file.name}</p>
                                <p className="mt-0.5 text-xs text-[#6b6680]">{formatBytes(file.size)}</p>
                            </div>

                            {/* Upload progress */}
                            {uploading && (
                                <div className="w-full max-w-sm">
                                    <div className="flex justify-between text-xs text-[#6b6680] mb-1">
                                        <span>Uploading…</span>
                                        <span>{uploadPct}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ede9fe]">
                                        <div
                                            className="h-full rounded-full bg-[#7c3aed] transition-all duration-300"
                                            style={{ width: `${uploadPct}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Upload button */}
                            {!uploading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                    className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                                >
                                    <UploadCloud size={16} />
                                    Start Transcription
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Error ─────────────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                    <AlertTriangle size={15} />
                    {error}
                </div>
            )}

            {/* ── Job status card ───────────────────────────────────────────── */}
            {job && (
                <div className="rounded-2xl border border-[#ecebf3] bg-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#ecebf3] px-6 py-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-[#0f0b1f] truncate max-w-[260px]">
                                {job.originalFileName}
                            </p>
                            <StatusBadge status={job.status} />
                        </div>
                        <button
                            onClick={reset}
                            className="text-xs font-semibold text-[#7c3aed] hover:underline"
                        >
                            Upload another
                        </button>
                    </div>

                    {/* Processing state */}
                    {(job.status === "uploaded" || job.status === "queued" || job.status === "processing") && (
                        <div className="flex flex-col items-center gap-3 py-12">
                            <Loader2 size={32} className="animate-spin text-[#7c3aed]" />
                            <p className="text-sm font-semibold text-[#0f0b1f]">
                                Transcribing your file…
                            </p>
                            <p className="text-xs text-[#6b6680]">
                                This usually takes 10–30 seconds. Hang tight!
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {job.status === "completed" && (
                        <div className="px-6 py-5">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                    <CheckCircle2 size={16} />
                                    Transcription complete
                                    <span className="text-xs font-normal text-[#6b6680]">
                                        ({job.processingTime}s)
                                    </span>
                                </div>
                                <button
                                    onClick={copyTranscript}
                                    className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] px-3 py-1.5 text-xs font-semibold text-[#3f3a52] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                                >
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                    {copied ? "Copied!" : "Copy Raw Text"}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleDownload("txt")}
                                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-[#ecebf3] bg-white py-6 transition-all hover:border-[#7c3aed] hover:bg-[#f5f3ff]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
                                        <Download size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-[#0f0b1f]">TXT Format</p>
                                        <p className="mt-1 text-xs text-[#6b6680]">Plain text transcript</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleDownload("srt")}
                                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-[#ecebf3] bg-white py-6 transition-all hover:border-[#7c3aed] hover:bg-[#f5f3ff]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
                                        <Download size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-[#0f0b1f]">SRT Format</p>
                                        <p className="mt-1 text-xs text-[#6b6680]">Standard subtitles</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleDownload("ass")}
                                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-[#ecebf3] bg-white py-6 transition-all hover:border-[#7c3aed] hover:bg-[#f5f3ff]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#7c3aed]">
                                        <Download size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-[#0f0b1f]">ASS Format</p>
                                        <p className="mt-1 text-xs text-[#6b6680]">Advanced styling</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AI Summary & Excerpts Section */}
                    {job.status === "completed" && (
                        <div className="border-t border-[#ecebf3] px-6 py-6 bg-[#fcfbfe] rounded-b-2xl">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={20} className="text-[#7c3aed]" />
                                <h3 className="text-base font-bold text-[#0f0b1f]">AI Summary & Excerpts</h3>
                            </div>

                            {/* State: Idle / Initial */}
                            {aiStatus === "idle" && (
                                <div className="rounded-xl border border-[#ecebf3] bg-white p-5 text-center shadow-sm">
                                    <p className="text-sm text-[#6b6680] mb-4">
                                        Unlock key insights! Optionally generate a concise summary and the most shareable excerpts from your transcript using AI.
                                    </p>
                                    <button
                                        onClick={generateAI}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
                                    >
                                        <Sparkles size={16} />
                                        Generate Summary & Excerpts
                                    </button>
                                </div>
                            )}

                            {/* State: Generating / Loading */}
                            {aiStatus === "generating" && (
                                <div className="rounded-xl border border-[#ecebf3] bg-white p-8 flex flex-col items-center justify-center shadow-sm">
                                    <Loader2 size={28} className="animate-spin text-[#7c3aed] mb-3" />
                                    <p className="text-sm font-semibold text-[#0f0b1f]">Analyzing your transcript...</p>
                                    <p className="text-xs text-[#6b6680] mt-1">This may take a few moments.</p>
                                </div>
                            )}

                            {/* State: Error */}
                            {aiStatus === "failed" && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-5 flex flex-col items-center shadow-sm text-center">
                                    <AlertTriangle size={24} className="text-red-500 mb-2" />
                                    <p className="text-sm font-semibold text-red-600 mb-1">Generation Failed</p>
                                    <p className="text-xs text-red-500 mb-4">{aiError}</p>
                                    <button
                                        onClick={generateAI}
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-200"
                                    >
                                        <RefreshCw size={14} />
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* State: Success */}
                            {aiStatus === "completed" && aiResult && (
                                <div className="flex flex-col gap-6">
                                    {/* Summary */}
                                    <div className="rounded-xl border border-[#ecebf3] bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-[#0f0b1f]">AI Summary</h4>
                                            <button
                                                onClick={() => copyAIText(aiResult.summary?.text, "summary")}
                                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                            >
                                                {aiCopiedStates["summary"] ? <Check size={13} /> : <Copy size={13} />}
                                                {aiCopiedStates["summary"] ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <p className="text-sm text-[#3f3a52] leading-relaxed whitespace-pre-wrap">
                                            {aiResult.summary?.text}
                                        </p>
                                    </div>

                                    {/* Excerpts */}
                                    <div>
                                        <div className="flex items-center justify-between my-3 px-1">
                                            <h4 className="text-sm font-bold text-[#0f0b1f]">Key Excerpts</h4>
                                            <button
                                                onClick={copyAllExcerpts}
                                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#6b6680] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition"
                                            >
                                                {aiCopiedStates["all_excerpts"] ? <Check size={13} /> : <Copy size={13} />}
                                                {aiCopiedStates["all_excerpts"] ? "Copied All" : "Copy All"}
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {aiResult.excerpts?.items?.map((excerpt, idx) => (
                                                <div key={idx} className="relative rounded-xl border border-[#ecebf3] bg-white p-4 shadow-sm group">
                                                    <p className="text-sm text-[#3f3a52] leading-relaxed pr-10">
                                                        <span className="font-bold text-[#7c3aed] mr-2">{idx + 1}.</span>
                                                        {excerpt}
                                                    </p>
                                                    <button
                                                        onClick={() => copyAIText(excerpt, `excerpt_${idx}`)}
                                                        className="absolute top-4 right-4 p-1.5 rounded-md text-[#a8a3bd] hover:bg-[#f5f3ff] hover:text-[#7c3aed] opacity-0 group-hover:opacity-100 transition focus:opacity-100"
                                                        title="Copy excerpt"
                                                    >
                                                        {aiCopiedStates[`excerpt_${idx}`] ? <Check size={14} className="text-[#7c3aed]" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[#ecebf3] pt-5">
                                        <button
                                            onClick={downloadAITxt}
                                            className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-[#ecebf3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3f3a52] transition hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                                        >
                                            <FileText size={16} />
                                            Download As TXT
                                        </button>
                                        <button
                                            onClick={downloadAIPdf}
                                            className="flex flex-1 justify-center items-center gap-2 rounded-xl border border-[#ecebf3] bg-white px-4 py-2.5 text-sm font-semibold text-[#3f3a52] transition hover:border-[#7c3aed] hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                                        >
                                            <File size={16} />
                                            Download As PDF
                                        </button>
                                        <button
                                            onClick={generateAI}
                                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#7c3aed] hover:bg-[#ede9fe] transition"
                                            title="Regenerate Summary & Excerpts"
                                        >
                                            <RefreshCw size={16} />
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Failed */}
                    {job.status === "failed" && (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <XCircle size={32} className="text-red-400" />
                            <p className="text-sm font-semibold text-[#0f0b1f]">Transcription failed</p>
                            <p className="max-w-sm text-center text-xs text-[#6b6680]">
                                {job.errorMessage || "Something went wrong. Please try again."}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}