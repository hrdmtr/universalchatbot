'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import ScreenName from '@/components/layout/ScreenName'
import HamburgerMenu from '@/components/HamburgerMenu'
import {
  ArrowLeftIcon,
  CogIcon,
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface Bot {
  id: string
  name: string
  description: string | null
  apiKey?: {
    id: string
    name: string
    provider: string
  } | null
}

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const [bot, setBot] = useState<Bot | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      fetchBot()
    }
  }, [resolvedParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchBot = async () => {
    if (!resolvedParams) return

    try {
      const response = await fetch(`/api/bots/${resolvedParams.id}`)

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (response.status === 404) {
        router.push('/dashboard')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setBot(data)

        // 初期メッセージを追加
        if (data) {
          const welcomeMessage: Message = {
            id: 'welcome',
            content: `こんにちは！私は${data.name}です。${data.description || 'お手伝いできることがあれば何でもお聞きください。'}`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages([welcomeMessage])
        }
      }
    } catch (error) {
      console.error('Error fetching bot:', error)
      setError('ボット情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    if (!bot || !resolvedParams) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setSending(true)
    setError('')

    try {
      const response = await fetch(`/api/bots/${resolvedParams.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content
        })
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        setError(data.error || 'メッセージの送信に失敗しました')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setSending(false)
    }
  }

  const clearChat = () => {
    if (!bot) return
    const welcomeMessage: Message = {
      id: 'welcome-new',
      content: `こんにちは！私は${bot.name}です。${bot.description || 'お手伝いできることがあれば何でもお聞きください。'}`,
      isUser: false,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">ボットが見つかりません</div>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50">
      <ScreenName name="CHAT" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/bots/${bot.id}`}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{bot.name}</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${bot.apiKey ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-500">
                  {bot.apiKey ? `${bot.apiKey.provider} 接続中` : 'APIキー未設定'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="チャットをクリア"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <Link
            href={`/bots/${bot.id}`}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CogIcon className="h-5 w-5" />
          </Link>
          <HamburgerMenu />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Key Warning */}
      {!bot.apiKey && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                このボットにはAPIキーが設定されていません。
                <Link href={`/bots/${bot.id}`} className="font-medium underline">
                  設定から追加してください
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}

          {sending && (
            <ChatMessage
              message=""
              isUser={false}
              timestamp={new Date()}
              isTyping={true}
            />
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={sending || !bot.apiKey}
            placeholder={
              bot.apiKey
                ? `${bot.name}にメッセージを送信...`
                : "APIキーが設定されていません"
            }
          />
        </div>
      </div>
    </div>
  )
}