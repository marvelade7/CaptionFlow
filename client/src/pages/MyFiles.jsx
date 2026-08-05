import { FolderOpen, FileAudio, FileVideo } from 'lucide-react'

const FILES = [
  { name: 'Quarterly_Strategy_Meeting.mp4', size: '482 MB', type: 'video' },
  { name: 'User_Interview_08.wav', size: '58 MB', type: 'audio' },
  { name: 'Product_Launch_Event.mp4', size: '1.1 GB', type: 'video' },
  { name: 'Quick_Voice_Note_01.m4a', size: '4 MB', type: 'audio' },
]

export default function MyFiles() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex items-center gap-2">
        <FolderOpen size={18} className="text-[#7c3aed]" />
        <h2 className="text-lg font-bold text-[#0f0b1f]">My Files</h2>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FILES.map((file) => {
          const Icon = file.type === 'video' ? FileVideo : FileAudio
          return (
            <div
              key={file.name}
              className="flex items-center gap-3 rounded-xl border border-[#ecebf3] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f3ff]">
                <Icon size={18} className="text-[#7c3aed]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#0f0b1f]">{file.name}</p>
                <p className="text-xs text-[#a8a3bd]">{file.size}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
