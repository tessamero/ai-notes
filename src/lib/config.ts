/**
 * Appwrite configuration
 * Database and Collection IDs
 * 
 * These IDs are set when the database and collection are created.
 * They can be overridden via environment variables if needed.
 */
export const appwriteConfig = {
  databaseId: 'main',
  collectionId: 'notes',
} as const

export const DB_ID = appwriteConfig.databaseId
export const NOTES_ID = appwriteConfig.collectionId

