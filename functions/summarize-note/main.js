/**
 * Appwrite Function: summarize-note
 * 
 * This function accepts a noteId, loads the note content from Appwrite,
 * generates a summary using a local summarizer algorithm, and updates
 * the note's summary field.
 * 
 * Environment Variables Required:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 * - NOTES_DB_ID
 * - NOTES_COLLECTION_ID
 */

import { Client, Databases } from 'node-appwrite'

// Note: For Appwrite functions, we keep the summarizer inline
// The shared helper is in src/lib/localSummarize.ts for testing
/**
 * Simple local text summarizer
 * Uses sentence scoring based on keyword frequency and position
 * Clamps to 1-2 sentences
 */
function summarizeText(text, maxSentences = 2) {
  if (!text || text.trim().length === 0) {
    return ''
  }

  // Clean and split into sentences
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (sentences.length === 0) {
    return ''
  }

  // Clamp maxSentences to 1-2 range
  const clampedMaxSentences = Math.max(1, Math.min(2, maxSentences))

  // If text is already short, return as-is (but ensure it's 1-2 sentences)
  if (sentences.length <= clampedMaxSentences) {
    return sentences.slice(0, clampedMaxSentences).join('. ') + '.'
  }

  // Calculate word frequencies (excluding common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))

  const wordFreq = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  // Score sentences based on word frequency and position
  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))

    // Calculate score: word frequency + position bonus
    let score = 0
    sentenceWords.forEach(word => {
      score += wordFreq[word] || 0
    })

    // Give bonus to early sentences (often contain important info)
    const positionBonus = sentences.length > 5 ? (1 / (index + 1)) * 0.5 : 0
    score += positionBonus

    return { sentence, score, index }
  })

  // Sort by score and take top sentences (clamped to 1-2)
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, clampedMaxSentences)
    .sort((a, b) => a.index - b.index) // Maintain original order
    .map(item => item.sentence)

  return topSentences.join('. ') + '.'
}

export default async ({ req, res, log, error }) => {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.json(
        { error: 'Method not allowed. Use POST.' },
        405
      )
    }

    const body = JSON.parse(req.body || '{}')
    const { noteId } = body

    if (!noteId) {
      return res.json(
        { error: 'noteId is required' },
        400
      )
    }

    // Get environment variables
    const endpoint = process.env.APPWRITE_ENDPOINT
    const projectId = process.env.APPWRITE_PROJECT_ID
    const apiKey = process.env.APPWRITE_API_KEY
    const dbId = process.env.NOTES_DB_ID
    const collectionId = process.env.NOTES_COLLECTION_ID

    if (!endpoint || !projectId || !apiKey || !dbId || !collectionId) {
      error('Missing required environment variables')
      return res.json(
        { error: 'Server configuration error' },
        500
      )
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey)

    const databases = new Databases(client)

    // Load the note
    log(`Loading note: ${noteId}`)
    let note
    try {
      note = await databases.getDocument(dbId, collectionId, noteId)
    } catch (err) {
      error(`Failed to load note: ${err.message}`)
      return res.json(
        { error: 'Note not found' },
        404
      )
    }

    // Check if note has content
    if (!note.content || note.content.trim().length === 0) {
      return res.json(
        { error: 'Note has no content to summarize' },
        400
      )
    }

    // Generate summary (returns 1-2 sentences)
    log('Generating summary...')
    const summary = summarizeText(note.content, 2)

    if (!summary || summary.trim().length === 0) {
      return res.json(
        { error: 'Failed to generate summary' },
        500
      )
    }

    // Update the note with the summary
    log('Updating note with summary...')
    const updatedNote = await databases.updateDocument(
      dbId,
      collectionId,
      noteId,
      {
        summary: summary,
        updatedAt: new Date().toISOString(),
      }
    )

    log('Summary generated and saved successfully')

    return res.json({
      success: true,
      noteId: updatedNote.$id,
      summary: summary,
      message: 'Note summarized successfully',
    })
  } catch (err) {
    error(`Function error: ${err.message}`)
    error(err.stack)
    return res.json(
      { error: err.message || 'Internal server error' },
      500
    )
  }
}

