export default function StatCard({ icon: Icon, label, value, delta, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {delta && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-[#6b6680]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0f0b1f]">{value}</p>
    </div>
  )
}
