'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import ScreenName from '@/components/layout/ScreenName'
import SearchInput from '@/components/ui/SearchInput'
import BotList from '@/components/BotList'
import CreateBotModal from '@/components/modals/CreateBotModal'

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

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [filteredBots, setFilteredBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBots()
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBots(bots)
    } else {
      const filtered = bots.filter(bot =>
        bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bot.description && bot.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredBots(filtered)
    }
  }, [bots, searchTerm])

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots')

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setBots(data)
      }
    } catch (error) {
      console.error('Error fetching bots:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleCreateBot = async (name: string, description: string) => {
    const response = await fetch('/api/bots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    })

    const data = await response.json()

    if (response.ok) {
      setBots([data, ...bots])
      setShowCreateModal(false)
    } else {
      throw new Error(data.error || 'ボットの作成に失敗しました')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScreenName name="BOT_LIST" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          title="ボット一覧"
          currentPage="bots"
          backLink={{
            href: "/dashboard",
            label: "← ダッシュボード"
          }}
          actionButton={{
            label: "新規作成",
            onClick: () => setShowCreateModal(true)
          }}
        />

        <div className="mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ボット名で検索..."
          />
        </div>

        <BotList
          bots={bots}
          filteredBots={filteredBots}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <CreateBotModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBot}
        />
      </div>
    </div>
  )
}