import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'
import { encryptApiKey, createKeyPreview } from '@/lib/crypto'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { provider, name, apiKey } = await request.json()

    if (!provider || !name?.trim() || !apiKey?.trim()) {
      return NextResponse.json({ error: 'すべての項目を入力してください' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: '名前は100文字以下で入力してください' }, { status: 400 })
    }

    // Encrypt the API key for storage
    const encryptedKey = encryptApiKey(apiKey.trim())
    const keyPreview = createKeyPreview(apiKey.trim())

    const newApiKey = await prisma.apiKey.create({
      data: {
        provider,
        name: name.trim(),
        encryptedKey,
        keyPreview,
        userId: user.userId,
      },
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(newApiKey, { status: 201 })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}