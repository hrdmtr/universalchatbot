import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface User {
  userId: string
  email: string
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')

    if (!token) {
      return null
    }

    const payload = jwt.verify(token.value, JWT_SECRET) as User
    return payload
  } catch (error) {
    return null
  }
}