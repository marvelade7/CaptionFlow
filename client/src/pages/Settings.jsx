const TOGGLES = [
  { label: 'Email notifications', desc: 'Get notified when a transcription finishes.' },
  { label: 'Auto-delete source files', desc: 'Remove raw audio 30 days after processing.' },
  { label: 'Speaker labels', desc: 'Automatically detect and label distinct speakers.' },
]

export default function Settings() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <h2 className="text-lg font-bold text-[#0f0b1f]">Settings</h2>
      <div className="mt-5 flex flex-col divide-y divide-[#ecebf3]">
        {TOGGLES.map((toggle) => (
          <div key={toggle.label} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-[#0f0b1f]">{toggle.label}</p>
              <p className="text-xs text-[#6b6680]">{toggle.desc}</p>
            </div>
            <div className="h-6 w-11 cursor-pointer rounded-full bg-[#7c3aed] p-1">
              <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
