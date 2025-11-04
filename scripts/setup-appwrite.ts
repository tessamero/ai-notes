/**
 * Setup script to create Appwrite database and collection
 * 
 * This script requires Appwrite Admin/Server credentials
 * 
 * Run with: npx tsx scripts/setup-appwrite.ts
 * 
 * Environment variables required:
 * - APPWRITE_ENDPOINT: Your Appwrite endpoint URL
 * - APPWRITE_PROJECT_ID: Your Appwrite project ID
 * - APPWRITE_API_KEY: Your Appwrite API key (server/admin key)
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY

if (!endpoint) {
  throw new Error('APPWRITE_ENDPOINT or VITE_APPWRITE_ENDPOINT environment variable is required')
}

if (!projectId) {
  throw new Error('APPWRITE_PROJECT_ID or VITE_APPWRITE_PROJECT_ID environment variable is required')
}

if (!apiKey) {
  throw new Error('APPWRITE_API_KEY environment variable is required (use server/admin API key)')
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new Databases(client)

const DATABASE_ID = 'main'
const COLLECTION_ID = 'notes'

async function setupDatabase() {
  try {
    console.log('Creating database...')
    
    // Check if database already exists
    try {
      await databases.get(DATABASE_ID)
      console.log(`Database "${DATABASE_ID}" already exists`)
    } catch (error: any) {
      if (error.code === 404) {
        // Database doesn't exist, create it
        await databases.create(DATABASE_ID, 'Main Database')
        console.log(`Database "${DATABASE_ID}" created successfully`)
      } else {
        throw error
      }
    }

    console.log('Creating collection...')
    
    // Check if collection already exists
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID)
      console.log(`Collection "${COLLECTION_ID}" already exists`)
    } catch (error: any) {
      if (error.code === 404) {
        // Collection doesn't exist, create it
        await databases.createCollection(
          DATABASE_ID,
          COLLECTION_ID,
          'Notes',
          [
            // Read permissions for authenticated users
            Permission.read(Role.users()),
            // Write permissions for authenticated users
            Permission.write(Role.users()),
          ]
        )
        console.log(`Collection "${COLLECTION_ID}" created successfully`)

        // Add attributes
        console.log('Adding attributes...')

        // title (string, required, 1..120)
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'title',
          120,
          true
        )
        console.log('  - title attribute added')

        // content (string, required, 1..5000)
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'content',
          5000,
          true
        )
        console.log('  - content attribute added')

        // summary (string, optional)
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'summary',
          5000,
          false
        )
        console.log('  - summary attribute added')

        // userId (string, required)
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'userId',
          36, // User IDs are typically 36 chars
          true
        )
        console.log('  - userId attribute added')

        // createdAt (datetime, required)
        await databases.createDateTimeAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'createdAt',
          true
        )
        console.log('  - createdAt attribute added')

        // updatedAt (datetime, required)
        await databases.createDateTimeAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'updatedAt',
          true
        )
        console.log('  - updatedAt attribute added')

        console.log('\nWaiting for attributes to be indexed...')
        // Wait a bit for attributes to be indexed
        await new Promise(resolve => setTimeout(resolve, 3000))
      } else {
        throw error
      }
    }

    console.log('\n✅ Setup complete!')
    console.log(`Database ID: ${DATABASE_ID}`)
    console.log(`Collection ID: ${COLLECTION_ID}`)
    console.log('\nUpdate src/lib/config.ts with these IDs if needed.')
  } catch (error) {
    console.error('Error setting up Appwrite:', error)
    process.exit(1)
  }
}

setupDatabase()

