import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, logout } from '../lib/auth'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../lib/notes'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types/note'
import { Plus, Edit2, Trash2, X, Save, Loader2, Sparkles } from 'lucide-react'
import { summarizeNote } from '../lib/functions'

export const Route = createFileRoute('/notes')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/notes',
        },
      })
    }
  },
  component: Notes,
})

function Notes() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [summarizingId, setSummarizingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateNoteInput>({
    title: '',
    content: '',
    summary: '',
  })

  // Refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const createTitleInputRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const editButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [])

  // Focus error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  // Focus success message when it appears
  useEffect(() => {
    if (successMessage && successRef.current) {
      successRef.current.focus()
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Focus title input when editing starts
  useEffect(() => {
    if (editingId && titleInputRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 0)
    }
  }, [editingId])

  // Focus create form title input after successful creation
  useEffect(() => {
    if (!isCreating && formData.title === '' && formData.content === '' && createTitleInputRef.current) {
      createTitleInputRef.current.focus()
    }
  }, [isCreating, formData.title, formData.content])

  const loadNotes = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
    } catch (err: any) {
      setError(err.message || 'Failed to load notes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleCreateNote = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const newNote = await createNote({
        title: formData.title.trim(),
        content: formData.content.trim(),
        summary: formData.summary?.trim() || undefined,
      })
      setNotes([newNote, ...notes])
      setFormData({ title: '', content: '', summary: '' })
      setSuccessMessage('Note created successfully')
      setIsCreating(false)
      // Focus will be managed by useEffect
    } catch (err: any) {
      setError(err.message || 'Failed to create note. Please try again.')
      setIsCreating(false)
    }
  }

  const handleUpdateNote = async (noteId: string, input: UpdateNoteInput) => {
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedNote = await updateNote(noteId, input)
      setNotes(notes.map((note) => (note.id === noteId ? updatedNote : note)))
      setEditingId(null)
      setSuccessMessage('Note updated successfully')
      // Return focus to edit button
      setTimeout(() => {
        editButtonRefs.current[noteId]?.focus()
      }, 0)
    } catch (err: any) {
      setError(err.message || 'Failed to update note. Please try again.')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    // Store the note index for focus management after deletion
    const noteIndex = notes.findIndex(n => n.id === noteId)
    const noteToDelete = notes[noteIndex]

    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    setError(null)
    setSuccessMessage(null)
    setDeleteId(noteId)
    try {
      await deleteNote(noteId)
      setNotes(notes.filter((note) => note.id !== noteId))
      setDeleteId(null)
      setSuccessMessage(`Note "${noteToDelete.title}" deleted successfully`)
      
      // Focus management: focus next note's edit button, or previous, or list
      setTimeout(() => {
        const remainingNotes = notes.filter((note) => note.id !== noteId)
        if (remainingNotes.length > 0) {
          const focusIndex = noteIndex < remainingNotes.length ? noteIndex : remainingNotes.length - 1
          const nextNoteId = remainingNotes[focusIndex].id
          editButtonRefs.current[nextNoteId]?.focus()
        }
      }, 0)
    } catch (err: any) {
      setError(err.message || 'Failed to delete note. Please try again.')
      setDeleteId(null)
    }
  }

  const handleSummarizeNote = async (noteId: string) => {
    setError(null)
    setSuccessMessage(null)
    setSummarizingId(noteId)
    try {
      const result = await summarizeNote(noteId)
      // Reload notes to get the updated summary from the database
      // The function already updated the note's summary field
      await loadNotes()
      setSuccessMessage('Note summarized successfully')
      setSummarizingId(null)
    } catch (err: any) {
      setError(err.message || 'Failed to summarize note. Please try again.')
      setSummarizingId(null)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setFormData({
      title: note.title,
      content: note.content,
      summary: note.summary || '',
    })
  }

  const cancelEditing = () => {
    const noteId = editingId
    setEditingId(null)
    setFormData({ title: '', content: '', summary: '' })
    // Return focus to edit button
    if (noteId) {
      setTimeout(() => {
        editButtonRefs.current[noteId]?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const handleEscapeKey = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      action()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite" aria-label="Loading notes">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-400">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            My Notes
          </h1>
          <button
            onClick={handleLogout}
            onKeyDown={(e) => handleKeyDown(e, handleLogout)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-400 border border-red-500/50 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 "
            aria-label="Logout from your account"
          >
            Logout
          </button>
        </header>

        {/* Success message */}
        {successMessage && (
          <div
            ref={successRef}
            role="status"
            aria-live="polite"
            className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            tabIndex={-1}
          >
            <div className="flex justify-between items-center gap-4">
              <span className="flex-1">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                onKeyDown={(e) => handleKeyDown(e, () => setSuccessMessage(null))}
                className="text-green-400 hover:text-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded p-1 transition-colors"
                aria-label="Dismiss success message"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            tabIndex={-1}
          >
            <div className="flex justify-between items-center gap-4">
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                onKeyDown={(e) => handleKeyDown(e, () => setError(null))}
                className="text-red-400 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded p-1 transition-colors"
                aria-label="Dismiss error message"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Async status announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isCreating && 'Creating note...'}
          {summarizingId && 'Summarizing note...'}
          {deleteId && 'Deleting note...'}
          {editingId && 'Editing note...'}
        </div>

        {/* Create Note Form */}
        <section
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          aria-labelledby="create-note-heading"
        >
          <h2 id="create-note-heading" className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Plus size={24} aria-hidden="true" />
            Create New Note
          </h2>
          <form onSubmit={handleCreateNote} className="space-y-5" aria-label="Create new note form">
            <div>
              <label
                htmlFor="note-title"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Title <span className="text-red-400" aria-label="required">*</span>
              </label>
              <input
                id="note-title"
                ref={createTitleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Note title"
                disabled={isCreating}
                required
                aria-required="true"
                aria-describedby="title-help title-error"
                aria-invalid={!formData.title.trim() && formData.title.length > 0}
              />
              <p id="title-help" className="sr-only">Enter a title for your note</p>
              {!formData.title.trim() && formData.title.length > 0 && (
                <p id="title-error" className="text-red-400 text-xs mt-1" role="alert">
                  Title is required
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="note-content"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Content <span className="text-red-400" aria-label="required">*</span>
              </label>
              <textarea
                id="note-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:border-transparent transition-all duration-200 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Note content"
                disabled={isCreating}
                required
                aria-required="true"
                aria-describedby="content-help content-error"
                aria-invalid={!formData.content.trim() && formData.content.length > 0}
              />
              <p id="content-help" className="sr-only">Enter the content for your note</p>
              {!formData.content.trim() && formData.content.length > 0 && (
                <p id="content-error" className="text-red-400 text-xs mt-1" role="alert">
                  Content is required
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="note-summary"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Summary <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                id="note-summary"
                type="text"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Brief summary"
                disabled={isCreating}
                aria-describedby="summary-help"
              />
              <p id="summary-help" className="sr-only">Optional brief summary of the note</p>
            </div>
            <button
              type="submit"
              disabled={isCreating || !formData.title.trim() || !formData.content.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
              aria-label={isCreating ? 'Creating note, please wait' : 'Create new note'}
              aria-busy={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={20} aria-hidden="true" />
                  <span>Create Note</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-gray-400 text-lg">
              No notes yet. Create your first note above!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6" role="list" aria-label="Notes list">
            {notes.map((note, index) => (
              <article
                key={note.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:border-slate-600 transition-all duration-300"
                role="listitem"
                aria-labelledby={`note-title-${note.id}`}
              >
                {editingId === note.id ? (
                  <div 
                    className="space-y-5" 
                    role="form" 
                    aria-label={`Edit note: ${note.title}`}
                    onKeyDown={(e) => handleEscapeKey(e, cancelEditing)}
                  >
                    <div>
                      <label
                        htmlFor={`edit-title-${note.id}`}
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Title <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <input
                        id={`edit-title-${note.id}`}
                        ref={titleInputRef}
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition-all duration-200"
                        required
                        aria-required="true"
                        aria-invalid={!formData.title.trim()}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`edit-content-${note.id}`}
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Content <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <textarea
                        id={`edit-content-${note.id}`}
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition-all duration-200 resize-y"
                        required
                        aria-required="true"
                        aria-invalid={!formData.content.trim()}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`edit-summary-${note.id}`}
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Summary <span className="text-gray-500 text-xs">(optional)</span>
                      </label>
                      <input
                        id={`edit-summary-${note.id}`}
                        type="text"
                        value={formData.summary}
                        onChange={(e) =>
                          setFormData({ ...formData, summary: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          handleUpdateNote(note.id, {
                            title: formData.title.trim(),
                            content: formData.content.trim(),
                            summary: formData.summary?.trim() || undefined,
                          })
                        }
                        onKeyDown={(e) => handleKeyDown(e, () =>
                          handleUpdateNote(note.id, {
                            title: formData.title.trim(),
                            content: formData.content.trim(),
                            summary: formData.summary?.trim() || undefined,
                          })
                        )}
                        disabled={!formData.title.trim() || !formData.content.trim()}
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
                        aria-label="Save changes to note"
                      >
                        <Save size={16} aria-hidden="true" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        onKeyDown={(e) => handleEscapeKey(e, cancelEditing)}
                        className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
                        aria-label="Cancel editing"
                      >
                        <X size={16} aria-hidden="true" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          id={`note-title-${note.id}`}
                          className="text-xl font-semibold text-white mb-2 break-words"
                        >
                          {note.title}
                        </h3>
                        {note.summary && (
                          <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                            {note.summary}
                          </p>
                        )}
                        <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                          {note.content}
                        </p>
                        <dl className="mt-4 text-xs text-gray-500 space-y-1">
                          <div className="flex gap-2">
                            <dt className="font-medium">Created:</dt>
                            <dd>
                              <time dateTime={note.createdAt}>
                                {new Date(note.createdAt).toLocaleString()}
                              </time>
                            </dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-medium">Updated:</dt>
                            <dd>
                              <time dateTime={note.updatedAt}>
                                {new Date(note.updatedAt).toLocaleString()}
                              </time>
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div className="flex gap-2 flex-shrink-0" role="group" aria-label={`Actions for note: ${note.title}`}>
                        <button
                          onClick={() => handleSummarizeNote(note.id)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleSummarizeNote(note.id))}
                          disabled={summarizingId === note.id}
                          className="p-2.5 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-400 border border-purple-500/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
                          title="Summarize note"
                          aria-label={`Summarize note: ${note.title}`}
                          aria-busy={summarizingId === note.id}
                        >
                          {summarizingId === note.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Sparkles size={18} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          ref={(el) => {
                            editButtonRefs.current[note.id] = el
                          }}
                          onClick={() => startEditing(note)}
                          onKeyDown={(e) => handleKeyDown(e, () => startEditing(note))}
                          className="p-2.5 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 border border-blue-500/50 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
                          title="Edit note"
                          aria-label={`Edit note: ${note.title}`}
                        >
                          <Edit2 size={18} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleDeleteNote(note.id))}
                          disabled={deleteId === note.id}
                          className="p-2.5 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-400 border border-red-500/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 "
                          title="Delete note"
                          aria-label={`Delete note: ${note.title}`}
                          aria-busy={deleteId === note.id}
                        >
                          {deleteId === note.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 size={18} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
