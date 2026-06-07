import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  description: string
  timestamp: string
  user?: string
  status?: 'success' | 'warning' | 'error' | 'info'
  icon?: ReactNode
}

interface RecentActivityTableProps {
  items: ActivityItem[]
  title?: string
  onViewAll?: () => void
  isLoading?: boolean
}

const statusColors = {
  success: 'bg-green-500/10 text-green-400 border border-green-500/20',
  warning: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

export default function RecentActivityTable({
  items,
  title = 'Recent Activity',
  onViewAll,
  isLoading = false,
}: RecentActivityTableProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/20 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl border bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-700/20 transition-colors group cursor-pointer"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {item.icon ? (
                  <div className="p-2 rounded-lg bg-slate-700/30 text-slate-400">
                    {item.icon}
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-400"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {item.action}
                  </h4>
                  {item.status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        statusColors[item.status]
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{item.description}</p>
                {item.user && (
                  <p className="text-xs text-slate-600 mt-1">by {item.user}</p>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-slate-500">{item.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
