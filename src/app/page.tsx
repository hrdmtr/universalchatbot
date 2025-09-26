'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function HomePage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [filteredBots, setFilteredBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newBotName, setNewBotName] = useState('')
  const [newBotDescription, setNewBotDescription] = useState('')
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')

    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBotName,
          description: newBotDescription,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBots([data, ...bots])
        setShowCreateModal(false)
        setNewBotName('')
        setNewBotDescription('')
      } else {
        setCreateError(data.error || 'ボットの作成に失敗しました')
      }
    } catch (error) {
      setCreateError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setCreateLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen Name */}
      <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono">
        [BOT_LIST]
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ボット一覧</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
            >
              新規作成
            </button>
            <Link
              href="/settings"
              className="text-gray-600 hover:text-gray-800"
            >
              設定
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ボット名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Bot List */}
        {filteredBots.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {bots.length === 0 ? 'まだボットがありません。' : '検索結果に一致するボットがありません。'}
            </div>
            {bots.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
              >
                最初のボットを作成
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBots.map((bot) => (
              <div
                key={bot.id}
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
            ))}
          </div>
        )}

        {/* Create Bot Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                新しいボットを作成
              </h2>
              <form onSubmit={handleCreateBot} className="space-y-4">
                <div>
                  <label htmlFor="botName" className="block text-sm font-medium text-gray-700">
                    ボット名 *
                  </label>
                  <input
                    type="text"
                    id="botName"
                    required
                    maxLength={80}
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="botDescription" className="block text-sm font-medium text-gray-700">
                    説明（任意）
                  </label>
                  <textarea
                    id="botDescription"
                    rows={3}
                    maxLength={500}
                    value={newBotDescription}
                    onChange={(e) => setNewBotDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
                {createError && (
                  <div className="text-red-600 text-sm">{createError}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewBotName('')
                      setNewBotDescription('')
                      setCreateError('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {createLoading ? '作成中...' : 'ボットを作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
