import { describe, it, expect } from 'vitest'
import { localSummarize } from '../localSummarize'

describe('localSummarize', () => {
  describe('sentence clamping', () => {
    it('should return 1 sentence when maxSentences is 1', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.'
      const result = localSummarize(text, 1)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(1)
    })

    it('should return 2 sentences when maxSentences is 2', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.'
      const result = localSummarize(text, 2)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(2)
    })

    it('should clamp maxSentences to 2 when value exceeds 2', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.'
      const result = localSummarize(text, 5)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBeLessThanOrEqual(2)
    })

    it('should clamp maxSentences to 1 when value is less than 1', () => {
      const text = 'First sentence. Second sentence. Third sentence.'
      const result = localSummarize(text, 0)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(1)
    })

    it('should clamp maxSentences to 1 when value is negative', () => {
      const text = 'First sentence. Second sentence. Third sentence.'
      const result = localSummarize(text, -5)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(1)
    })
  })

  describe('return value length', () => {
    it('should always return 1-2 sentences regardless of input length', () => {
      const longText = `
        This is the first sentence with important keywords.
        This is the second sentence with different keywords.
        This is the third sentence with more content.
        This is the fourth sentence with additional information.
        This is the fifth sentence with even more details.
        This is the sixth sentence with comprehensive content.
        This is the seventh sentence with extensive information.
      `.trim()

      const result = localSummarize(longText)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBeGreaterThanOrEqual(1)
      expect(sentences.length).toBeLessThanOrEqual(2)
    })

    it('should return 1 sentence for short text', () => {
      const shortText = 'This is a short text with one sentence.'
      const result = localSummarize(shortText)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(1)
    })

    it('should return 2 sentences for text with exactly 2 sentences', () => {
      const twoSentenceText = 'First sentence here. Second sentence here.'
      const result = localSummarize(twoSentenceText, 2)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      expect(localSummarize('')).toBe('')
      expect(localSummarize('   ')).toBe('')
    })

    it('should handle text with no sentence endings', () => {
      const text = 'This is text without sentence endings'
      const result = localSummarize(text)
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle text with only punctuation', () => {
      const text = '... !!! ???'
      const result = localSummarize(text)
      expect(result).toBe('')
    })

    it('should default to 2 sentences when maxSentences is not provided', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.'
      const result = localSummarize(text)
      const sentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length).toBeLessThanOrEqual(2)
    })
  })

  describe('summary quality', () => {
    it('should return meaningful summary', () => {
      const text = `
        The quick brown fox jumps over the lazy dog.
        Machine learning is transforming technology.
        Artificial intelligence enables new possibilities.
        Data science helps analyze complex problems.
      `.trim()

      const result = localSummarize(text, 2)
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
      expect(result.endsWith('.')).toBe(true)
    })

    it('should maintain sentence order in output', () => {
      const text = 'First sentence. Second sentence. Third sentence.'
      const result = localSummarize(text, 2)
      // The first sentence should appear before the second
      expect(result.indexOf('First')).toBeLessThan(result.indexOf('Second'))
    })
  })
})

