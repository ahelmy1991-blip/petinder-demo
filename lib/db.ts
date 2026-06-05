import { randomUUID } from 'crypto'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

// Module-level store — persists for the lifetime of the server process
const users = new Map<string, User>()

export function findUserByEmail(email: string): User | undefined {
  for (const user of users.values()) {
    if (user.email === email) return user
  }
}

export function findUserById(id: string): User | undefined {
  return users.get(id)
}

export function createUser(data: Pick<User, 'name' | 'email' | 'passwordHash'>): User {
  const user: User = { id: randomUUID(), ...data, createdAt: new Date().toISOString() }
  users.set(user.id, user)
  return user
}
