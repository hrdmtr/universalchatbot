import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/session'

interface RouteParams {
  id: string
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUser()
    const { id } = await context.params

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, name } = body

    // Check if API key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが見つかりません' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    if (typeof name === 'string') {
      if (!name.trim()) {
        return NextResponse.json({ error: '名前を入力してください' }, { status: 400 })
      }
      if (name.length > 100) {
        return NextResponse.json({ error: '名前は100文字以下で入力してください' }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '更新するデータがありません' }, { status: 400 })
    }

    const updatedApiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(updatedApiKey)
  } catch (error) {
    console.error('Update API key error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUser()
    const { id } = await context.params

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Check if API key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが見つかりません' }, { status: 404 })
    }

    await prisma.apiKey.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}