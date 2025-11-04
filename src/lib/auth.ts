import { Account, ID } from 'appwrite'
import { appwriteClient } from './appwrite'

export const account = new Account(appwriteClient)

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  try {
    return await account.get()
  } catch (error) {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  try {
    await account.get()
    return true
  } catch (error) {
    return false
  }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  return await account.createEmailPasswordSession(email, password)
}

/**
 * Signup with email and password
 */
export async function signup(email: string, password: string, name?: string) {
  return await account.create(ID.unique(), email, password, name)
}

/**
 * Logout
 */
export async function logout() {
  return await account.deleteSession('current')
}

