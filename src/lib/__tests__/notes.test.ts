import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isNote, isCreateNoteInput } from '../../types/note'
import type { Note, CreateNoteInput } from '../../types/note'

describe('Type guards', () => {
  describe('isNote', () => {
    it('should return true for a valid Note object', () => {
      const validNote: Note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      expect(isNote(validNote)).toBe(true)
    })

    it('should return true for a Note with optional summary', () => {
      const noteWithSummary: Note = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        summary: 'Test summary',
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      expect(isNote(noteWithSummary)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isNote(null)).toBe(false)
    })

    it('should return false for an object missing required fields', () => {
      const invalidNote = {
        id: 'note-123',
        title: 'Test Note',
        // missing content, userId, etc.
      }
      expect(isNote(invalidNote)).toBe(false)
    })

    it('should return false for an object with wrong types', () => {
      const invalidNote = {
        id: 123, // should be string
        title: 'Test Note',
        content: 'Test content',
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      expect(isNote(invalidNote)).toBe(false)
    })
  })

  describe('isCreateNoteInput', () => {
    it('should return true for a valid CreateNoteInput', () => {
      const validInput: CreateNoteInput = {
        title: 'Test Note',
        content: 'Test content',
      }
      expect(isCreateNoteInput(validInput)).toBe(true)
    })

    it('should return true for CreateNoteInput with optional summary', () => {
      const inputWithSummary: CreateNoteInput = {
        title: 'Test Note',
        content: 'Test content',
        summary: 'Test summary',
      }
      expect(isCreateNoteInput(inputWithSummary)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isCreateNoteInput(null)).toBe(false)
    })

    it('should return false for an object missing required fields', () => {
      const invalidInput = {
        title: 'Test Note',
        // missing content
      }
      expect(isCreateNoteInput(invalidInput)).toBe(false)
    })

    it('should return false for an object with wrong types', () => {
      const invalidInput = {
        title: 123, // should be string
        content: 'Test content',
      }
      expect(isCreateNoteInput(invalidInput)).toBe(false)
    })
  })
})

