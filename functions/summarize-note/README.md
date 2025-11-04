# Summarize Note Function

Appwrite Function that generates summaries for notes using a local summarization algorithm (no external APIs required).

## Overview

This function:
1. Accepts a `noteId` in the request body
2. Loads the note content from Appwrite
3. Generates a summary using a local text summarization algorithm
4. Updates the note's `summary` field

## Environment Variables

The following environment variables must be set in the Appwrite Console:

- `APPWRITE_ENDPOINT` - Your Appwrite endpoint URL (e.g., `https://nyc.cloud.appwrite.io/v1`)
- `APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `APPWRITE_API_KEY` - Your Appwrite API key (server/admin key)
- `NOTES_DB_ID` - Database ID (default: `main`)
- `NOTES_COLLECTION_ID` - Collection ID (default: `notes`)

## Local Summarization Algorithm

The function uses a simple but effective local summarization algorithm that:

1. Splits text into sentences
2. Calculates word frequencies (excluding common stop words)
3. Scores sentences based on:
   - Keyword frequency (important words appear more)
   - Position (early sentences often contain key information)
4. Selects top sentences to form the summary

This approach requires no external APIs and works entirely locally.

## Request Format

```json
{
  "noteId": "note-id-here"
}
```

## Response Format

**Success (200):**
```json
{
  "success": true,
  "noteId": "note-id-here",
  "summary": "Generated summary text here.",
  "message": "Note summarized successfully"
}
```

**Error (400/404/500):**
```json
{
  "error": "Error message here"
}
```

## Deployment

### Using Appwrite Console (Recommended)

1. Go to Appwrite Console > Functions
2. Create a new function named `summarize-note`
3. Select Node.js runtime
4. Upload the function code from `functions/summarize-note/`
5. Set environment variables in Function Settings
6. Deploy and activate

### Using CLI Script

```bash
# Set environment variables
export APPWRITE_ENDPOINT="https://nyc.cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="your-project-id"
export APPWRITE_API_KEY="your-api-key"
export NOTES_DB_ID="main"
export NOTES_COLLECTION_ID="notes"

# Run deploy script
bash scripts/deploy-function.sh
```

## Testing

You can test the function using curl:

```bash
curl -X POST https://your-appwrite-endpoint/v1/functions/summarize-note/executions \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: your-project-id" \
  -d '{
    "data": {
      "noteId": "your-note-id"
    }
  }'
```

Or use the Appwrite SDK in your application to call the function.

## Notes

- The function requires a server/admin API key to read and update documents
- The summarization algorithm is simple but effective for general text
- Summary length is limited to 3 sentences by default
- The function automatically updates the `updatedAt` timestamp

