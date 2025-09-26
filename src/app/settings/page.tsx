'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface ApiKey {
  id: string
  provider: string
  name: string
  keyPreview: string
  createdAt: string
  isActive: boolean
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProvider, setNewProvider] = useState('')
  const [newName, setNewName] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null)
  const [editName, setEditName] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const router = useRouter()

  const providers = [
    { value: 'openai', label: 'OpenAI (GPT-4, GPT-3.5)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google (Gemini)' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'custom', label: 'カスタム API' }
  ]

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/settings/api-keys')

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!newProvider || !newName.trim() || !newApiKey.trim()) {
      setError('すべての項目を入力してください')
      return
    }

    setSaveLoading(true)
    setError('')

    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: newProvider,
          name: newName.trim(),
          apiKey: newApiKey.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setApiKeys([...apiKeys, data])
        setShowAddModal(false)
        setNewProvider('')
        setNewName('')
        setNewApiKey('')
        setShowApiKey(false)
      } else {
        setError(data.error || 'APIキーの保存に失敗しました')
      }
    } catch (error) {
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setSaveLoading(false)
    }
  }

  const toggleApiKeyStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/settings/api-keys/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        const updatedKey = await response.json()
        setApiKeys(apiKeys.map(key =>
          key.id === id ? updatedKey : key
        ))
      }
    } catch (error) {
      console.error('Error updating API key status:', error)
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('このAPIキーを削除しますか？')) return

    try {
      const response = await fetch(`/api/settings/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== id))
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const openEditModal = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey)
    setEditName(apiKey.name)
    setEditError('')
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editingApiKey || !editName.trim()) {
      setEditError('名前を入力してください')
      return
    }

    setEditLoading(true)
    setEditError('')

    try {
      const response = await fetch(`/api/settings/api-keys/${editingApiKey.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setApiKeys(apiKeys.map(key =>
          key.id === editingApiKey.id ? data : key
        ))
        setShowEditModal(false)
        setEditingApiKey(null)
        setEditName('')
      } else {
        setEditError(data.error || '名前の変更に失敗しました')
      }
    } catch (error) {
      setEditError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setEditLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
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
        [SETTINGS]
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← ボット一覧へ戻る
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">設定</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            APIキーを追加
          </button>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2" />
              LLM APIキー
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              各種LLMプロバイダーのAPIキーを管理します
            </p>
          </div>

          {apiKeys.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-4">
                まだAPIキーが登録されていません
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                最初のAPIキーを追加
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {apiKey.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          apiKey.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {apiKey.isActive ? '有効' : '無効'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {providers.find(p => p.value === apiKey.provider)?.label || apiKey.provider}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 font-mono">
                        {apiKey.keyPreview}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        作成日: {formatDate(apiKey.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(apiKey)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.isActive)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          apiKey.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {apiKey.isActive ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 rounded-md"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add API Key Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                APIキーを追加
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                    プロバイダー *
                  </label>
                  <select
                    id="provider"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="">プロバイダーを選択</option>
                    {providers.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="apiKeyName" className="block text-sm font-medium text-gray-700">
                    名前 *
                  </label>
                  <input
                    type="text"
                    id="apiKeyName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例: メイン用OpenAI"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    APIキー *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      id="apiKey"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKey ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setNewProvider('')
                      setNewName('')
                      setNewApiKey('')
                      setShowApiKey(false)
                      setError('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={saveLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {saveLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit API Key Modal */}
        {showEditModal && editingApiKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                APIキー名を編集
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editKeyName" className="block text-sm font-medium text-gray-700">
                    名前 *
                  </label>
                  <input
                    type="text"
                    id="editKeyName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  プロバイダー: {providers.find(p => p.value === editingApiKey.provider)?.label || editingApiKey.provider}
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  キー: {editingApiKey.keyPreview}
                </div>
                {editError && (
                  <div className="text-red-600 text-sm">{editError}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingApiKey(null)
                      setEditName('')
                      setEditError('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={editLoading || !editName.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {editLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}