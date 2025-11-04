import { Functions } from 'appwrite'
import { appwriteClient } from './appwrite'

const functions = new Functions(appwriteClient)

const FUNCTION_ID = 'summarize-note'

/**
 * Call the summarize-note function to generate a summary for a note
 */
export async function summarizeNote(noteId: string): Promise<{
  success: boolean
  noteId: string
  summary: string
  message: string
}> {
  const execution = await functions.createExecution(
    FUNCTION_ID,
    JSON.stringify({ noteId })
  )

  // Parse the response
  const response = JSON.parse(execution.responseBody || '{}')

  if (!response.success) {
    throw new Error(response.error || 'Failed to summarize note')
  }

  return response
}

