import { UploadCloud } from 'lucide-react'

export default function Upload() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ecebf3] bg-white text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f3ff]">
        <UploadCloud size={26} className="text-[#7c3aed]" />
      </div>
      <p className="mt-4 text-base font-bold text-[#0f0b1f]">Drag & drop a file to upload</p>
      <p className="mt-1 text-sm text-[#6b6680]">MP4, WAV, MP3 or M4A — up to 2GB</p>
      <button className="mt-5 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9]">
        Browse Files
      </button>
    </div>
  )
}