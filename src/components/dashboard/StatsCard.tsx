import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  gradient: string
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  gradient
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-6 bg-white border-2 border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center mt-3">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {trend.isPositive ? '↗' : '↘'} {trend.value}
                </div>
              </div>
            )}
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-500 group-hover:from-blue-100 group-hover:to-purple-100 group-hover:text-blue-600 transition-all duration-300 shadow-inner">
            {icon}
          </div>
        </div>
      </div>

    </div>
  )
}