import { ReactNode } from 'react'
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline'

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
}

export default function ChatMessage({
  message,
  isUser,
  timestamp,
  isTyping = false
}: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isUser ? (
          <UserIcon className="h-5 w-5" />
        ) : (
          <CpuChipIcon className="h-5 w-5" />
        )}
      </div>

      {/* Message */}
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-indigo-500 text-white rounded-br-sm'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
        }`}>
          {isTyping ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          )}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  )
}