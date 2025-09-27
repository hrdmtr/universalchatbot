import { useRouter } from 'next/navigation'
import {
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  UserIcon,
  KeyIcon
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

interface ModernBotCardProps {
  bot: Bot
}

export default function ModernBotCard({ bot }: ModernBotCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMilliseconds = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      return 'たった今'
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else if (diffInDays < 7) {
      return `${diffInDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP')
    }
  }

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => router.push(`/bots/${bot.id}`)}
    >
      {/* Header with gradient */}
      <div className={`h-2 ${bot.apiKey ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`} />

      <div className="p-6">
        {/* Bot Icon and Name */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            bot.apiKey ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
          }`}>
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {bot.name}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${bot.apiKey ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-500">
                {bot.apiKey ? '稼働中' : '設定待ち'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {bot.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {bot.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>更新: {formatDate(bot.updatedAt)}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>作成者: {bot.user.email}</span>
          </div>

          <div className="flex items-center">
            <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
            {bot.apiKey ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                {bot.apiKey.name} ({bot.apiKey.provider})
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                APIキー未設定
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}