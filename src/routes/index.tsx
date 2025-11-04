import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { getCurrentUser } from '../lib/auth'
import { FileText, LogIn, UserPlus, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if user is authenticated
    const user = await getCurrentUser()
    if (user) {
      // Redirect to notes if authenticated
      throw redirect({ to: '/notes' })
    }
  },
  component: App,
})

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <FileText className="w-16 h-16 text-cyan-400" />
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Notes
              </span>
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-300 mb-4 font-light">
            Your intelligent note-taking companion
          </p>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8">
            Create, organize, and summarize your notes with AI-powered features.
            Built with TanStack Start and Appwrite.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate({ to: '/login' })}
            className="w-full sm:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
          <button
            onClick={() => navigate({ to: '/signup' })}
            className="w-full sm:w-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 border border-slate-600 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
          >
            <UserPlus className="w-5 h-5" />
            Sign Up
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">AI Summaries</h3>
            <p className="text-xs text-gray-400">
              Automatically summarize your notes
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Rich Notes</h3>
            <p className="text-xs text-gray-400">
              Create and edit notes easily
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <LogIn className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Secure</h3>
            <p className="text-xs text-gray-400">
              Your data is safe and private
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
