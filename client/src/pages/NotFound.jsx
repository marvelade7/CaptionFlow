import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-5xl font-bold text-[#7c3aed]">404</p>
      <p className="mt-2 text-sm text-[#6b6680]">This page doesn't exist yet.</p>
      <Link
        to="/dashboard"
        className="mt-4 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9]"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
