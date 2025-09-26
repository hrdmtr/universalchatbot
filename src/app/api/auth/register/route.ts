import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードが必要です' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'パスワードは6文字以上で入力してください' }, { status: 400 })
    }

    const user = await createUser(email, password)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email }
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'このメールアドレスは既に使用されています' }, { status: 409 })
    }

    console.error('Registration error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}