'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import ScreenName from '@/components/layout/ScreenName'
import SearchInput from '@/components/ui/SearchInput'
import ModernBotList from '@/components/ModernBotList'
import CreateBotModal from '@/components/modals/CreateBotModal'
import DashboardStats from '@/components/dashboard/DashboardStats'
import HamburgerMenu from '@/components/HamburgerMenu'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

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

export default function DashboardPage() {
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
    <div className="min-h-screen bg-slate-50">
      <ScreenName name="DASHBOARD" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  ダッシュボード
                </h1>
              </div>
              <p className="text-gray-600 ml-5 font-medium">AIボットの管理と分析</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <div className="w-5 h-5 mr-2 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                新規作成
                <div className="ml-2 w-1 h-1 bg-white/60 rounded-full group-hover:w-2 transition-all duration-200" />
              </button>
              <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/40">
                <HamburgerMenu currentPage="dashboard" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats bots={bots} />

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ボット名やキーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Bot List */}
        <ModernBotList
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