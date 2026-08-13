import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    UploadCloud, FileAudio, FileVideo, CheckCircle2,
    XCircle, Loader2, Copy, Check, AlertTriangle, X, Download, Sparkles
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { generateSrt, generateAss } from "../utils/subtitleHelpers";
import AIModal from "../components/AIModal";

// ─── Constants ───────────────────────────────────────────────────────────────
const ACCEPTED = ["mp3", "wav", "m4a", "flac", "mp4", "mov", "mkv", "webm"];
const MAX_BYTES = 300 * 1024 * 1024; // 300 MB
const AUDIO_EXTS = ["mp3", "wav", "m4a", "flac"];
const POLL_INTERVAL = 3000;    // ms between status checks
const POLL_TIMEOUT_MS = 300_000; // 5 min ceiling — bail out if still running after this

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
    const [uploading, setUploading]         = useState(false);
    const [uploadPct, setUploadPct]         = useState(0);
    const [jobId, setJobId]                 = useState(null);
    const [transcriptionStartTime, setTranscriptionStartTime] = useState(null);
    const [transcriptionPct, setTranscriptionPct]             = useState(0);
    const [pollStartTime, setPollStartTime] = useState(null);

    // Polling result
    const [job, setJob]               = useState(null);
    const [copied, setCopied]         = useState(false);

    // AI modal
    const [showAIModal, setShowAIModal] = useState(false);

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
                    const now = Date.now();
                    setTranscriptionStartTime(now); // kick off progress bar
                    setPollStartTime(now);           // start polling timeout clock
                    setTranscriptionPct(0);
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
            // Hard ceiling: if we've been polling for too long, something is wrong.
            if (pollStartTime && Date.now() - pollStartTime > POLL_TIMEOUT_MS) {
                clearInterval(interval);
                setError("Transcription is taking too long — this may be a connection issue. Please try again.");
                toast.error("Transcription timed out. Please try again.", { duration: 6000 });
                setJob((prev) => ({ ...prev, status: "failed", errorMessage: "Request timed out. Please check your connection and try again." }));
                return;
            }

            api.get(`/transcriptions/${jobId}`)
                .then((res) => {
                    if (res.data.success) setJob(res.data.data);
                })
                .catch(() => {
                    // Don't kill the interval on a single failed poll — could be a blip.
                    // The ceiling above handles persistent failures.
                });
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [jobId, job?.status, pollStartTime]);

    // ── Estimated transcription progress bar ─────────────────────────────────
    // Uses elapsed time to animate toward 99%; snaps to 100% on completion.
    useEffect(() => {
        if (!transcriptionStartTime) return;
        const isProcessing = job?.status === "uploaded" || job?.status === "queued" || job?.status === "processing";
        const isDone       = job?.status === "completed" || job?.status === "failed";

        if (isDone) {
            setTranscriptionPct(100);
            return;
        }

        if (!isProcessing) return;

        // Tick every second and advance the bar with a log curve capped at 99%.
        // ESTIMATED_DURATION_MS is a ceiling — if the job finishes early the bar
        // snaps to 100% immediately. Set it to a value slightly above your worst case.
        const ESTIMATED_DURATION_MS = 120_000;
        const timer = setInterval(() => {
            const elapsed = Date.now() - transcriptionStartTime;
            // log curve: fast early progress, decelerates near the end
            const raw = Math.log1p((elapsed / ESTIMATED_DURATION_MS) * (Math.E - 1)) * 99;
            setTranscriptionPct(Math.min(Math.round(raw), 99));
        }, 1000);

        return () => clearInterval(timer);
    }, [transcriptionStartTime, job?.status]);

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
        setTranscriptionStartTime(null);
        setTranscriptionPct(0);
        setPollStartTime(null);
        setShowAIModal(false);
    };

    const ext = file ? fileExt(file.name) : null;
    const isAudio = ext && AUDIO_EXTS.includes(ext);
    const FileIcon = isAudio ? FileAudio : FileVideo;

    return (
        <>
            {/* ── AI Summary Modal */}
            {showAIModal && job && (
                <AIModal job={job} onClose={() => setShowAIModal(false)} />
            )}

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
                        <div className="flex flex-col items-center gap-4 px-8 py-10">
                            {/* Icon + label */}
                            <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-[#7c3aed]" />
                                <p className="text-sm font-semibold text-[#0f0b1f]">
                                    Transcribing your file…
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full max-w-sm">
                                <div className="flex justify-between text-xs text-[#6b6680] mb-1.5">
                                    <span>
                                        {transcriptionPct < 30 ? "Preparing audio chunks…"
                                            : transcriptionPct < 70 ? "Running AI transcription…"
                                            : transcriptionPct < 95 ? "Stitching results…"
                                            : "Almost done…"}
                                    </span>
                                    <span>{transcriptionPct}%</span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#ede9fe]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500 ease-out"
                                        style={{ width: `${transcriptionPct}%` }}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-[#a8a3bd]">
                                Larger files take longer — you can leave this tab open.
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

                    {/* ── AI Summary button row */}
                    {job.status === "completed" && (
                        <div className="border-t border-[#ecebf3] bg-[#fcfbfe] rounded-b-2xl px-6 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-[#7c3aed]" />
                                <p className="text-sm font-semibold text-[#0f0b1f]">AI Summary & Excerpts</p>
                                {job.summary?.text && (
                                    <span className="rounded-full bg-[#f0eeff] px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
                                        Ready
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAIModal(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-[#e0dbf7] bg-[#f5f3ff] px-3 py-2 text-xs font-semibold text-[#7c3aed] transition hover:bg-[#ede9fe] hover:border-[#c4b5fd]"
                            >
                                <Sparkles size={13} />
                                {job.summary?.text ? "View Summary" : "Generate Summary"}
                            </button>
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
        </>
    );
}