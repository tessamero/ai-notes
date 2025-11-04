/**
 * Local text summarizer helper
 * Uses sentence scoring based on keyword frequency and position
 * 
 * @param text - The text to summarize
 * @param maxSentences - Maximum number of sentences to return (default: 2, clamped to 1-2)
 * @returns Summary with 1-2 sentences
 */
export function localSummarize(text: string, maxSentences: number = 2): string {
  // Clamp maxSentences to 1-2 range
  const clampedMaxSentences = Math.max(1, Math.min(2, maxSentences))

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

  // If text is already short, return as-is (but ensure it's 1-2 sentences)
  if (sentences.length <= clampedMaxSentences) {
    const result = sentences.slice(0, clampedMaxSentences).join('. ') + '.'
    return result
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

  const wordFreq: Record<string, number> = {}
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

