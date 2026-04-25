import { cn } from '../../utils/cn.js'

const TONES = {
  neutral: 'bg-ink-100 text-ink-700',
  brand:   'bg-brand-100 text-brand-800',
  amber:   'bg-amber-100 text-amber-800',
  rose:    'bg-rose-100 text-rose-800',
  sky:     'bg-sky-100  text-sky-800',
  violet:  'bg-violet-100 text-violet-800',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={cn('badge', TONES[tone] || TONES.neutral, className)}>
      {children}
    </span>
  )
}
