export default function Account() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <h2 className="text-lg font-bold text-[#0f0b1f]">Account</h2>
      <div className="mt-5 flex items-center gap-4">
        <img
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex"
          alt="Alex"
          className="h-16 w-16 rounded-full bg-[#ede9fe]"
        />
        <div>
          <p className="text-base font-bold text-[#0f0b1f]">Alex Morgan</p>
          <p className="text-sm text-[#6b6680]">alex@captionflow.io</p>
          <span className="mt-1 inline-block rounded-full bg-[#f5f3ff] px-2.5 py-0.5 text-xs font-semibold text-[#6d28d9]">
            Pro Plan
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#ecebf3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#a8a3bd]">Plan</p>
          <p className="mt-1 text-sm font-medium text-[#0f0b1f]">Pro — billed monthly</p>
        </div>
        <div className="rounded-xl border border-[#ecebf3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#a8a3bd]">
            Renews on
          </p>
          <p className="mt-1 text-sm font-medium text-[#0f0b1f]">Nov 24, 2024</p>
        </div>
      </div>
    </div>
  )
}
