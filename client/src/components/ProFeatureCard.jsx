import { Video } from 'lucide-react'

export default function ProFeatureCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0f0b1f] to-[#2e1065] p-5 text-white shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
        <Video size={16} />
      </div>
      <p className="mt-4 text-sm font-bold">Pro Feature</p>
      <p className="mt-1 text-sm leading-relaxed text-white/70">
        Connect to Zoom &amp; Google Meet for automated recording.
      </p>
      <button className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20">
        Connect Now
      </button>
    </div>
  )
}
