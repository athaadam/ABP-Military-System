import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  padding?: 'sm' | 'md' | 'lg'
  border?: boolean
  shadow?: boolean
}

export default function Card({
  children,
  className,
  title,
  subtitle,
  padding = 'md',
  border = true,
  shadow = true,
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        'bg-slate-950/58 rounded-lg backdrop-blur-md',
        border && 'border border-slate-700/60',
        shadow && 'shadow-[0_10px_30px_rgba(2,6,23,0.45)]',
        paddingClasses[padding],
        className,
      )}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
