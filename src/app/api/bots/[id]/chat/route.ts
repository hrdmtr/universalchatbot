import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key'

interface RouteParams {
  id: string
}

function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

async function callOpenAI(apiKey: string, messages: Array<{role: string, content: string}>) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  return response.json()
}

async function callAnthropic(apiKey: string, messages: Array<{role: string, content: string}>) {
  const systemMessage = messages.find(m => m.role === 'system')
  const userMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemMessage?.content || '',
      messages: userMessages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  return response.json()
}

async function callGoogleGemini(apiKey: string, messages: Array<{role: string, content: string}>) {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Google Gemini API error: ${response.statusText}`)
  }

  return response.json()
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUser()
    const { id } = await context.params

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 })
    }

    // ボットとAPIキー情報を取得
    const bot = await prisma.bot.findFirst({
      where: {
        id,
        userId: user.userId
      },
      include: {
        apiKey: true
      }
    })

    if (!bot) {
      return NextResponse.json({ error: 'ボットが見つかりません' }, { status: 404 })
    }

    if (!bot.apiKey) {
      return NextResponse.json({ error: 'このボットにはAPIキーが設定されていません' }, { status: 400 })
    }

    // APIキーを復号化
    const decryptedApiKey = decrypt(bot.apiKey.encryptedKey)

    // メッセージ履歴（簡単な実装、将来的にはDBに保存）
    const messages = [
      {
        role: 'system',
        content: bot.description || 'あなたは親切で有能なAIアシスタントです。'
      },
      {
        role: 'user',
        content: message
      }
    ]

    let response
    let aiResponse = ''

    try {
      switch (bot.apiKey.provider) {
        case 'openai':
          response = await callOpenAI(decryptedApiKey, messages)
          aiResponse = response.choices[0]?.message?.content || 'レスポンスを取得できませんでした。'
          break

        case 'anthropic':
          response = await callAnthropic(decryptedApiKey, messages)
          aiResponse = response.content[0]?.text || 'レスポンスを取得できませんでした。'
          break

        case 'google':
          response = await callGoogleGemini(decryptedApiKey, messages)
          aiResponse = response.candidates[0]?.content?.parts[0]?.text || 'レスポンスを取得できませんでした。'
          break

        default:
          return NextResponse.json({ error: 'サポートされていないプロバイダーです' }, { status: 400 })
      }

      return NextResponse.json({
        message: aiResponse,
        provider: bot.apiKey.provider,
        model: 'default'
      })

    } catch (apiError: any) {
      console.error('LLM API error:', apiError)
      return NextResponse.json({
        error: 'AIサービスからの応答取得に失敗しました。APIキーを確認してください。'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}