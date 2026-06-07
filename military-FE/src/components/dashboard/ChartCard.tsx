import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  footer?: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  footer,
}: ChartCardProps) {
  return (
    <div className="p-6 rounded-xl border bg-slate-950/58 border-slate-700/60 backdrop-blur-md hover:border-slate-500/70 transition-all duration-300 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700/50">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div className="space-y-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
          {footer}
        </div>
      )}
    </div>
  )
}
