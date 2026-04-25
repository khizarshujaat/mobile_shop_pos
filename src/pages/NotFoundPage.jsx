import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 mx-auto rounded-full bg-ink-100 text-ink-500 flex items-center justify-center">
          <Compass className="w-7 h-7" />
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-ink-400 mt-4">
          Error 404
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 mt-1">
          Page not found
        </h1>
        <p className="text-sm text-ink-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/pos" className="btn-primary inline-flex mt-6">
          Back to register
        </Link>
      </div>
    </div>
  )
}
