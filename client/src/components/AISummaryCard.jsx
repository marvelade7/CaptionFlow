import { Sparkles } from 'lucide-react'

export default function AISummaryCard() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7c3aed] px-3 py-1 text-xs font-semibold text-white">
        <Sparkles size={12} />
        AI Summary
      </span>

      <p className="mt-4 text-sm font-bold text-[#0f0b1f]">Meeting Insight</p>
      <p className="mt-2 text-sm leading-relaxed text-[#6b6680]">
        "In your last meeting, the team focused on{' '}
        <span className="font-semibold text-[#7c3aed]">Q4 Revenue Projections</span>. Key
        takeaways suggest a 15% growth target."
      </p>

      <button className="mt-4 w-full rounded-xl bg-[#f5f3ff] py-2.5 text-sm font-semibold text-[#6d28d9] transition-colors hover:bg-[#ede9fe]">
        Generate Full Digest
      </button>
    </div>
  )
}
