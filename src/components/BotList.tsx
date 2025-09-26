import BotCard from '@/components/BotCard'
import Button from '@/components/ui/Button'

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

interface BotListProps {
  bots: Bot[]
  filteredBots: Bot[]
  onCreateClick: () => void
}

export default function BotList({
  bots,
  filteredBots,
  onCreateClick
}: BotListProps) {
  if (filteredBots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {bots.length === 0 ? 'まだボットがありません。' : '検索結果に一致するボットがありません。'}
        </div>
        {bots.length === 0 && (
          <Button onClick={onCreateClick} size="lg">
            最初のボットを作成
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredBots.map((bot) => (
        <BotCard key={bot.id} bot={bot} />
      ))}
    </div>
  )
}