import { useEffect, useState } from 'react';
import { FolderOpen, FileAudio, FileVideo } from 'lucide-react';
import api from '../services/api';

function formatBytes(b) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transcriptions")
      .then((res) => {
        if (res.data.success) {
          setFiles(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load files:", err))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex items-center gap-2">
        <FolderOpen size={18} className="text-[#7c3aed]" />
        <h2 className="text-lg font-bold text-[#0f0b1f]">My Files</h2>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-2 text-center text-sm text-[#a8a3bd] py-6">
            Loading your files...
          </div>
        ) : files.length === 0 ? (
          <div className="col-span-2 text-center text-sm text-[#a8a3bd] py-6">
            No files uploaded yet.
          </div>
        ) : (
          files.map((file) => {
            const ext = file.originalFileName.split('.').pop().toLowerCase();
            const isAudio = ["mp3", "wav", "m4a", "flac"].includes(ext);
            const Icon = isAudio ? FileAudio : FileVideo;

            return (
              <div
                key={file._id}
                className="flex items-center gap-3 rounded-xl border border-[#ecebf3] p-4 transition hover:border-[#7c3aed] hover:bg-[#f9f8fc]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ff]">
                  <Icon size={18} className="text-[#7c3aed]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0f0b1f]">{file.originalFileName}</p>
                  <p className="text-xs text-[#a8a3bd]">{formatBytes(file.fileSize || 0)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
