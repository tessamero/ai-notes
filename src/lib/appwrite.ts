import { Client } from 'appwrite'

/**
 * Appwrite client helper
 * Reads configuration from environment variables:
 * - VITE_APPWRITE_ENDPOINT: Your Appwrite endpoint URL
 * - VITE_APPWRITE_PROJECT_ID: Your Appwrite project ID
 */
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID

if (!endpoint) {
  console.error(
    '❌ VITE_APPWRITE_ENDPOINT environment variable is required.\n' +
    '   Please create a .env file in the project root with:\n' +
    '   VITE_APPWRITE_ENDPOINT=your_endpoint_url\n' +
    '   VITE_APPWRITE_PROJECT_ID=your_project_id'
  )
}

if (!projectId) {
  console.error(
    '❌ VITE_APPWRITE_PROJECT_ID environment variable is required.\n' +
    '   Please create a .env file in the project root with:\n' +
    '   VITE_APPWRITE_ENDPOINT=your_endpoint_url\n' +
    '   VITE_APPWRITE_PROJECT_ID=your_project_id'
  )
}

if (!endpoint || !projectId) {
  throw new Error(
    'Missing Appwrite environment variables. Please create a .env file with VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID'
  )
}

export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)

