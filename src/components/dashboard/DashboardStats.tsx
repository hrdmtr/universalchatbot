import StatsCard from './StatsCard'
import {
  RocketLaunchIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Bot {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  user: {
    email: string
  }
  apiKey?: {
    id: string
    name: string
    provider: string
  } | null
}

interface DashboardStatsProps {
  bots: Bot[]
}

export default function DashboardStats({ bots }: DashboardStatsProps) {
  const totalBots = bots.length
  const activeBots = bots.filter(bot => bot.apiKey).length
  const recentBots = bots.filter(bot => {
    const daysDiff = Math.floor((Date.now() - new Date(bot.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 7
  }).length

  const stats = [
    {
      title: "総ボット数",
      value: totalBots,
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      gradient: "",
      trend: totalBots > 0 ? { value: `${totalBots} 個`, isPositive: true } : undefined
    },
    {
      title: "稼働中",
      value: activeBots,
      icon: <CpuChipIcon className="h-6 w-6" />,
      gradient: "",
      trend: activeBots > 0 ? { value: `${Math.round((activeBots / totalBots) * 100)}%`, isPositive: true } : undefined
    },
    {
      title: "今週作成",
      value: recentBots,
      icon: <ClockIcon className="h-6 w-6" />,
      gradient: "",
      trend: recentBots > 0 ? { value: "新規", isPositive: true } : undefined
    },
    {
      title: "チャット準備完了",
      value: activeBots,
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      gradient: "",
      trend: activeBots > 0 ? { value: "利用可能", isPositive: true } : undefined
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          gradient={stat.gradient}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}