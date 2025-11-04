import { Databases, Query, ID } from 'appwrite'
import { appwriteClient } from './appwrite'
import { DB_ID, NOTES_ID } from './config'
import { getCurrentUser } from './auth'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types/note'
import type { NoteDocument } from './types'

const databases = new Databases(appwriteClient)

// Re-export types for convenience
export type { Note, CreateNoteInput, UpdateNoteInput }

/**
 * Map Appwrite document format ($id) to Note format (id)
 */
function mapAppwriteNoteToNote(doc: NoteDocument): Note {
  return {
    id: doc.$id,
    title: doc.title,
    content: doc.content,
    summary: doc.summary || undefined,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/**
 * Get all notes for the current user
 */
export async function getNotes(): Promise<Note[]> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const response = await databases.listDocuments(DB_ID, NOTES_ID, [
    Query.equal('userId', user.$id),
    Query.orderDesc('updatedAt'),
  ])

  return response.documents.map((doc) =>
    mapAppwriteNoteToNote(doc as unknown as NoteDocument)
  )
}

/**
 * Get a single note by ID
 */
export async function getNote(noteId: string): Promise<Note> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const note = (await databases.getDocument(
    DB_ID,
    NOTES_ID,
    noteId
  )) as unknown as NoteDocument

  // Verify the note belongs to the current user
  if (note.userId !== user.$id) {
    throw new Error('Note not found or access denied')
  }

  return mapAppwriteNoteToNote(note)
}

/**
 * Create a new note
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const now = new Date().toISOString()

  const note = (await databases.createDocument(
    DB_ID,
    NOTES_ID,
    ID.unique(),
    {
      title: input.title,
      content: input.content,
      summary: input.summary || null,
      userId: user.$id,
      createdAt: now,
      updatedAt: now,
    }
  )) as unknown as NoteDocument

  return mapAppwriteNoteToNote(note)
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  input: UpdateNoteInput
): Promise<Note> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the note belongs to the current user
  const existingNote = await getNote(noteId)
  if (existingNote.userId !== user.$id) {
    throw new Error('Note not found or access denied')
  }

  const updateData: Partial<NoteDocument> = {
    updatedAt: new Date().toISOString(),
  }

  if (input.title !== undefined) {
    updateData.title = input.title
  }
  if (input.content !== undefined) {
    updateData.content = input.content
  }
  if (input.summary !== undefined) {
    updateData.summary = input.summary || null
  }

  const note = (await databases.updateDocument(
    DB_ID,
    NOTES_ID,
    noteId,
    updateData
  )) as unknown as NoteDocument

  return mapAppwriteNoteToNote(note)
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the note belongs to the current user
  const existingNote = await getNote(noteId)
  if (existingNote.userId !== user.$id) {
    throw new Error('Note not found or access denied')
  }

  await databases.deleteDocument(DB_ID, NOTES_ID, noteId)
}

