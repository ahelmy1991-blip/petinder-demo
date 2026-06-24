import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { Role } from './db'

const JWT_SECRET = process.env.JWT_SECRET ?? 'petinder-demo-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: Role
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}
