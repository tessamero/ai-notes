#!/bin/bash

# Deploy script for Appwrite Function: summarize-note
# 
# This script uses the Appwrite CLI to deploy the function.
# Make sure you have the Appwrite CLI installed and configured.
# 
# Installation:
#   npm install -g appwrite-cli
# 
# Configuration:
#   appwrite login
#   appwrite init project
# 
# Usage:
#   ./scripts/deploy-function.sh
#   OR
#   bash scripts/deploy-function.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FUNCTION_PATH="$PROJECT_ROOT/functions/summarize-note"

echo "📦 Deploying Appwrite Function: summarize-note"
echo ""

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI not found. Please install it first:"
    echo "   npm install -g appwrite-cli"
    echo "   appwrite login"
    exit 1
fi

# Read environment variables
APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT:-${VITE_APPWRITE_ENDPOINT}}"
APPWRITE_PROJECT_ID="${APPWRITE_PROJECT_ID:-${VITE_APPWRITE_PROJECT_ID}}"
APPWRITE_API_KEY="${APPWRITE_API_KEY}"
NOTES_DB_ID="${NOTES_DB_ID:-main}"
NOTES_COLLECTION_ID="${NOTES_COLLECTION_ID:-notes}"

# Validate required environment variables
if [ -z "$APPWRITE_ENDPOINT" ] || [ -z "$APPWRITE_PROJECT_ID" ] || [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ Missing required environment variables:"
    [ -z "$APPWRITE_ENDPOINT" ] && echo "   - APPWRITE_ENDPOINT"
    [ -z "$APPWRITE_PROJECT_ID" ] && echo "   - APPWRITE_PROJECT_ID"
    [ -z "$APPWRITE_API_KEY" ] && echo "   - APPWRITE_API_KEY"
    echo ""
    echo "Please set these environment variables before deploying."
    exit 1
fi

echo "✅ Environment variables validated"
echo ""

# Check if function directory exists
if [ ! -d "$FUNCTION_PATH" ]; then
    echo "❌ Function directory not found: $FUNCTION_PATH"
    exit 1
fi

# Deploy function
echo "🚀 Deploying function..."
echo ""

# Note: This assumes you've already created the function in Appwrite Console
# You may need to adjust the function ID or create it first

if appwrite functions createDeployment \
    --functionId="summarize-note" \
    --entrypoint="main.js" \
    --code="$FUNCTION_PATH" \
    --activate=true; then
    
    echo ""
    echo "✅ Function deployed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Go to Appwrite Console > Functions > summarize-note"
    echo "   2. Set the following environment variables:"
    echo "      - APPWRITE_ENDPOINT=$APPWRITE_ENDPOINT"
    echo "      - APPWRITE_PROJECT_ID=$APPWRITE_PROJECT_ID"
    echo "      - APPWRITE_API_KEY=***"
    echo "      - NOTES_DB_ID=$NOTES_DB_ID"
    echo "      - NOTES_COLLECTION_ID=$NOTES_COLLECTION_ID"
    echo "   3. Activate the function"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "💡 Alternative: Deploy manually using Appwrite Console:"
    echo "   1. Go to Appwrite Console > Functions"
    echo "   2. Create or select the 'summarize-note' function"
    echo "   3. Upload the function code from: $FUNCTION_PATH"
    echo "   4. Set environment variables in the function settings"
    exit 1
fi

