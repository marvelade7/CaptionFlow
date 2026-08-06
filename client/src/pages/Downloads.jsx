import { useEffect, useState } from 'react';
import { Download, FileText, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { generateSrt, generateAss } from '../utils/subtitleHelpers';

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function Downloads() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transcriptions")
      .then((res) => {
        if (res.data.success) {
          // Only show completed ones in downloads
          setTranscriptions(res.data.data.filter(t => t.status === "completed"));
        }
      })
      .catch((err) => console.error("Failed to load transcriptions:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (job, format) => {
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

  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]" data-aos="fade-up">
      <h2 className="text-lg font-bold text-[#0f0b1f]">Downloads</h2>
      <div className="mt-5 flex flex-col divide-y divide-[#ecebf3]">
        {loading ? (
          <div className="py-8 text-center text-sm text-[#a8a3bd]">Loading downloads...</div>
        ) : transcriptions.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#a8a3bd]">No completed transcriptions available to download yet.</div>
        ) : (
          transcriptions.map((job, idx) => (
            <div key={job._id} data-aos="fade-up" data-aos-delay={idx * 60} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f3ff]">
                  <FileText size={16} className="text-[#7c3aed]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0f0b1f] max-w-[200px] sm:max-w-[300px] md:max-w-[400px] truncate" title={job.originalFileName}>
                    {job.originalFileName}
                  </p>
                  <p className="text-xs text-[#a8a3bd]">{formatDate(job.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDownload(job, "srt")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] px-3 py-1.5 text-xs font-semibold text-[#3f3a52] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                >
                  <Download size={13} />
                  SRT
                </button>
                <button
                  onClick={() => handleDownload(job, "txt")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] px-3 py-1.5 text-xs font-semibold text-[#3f3a52] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                >
                  <Download size={13} />
                  TXT
                </button>
                <button
                  onClick={() => handleDownload(job, "ass")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#ecebf3] px-3 py-1.5 text-xs font-semibold text-[#3f3a52] transition hover:bg-[#f5f3ff] hover:text-[#7c3aed]"
                >
                  <Download size={13} />
                  ASS
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
