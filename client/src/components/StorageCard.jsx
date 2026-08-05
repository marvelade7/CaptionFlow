import { Layers } from 'lucide-react'

export default function StorageCard({ usedGb = 14.2, totalGb = 20 }) {
  const percent = Math.min(100, Math.round((usedGb / totalGb) * 100))

  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f3ff]">
        <Layers size={18} className="text-[#7c3aed]" />
      </div>
      <p className="mt-4 text-sm text-[#6b6680]">Available Storage</p>
      <p className="mt-1 text-2xl font-bold text-[#0f0b1f]">
        {usedGb} GB <span className="text-base font-medium text-[#a8a3bd]">/ {totalGb} GB</span>
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#ecebf3]">
        <div
          className="h-full rounded-full bg-[#7c3aed]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
