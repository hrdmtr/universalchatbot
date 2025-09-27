import ModernBotCard from '@/components/ModernBotCard'
import Button from '@/components/ui/Button'
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'

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

interface ModernBotListProps {
  bots: Bot[]
  filteredBots: Bot[]
  onCreateClick: () => void
}

export default function ModernBotList({
  bots,
  filteredBots,
  onCreateClick
}: ModernBotListProps) {
  if (filteredBots.length === 0) {
    return (
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
          <SparklesIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {bots.length === 0 ? 'ボットを作成して始めましょう' : '検索結果が見つかりません'}
        </h3>
        <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
          {bots.length === 0
            ? 'AIボットを作成して、自動化されたチャットボット体験を始めることができます。'
            : '別のキーワードで検索するか、フィルターを調整してみてください。'
          }
        </p>
        {bots.length === 0 && (
          <button
            onClick={onCreateClick}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-black hover:via-gray-900 hover:to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <PlusIcon className="h-3 w-3" />
            </div>
            <span>最初のボットを作成</span>
            <div className="w-1 h-1 bg-white/60 rounded-full group-hover:w-2 transition-all duration-200" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">あなたのボット</h2>
              <p className="text-gray-600 mt-1 font-medium">
                {filteredBots.length} 個のボットが見つかりました
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBots.map((bot) => (
          <ModernBotCard key={bot.id} bot={bot} />
        ))}
      </div>
    </div>
  )
}