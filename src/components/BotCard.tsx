import { useRouter } from 'next/navigation'

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

interface BotCardProps {
  bot: Bot
}

export default function BotCard({ bot }: BotCardProps) {
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
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/bots/${bot.id}`)}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {bot.name}
      </h3>
      {bot.description && (
        <p className="text-gray-600 mb-4">{bot.description}</p>
      )}
      <div className="text-sm text-gray-500 space-y-1">
        <div>更新: {formatDate(bot.updatedAt)}</div>
        <div>作成者: {bot.user.email}</div>
        <div className="flex items-center space-x-2">
          <span>APIキー:</span>
          {bot.apiKey ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {bot.apiKey.name} ({bot.apiKey.provider})
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
              未設定
            </span>
          )}
        </div>
      </div>
    </div>
  )
}