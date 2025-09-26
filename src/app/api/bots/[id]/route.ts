import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

interface RouteParams {
  id: string
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUser()
    const { id } = await context.params

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const bot = await prisma.bot.findFirst({
      where: {
        id,
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
      }
    })

    if (!bot) {
      return NextResponse.json({ error: 'ボットが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(bot)
  } catch (error) {
    console.error('Get bot error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUser()
    const { id } = await context.params

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

    const bot = await prisma.bot.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!bot) {
      return NextResponse.json({ error: 'ボットが見つかりません' }, { status: 404 })
    }

    const updatedBot = await prisma.bot.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
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

    return NextResponse.json(updatedBot)
  } catch (error) {
    console.error('Update bot error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}