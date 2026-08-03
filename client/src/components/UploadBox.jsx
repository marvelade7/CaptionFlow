export default function UploadBox() {
    return (
        <div className="flex justify-center p-5 md:py-12">
            <div
                className="border-2 border-[#7c3aed4a] border-dashed rounded-xl p-5 md:p-12 text-center max-w-2xl w-full hover:border-[#7C3AED] transition-all bg-purple-50 cursor-pointer"
                data-aos="zoom-in"
                data-aos-duration="800"
            >
                <div className="upload-icon flex justify-center items-center mb-4">
                    <i className="bi bi-folder text-5xl md:text-6xl"></i>
                </div>
                <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2">
                    Drag and drop your file
                </h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                    or click to browse from your computer
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        MP3
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        WAV
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        M4A
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        FLAC
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        MP4
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        MOV
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        MKV
                    </span>
                    <span className="bg-gray-50 px-3 py-2 rounded text-xs md:text-sm font-medium text-gray-900">
                        WEBM
                    </span>
                </div>
            </div>
        </div>
    );
}
