import { cn } from '../../utils/cn.js'

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  outline:   'btn-outline',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag className={cn(VARIANTS[variant] || VARIANTS.primary, className)} {...rest}>
      {children}
    </Tag>
  )
}
