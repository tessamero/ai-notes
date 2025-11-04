/**
 * TypeScript types for Appwrite Note documents
 */

/**
 * Base Appwrite document structure
 */
export interface AppwriteDocument {
  $id: string
  $createdAt: string
  $updatedAt: string
  $permissions?: string[]
  $collectionId?: string
  $databaseId?: string
}

/**
 * Note document from Appwrite database
 * Extends AppwriteDocument with note-specific fields
 */
export interface NoteDocument extends AppwriteDocument {
  title: string
  content: string
  summary: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

/**
 * Note type for application use
 * Maps from Appwrite document format
 */
export interface Note {
  $id: string
  title: string
  content: string
  summary?: string
  userId: string
  createdAt: string
  updatedAt: string
}

/**
 * Input types for creating/updating notes
 */
export interface CreateNoteInput {
  title: string
  content: string
  summary?: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  summary?: string
}

/**
 * Type guard to check if an object is a valid Note
 */
export function isNote(obj: unknown): obj is Note {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '$id' in obj &&
    'title' in obj &&
    'content' in obj &&
    'userId' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj &&
    typeof (obj as Note).$id === 'string' &&
    typeof (obj as Note).title === 'string' &&
    typeof (obj as Note).content === 'string' &&
    typeof (obj as Note).userId === 'string' &&
    typeof (obj as Note).createdAt === 'string' &&
    typeof (obj as Note).updatedAt === 'string'
  )
}

/**
 * Type guard to check if an object is a valid CreateNoteInput
 */
export function isCreateNoteInput(obj: unknown): obj is CreateNoteInput {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'content' in obj &&
    typeof (obj as CreateNoteInput).title === 'string' &&
    typeof (obj as CreateNoteInput).content === 'string'
  )
}

