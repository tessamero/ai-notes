/**
 * Deploy script for Appwrite Function: summarize-note
 * 
 * This script uses the Appwrite CLI to deploy the function.
 * Make sure you have the Appwrite CLI installed and configured.
 * 
 * Installation:
 *   npm install -g appwrite-cli
 * 
 * Configuration:
 *   appwrite login
 *   appwrite init project
 * 
 * Usage:
 *   node scripts/deploy-function.js
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const functionPath = join(projectRoot, 'functions', 'summarize-note')

console.log('📦 Deploying Appwrite Function: summarize-note\n')

// Check if Appwrite CLI is installed
try {
  execSync('appwrite --version', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ Appwrite CLI not found. Please install it first:')
  console.error('   npm install -g appwrite-cli')
  console.error('   appwrite login')
  process.exit(1)
}

// Read environment variables
const envVars = {
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
  NOTES_DB_ID: process.env.NOTES_DB_ID || 'main',
  NOTES_COLLECTION_ID: process.env.NOTES_COLLECTION_ID || 'notes',
}

// Validate required environment variables
const required = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY']
const missing = required.filter(key => !envVars[key])

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:')
  missing.forEach(key => console.error(`   - ${key}`))
  console.error('\nPlease set these environment variables before deploying.')
  process.exit(1)
}

console.log('✅ Environment variables validated\n')

// Deploy function
try {
  console.log('🚀 Deploying function...\n')
  
  // Use Appwrite CLI to deploy
  // Note: This assumes you've already created the function in Appwrite Console
  // and have the function ID. You'll need to adjust this based on your setup.
  
  const command = `appwrite functions createDeployment \
    --functionId="summarize-note" \
    --entrypoint="main.js" \
    --code="${functionPath}" \
    --activate=true`

  console.log('Executing:', command.replace(/\s+/g, ' '))
  console.log('\n')

  execSync(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envVars,
    },
  })

  console.log('\n✅ Function deployed successfully!')
  console.log('\n📝 Next steps:')
  console.log('   1. Go to Appwrite Console > Functions > summarize-note')
  console.log('   2. Set the following environment variables:')
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`      - ${key}${value ? ` (current: ${value.substring(0, 20)}...)` : ''}`)
  })
  console.log('   3. Activate the function')
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message)
  console.error('\n💡 Alternative: Deploy manually using Appwrite Console:')
  console.error('   1. Go to Appwrite Console > Functions')
  console.error('   2. Create or select the "summarize-note" function')
  console.error('   3. Upload the function code from:', functionPath)
  console.error('   4. Set environment variables in the function settings')
  process.exit(1)
}

