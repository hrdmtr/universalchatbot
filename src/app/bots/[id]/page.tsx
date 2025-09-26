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
}

interface BotDetailPageProps {
  params: Promise<{ id: string }>
}

export default function BotDetailPage({ params }: BotDetailPageProps) {
  const [bot, setBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchBot()
    }
  }, [resolvedParams])

  const fetchBot = async () => {
    if (!resolvedParams) return

    try {
      const response = await fetch(`/api/bots/${resolvedParams.id}`)

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.status === 404) {
        router.push('/')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setBot(data)
        setEditName(data.name)
        setEditDescription(data.description || '')
      }
    } catch (error) {
      console.error('Error fetching bot:', error)
      setError('ボットの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!resolvedParams || !bot) return

    setSaveLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/bots/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBot(data)
        setEditing(false)
      } else {
        setError(data.error || '保存に失敗しました')
      }
    } catch (error) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setSaveLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">ボットが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← ボット一覧へ戻る
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/bots/${bot.id}/chat`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            >
              チャット開始
            </Link>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                編集
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditName(bot.name)
                    setEditDescription(bot.description || '')
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading || !editName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                >
                  {saveLoading ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bot Details */}
        <div className="bg-white rounded-lg shadow p-6">
          {editing ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-2">
                  ボット名 *
                </label>
                <input
                  type="text"
                  id="botName"
                  required
                  maxLength={80}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label htmlFor="botDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  id="botDescription"
                  rows={4}
                  maxLength={500}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{bot.name}</h1>
              </div>
              {bot.description && (
                <div>
                  <p className="text-gray-600 text-lg">{bot.description}</p>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">作成日時:</span> {formatDate(bot.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">更新日時:</span> {formatDate(bot.updatedAt)}
                  </div>
                  <div>
                    <span className="font-medium">作成者:</span> {bot.user.email}
                  </div>
                  <div>
                    <span className="font-medium">ボットID:</span> {bot.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}