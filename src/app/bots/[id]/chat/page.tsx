'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href={`/bots/${resolvedParams.id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← ボット詳細へ戻る
            </Link>
          </div>
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ボット一覧
          </Link>
        </div>

        {/* Chat Interface Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">チャット画面</h1>
            <p className="text-gray-600">
              ここにチャット機能が実装される予定です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}