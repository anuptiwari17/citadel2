// lib/auth.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Local type definitions to avoid relying on a non-exported member from ../types/database
type UserRole = string
type AuthPayload = { id: string; role: UserRole; [key: string]: unknown }

const JWT_SECRET = process.env.JWT_SECRET!

export async function getCurrentUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('citadel-auth')?.value
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload
  } catch {
    return null
  }
}

export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<AuthPayload> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden')
  }

  return user
}