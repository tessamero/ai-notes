import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  // Validate route tree exists
  if (!routeTree) {
    console.error('Route tree is missing!')
    throw new Error('Route tree is not available')
  }

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Add default error handling for production
    defaultErrorComponent: ({ error }) => {
      console.error('Router error:', error)
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
            <p className="text-xl text-gray-300 mb-8">{error?.message || 'An error occurred'}</p>
            <a
              href="/"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      )
    },
    // Add not found handler - use 'root' to fallback to root route
    notFoundMode: 'root',
  })

  return router
}
