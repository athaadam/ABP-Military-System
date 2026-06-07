import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  color?: 'blue' | 'purple' | 'green' | 'red' | 'orange'
  onClick?: () => void
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-slate-950/58',
      border: 'border-slate-700/60',
      icon: 'text-blue-400',
      accent: 'from-blue-500/16 to-slate-950/0',
    },
    purple: {
      bg: 'bg-slate-950/58',
      border: 'border-slate-700/60',
      icon: 'text-purple-400',
      accent: 'from-purple-500/16 to-slate-950/0',
    },
    green: {
      bg: 'bg-slate-950/58',
      border: 'border-slate-700/60',
      icon: 'text-green-400',
      accent: 'from-green-500/16 to-slate-950/0',
    },
    red: {
      bg: 'bg-slate-950/58',
      border: 'border-slate-700/60',
      icon: 'text-red-400',
      accent: 'from-red-500/16 to-slate-950/0',
    },
    orange: {
      bg: 'bg-slate-950/58',
      border: 'border-slate-700/60',
      icon: 'text-orange-400',
      accent: 'from-orange-500/16 to-slate-950/0',
    },
  }

  const colors = colorClasses[color]

  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-xl border ${colors.bg} ${colors.border} backdrop-blur-md transition-all duration-300 hover:border-slate-500/70 overflow-hidden group shadow-[0_10px_30px_rgba(2,6,23,0.45)] ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-blue-500/10' : ''
      }`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
            <span className={colors.icon}>{icon}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          {trend && (
            <p className="text-xs text-slate-500">
              {trend.direction === 'up' ? 'Increase' : 'Decrease'} from last month
            </p>
          )}
        </div>
      </div>

      {/* Animated Border on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
    </div>
  )
}
