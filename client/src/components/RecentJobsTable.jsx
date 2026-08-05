const STATUS_STYLES = {
  Success: 'bg-emerald-50 text-emerald-600',
  Processing: 'bg-[#f5f3ff] text-[#7c3aed]',
  Failed: 'bg-red-50 text-red-500',
}

const JOBS = [
  { name: 'Quarterly_Strategy_Meeting.mp4', status: 'Success', duration: '42:15', date: 'Oct 24, 2024' },
  { name: 'User_Interview_08.wav', status: 'Processing', duration: '15:02', date: 'Oct 24, 2024' },
  { name: 'Product_Launch_Event.mp4', status: 'Success', duration: '128:40', date: 'Oct 23, 2024' },
  { name: 'Quick_Voice_Note_01.m4a', status: 'Success', duration: '03:22', date: 'Oct 22, 2024' },
]

export default function RecentJobsTable() {
  return (
    <div className="rounded-2xl border border-[#ecebf3] bg-white p-6 shadow-[0_1px_2px_rgba(15,11,31,0.04),0_8px_24px_rgba(15,11,31,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0f0b1f]">Recent Transcription Jobs</h2>
        <button className="text-sm font-semibold text-[#7c3aed] hover:text-[#6d28d9]">
          View All
        </button>
      </div>

      <table className="mt-5 w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-[#a8a3bd]">
            <th className="pb-3 font-semibold">File Name</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Duration</th>
            <th className="pb-3 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {JOBS.map((job) => (
            <tr key={job.name} className="border-t border-[#ecebf3]">
              <td className="py-4 font-medium text-[#0f0b1f]">{job.name}</td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[job.status]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {job.status}
                </span>
              </td>
              <td className="py-4 text-[#6b6680]">{job.duration}</td>
              <td className="py-4 text-[#6b6680]">{job.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
