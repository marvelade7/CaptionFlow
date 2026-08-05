import { Download, FileText } from 'lucide-react'

const EXPORTS = [
  { name: 'Quarterly_Strategy_Meeting.srt', date: 'Oct 24, 2024' },
  { name: 'Product_Launch_Event.docx', date: 'Oct 23, 2024' },
  { name: 'Quick_Voice_Note_01.txt', date: 'Oct 22, 2024' },
]

export default function Downloads() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <h2 className="text-lg font-bold text-[#0f0b1f]">Downloads</h2>
      <div className="mt-5 flex flex-col divide-y divide-[#ecebf3]">
        {EXPORTS.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f3ff]">
                <FileText size={16} className="text-[#7c3aed]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0f0b1f]">{item.name}</p>
                <p className="text-xs text-[#a8a3bd]">{item.date}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#7c3aed] hover:bg-[#f5f3ff]">
              <Download size={14} />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
