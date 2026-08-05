const DAYS = [
  { label: 'MON', value: 30 },
  { label: 'TUE', value: 55 },
  { label: 'WED', value: 40 },
  { label: 'THU', value: 75 },
  { label: 'FRI', value: 60 },
  { label: 'SAT', value: 25 },
]

export default function VelocityChart() {
  const max = Math.max(...DAYS.map((d) => d.value))

  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <p className="text-sm font-bold text-[#0f0b1f]">Transcription Velocity</p>
      <div className="mt-6 flex h-24 items-end justify-between gap-2">
        {DAYS.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-md bg-[#ede9fe] transition-all"
              style={{ height: `${(d.value / max) * 100}%` }}
            >
              <div className="h-full w-full rounded-md bg-gradient-to-t from-[#7c3aed] to-[#a78bfa]" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-[#a8a3bd]">
        {DAYS.map((d) => (
          <span key={d.label} className="flex-1 text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
