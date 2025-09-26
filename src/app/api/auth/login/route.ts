import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { authenticate } from '@/lib/auth'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードが必要です' }, { status: 400 })
    }

    const user = await authenticate(email, password)

    if (!user) {
      return NextResponse.json({ error: 'メールアドレスまたはパスワードが間違っています' }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}