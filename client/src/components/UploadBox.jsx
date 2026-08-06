import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ACCEPTED_EXTS = ["mp3", "wav", "m4a", "flac", "mp4", "mov", "mkv", "webm"];

export default function UploadBox() {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dragging, setDragging] = useState(false);

    const processFile = (file) => {
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!ACCEPTED_EXTS.includes(ext)) {
            toast.error(`Unsupported format: .${ext}. Please select an audio or video file.`);
            return;
        }

        if (user) {
            toast.success(`Opening dashboard with ${file.name}`);
            navigate("/dashboard/upload", { state: { pendingFile: file } });
        } else {
            toast.custom(
                (t) => (
                    <div className="flex items-center gap-3 bg-[#0f0b1f] text-white px-4 py-3 rounded-xl shadow-xl">
                        <span className="text-sm font-medium">
                            Please log in or sign up to transcribe <strong>{file.name}</strong>
                        </span>
                    </div>
                ),
                { duration: 4000 }
            );
            navigate("/login", {
                state: {
                    pendingFile: file,
                    message: `Log in to finish transcribing "${file.name}"`,
                },
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer?.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="flex justify-center p-5 md:py-12">
            <input
                ref={inputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.flac,.mp4,.mov,.mkv,.webm"
                className="hidden"
                onChange={handleFileChange}
            />
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 md:p-12 text-center max-w-2xl w-full cursor-pointer transition-all duration-200 bg-purple-50/70 hover:bg-purple-50 ${
                    dragging
                        ? "border-[#7C3AED] bg-purple-100 scale-[1.01]"
                        : "border-[#7c3aed4a] hover:border-[#7C3AED]"
                }`}
                data-aos="zoom-in"
                data-aos-duration="800"
            >
                <div className="upload-icon flex justify-center items-center mb-4 text-[#7C3AED]">
                    <i className="bi bi-folder text-5xl md:text-6xl"></i>
                </div>
                <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
                    {dragging ? "Drop your file to transcribe!" : "Drag and drop your file"}
                </h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                    or click to browse from your computer
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {ACCEPTED_EXTS.map((ext) => (
                        <span
                            key={ext}
                            className="bg-white border border-purple-100 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold text-[#7C3AED] shadow-2xs"
                        >
                            {ext.toUpperCase()}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
