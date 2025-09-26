import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const bots = await prisma.bot.findMany({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(bots)
  } catch (error) {
    console.error('Get bots error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'ボット名を入力してください' }, { status: 400 })
    }

    if (name.length > 80) {
      return NextResponse.json({ error: 'ボット名は80文字以下で入力してください' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: '説明は500文字以下で入力してください' }, { status: 400 })
    }

    const bot = await prisma.bot.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: user.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    return NextResponse.json(bot, { status: 201 })
  } catch (error) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}