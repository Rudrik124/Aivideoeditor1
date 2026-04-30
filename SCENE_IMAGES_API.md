# Scene and Image Generation API

## Overview

The `/api/scene-images` endpoint generates scene variations from a user prompt and fetches corresponding high-quality images using multiple image APIs (Pexels, Pixabay, Unsplash with fallback support).

## Endpoint Details

### POST `/api/scene-images`

**Request:**
```json
{
  "prompt": "A beautiful sunset over the ocean"
}
```

**Response (Success):**
```json
{
  "success": true,
  "scenes": [
    "Wide view of sunset ocean with detailed horizon",
    "Close-up of sunset ocean waves with detailed focus",
    "Sunset ocean with dramatic cinematic lighting and shadows",
    "Sunset ocean in richly detailed surroundings",
    "Ocean from an interesting perspective"
  ],
  "images": [
    "https://images.pexels.com/...",
    "https://images.pexels.com/...",
    "https://cdn.pixabay.com/...",
    "https://images.unsplash.com/..."
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Requirements & Features

### ✅ Scene Generation
- Generates **5 scene variations** from input prompt:
  1. **Wide shot** - Full environmental view
  2. **Close-up** - Detailed focus perspective
  3. **Cinematic lighting** - Dramatic mood/atmosphere
  4. **Detailed environment** - Context and surroundings
  5. **Different angle** - Unique camera perspective

- Uses **intelligent keyword extraction** to identify main subjects, actions, and locations
- Removes stop words and non-searchable descriptive terms

### ✅ Image Fetching (Multi-API Fallback)
- **Primary**: Pexels API (free, high-quality stock photos)
- **Fallback 1**: Pixabay API (backup source)
- **Fallback 2**: Unsplash API (tertiary source)
- Fetches **1 image per scene** (5+ images total)
- Returns **high-quality URLs** (`src.original` or `src.large` from Pexels, similar from others)
- Gracefully handles API failures with fallback strategy

### ✅ Error Handling
- Validates input (prompt required)
- Checks for configured API keys
- Requires **minimum 2 images** before returning success
- Clear error messages for debugging
- Try/catch blocks around all async operations
- Console logging for monitoring

### ✅ Code Quality
- `async/await` for clean asynchronous code
- Modular functions with single responsibilities:
  - `generateScenes(prompt)` - Scene variation generation
  - `fetchImageFromPexels(query, apiKey)` - Pexels API integration
  - `fetchImageFromPixabay(query, apiKey)` - Pixabay API integration
  - `fetchImageFromUnsplash(query, apiKey)` - Unsplash API integration
  - `generateScenesWithImages(prompt, ...)` - Orchestration
- No unnecessary console logs (only errors and status updates)
- Proper error message formatting

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Primary image source
PEXELS_API_KEY=your_pexels_api_key_here

# Optional fallback sources
PIXABAY_API_KEY=your_pixabay_api_key_here
UNSPLASH_API_KEY=your_unsplash_api_key_here
```

### How to Get API Keys

1. **Pexels**: 
   - Visit https://www.pexels.com/api/
   - Click "Request API Key"
   - Free tier: 200 requests/hour

2. **Pixabay** (Optional):
   - Visit https://pixabay.com/api/docs/
   - Sign up and get API key
   - Free tier: 50 requests/hour

3. **Unsplash** (Optional):
   - Visit https://unsplash.com/developers
   - Create application
   - Free tier: 50 requests/hour

## Usage Examples

### cURL
```bash
curl -X POST http://localhost:5000/api/scene-images \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A chef preparing fresh pasta in an Italian kitchen"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:5000/api/scene-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A professional photographer shooting in a tropical rainforest'
  })
});

const data = await response.json();
console.log(data.scenes);   // Array of scene descriptions
console.log(data.images);   // Array of image URLs
```

### Python
```python
import requests
import json

response = requests.post(
    'http://localhost:5000/api/scene-images',
    headers={'Content-Type': 'application/json'},
    json={'prompt': 'A modern office with natural lighting'}
)

result = response.json()
print(f"Generated {len(result['scenes'])} scenes")
print(f"Fetched {len(result['images'])} images")
```

## Implementation Details

### Files Modified

1. **`server.js`** (2 changes):
   - Added import statement for scene functions
   - Added POST endpoint `/api/scene-images`

2. **`server-scenes.js`** (new file):
   - Core scene generation logic
   - API integration functions (Pexels, Pixabay, Unsplash)
   - Error handling and validation

### Request/Response Flow

```
1. Client sends POST request with prompt
   ↓
2. Validate prompt (required, non-empty)
   ↓
3. Check API key configuration (at least one source required)
   ↓
4. Generate 5 scene variations from prompt
   ↓
5. For each scene:
   - Extract searchable keywords
   - Try Pexels API
   - If failed, try Pixabay API
   - If failed, try Unsplash API
   - Store URL if successful
   ↓
6. Validate minimum 2 images fetched
   ↓
7. Return success response with scenes and image URLs
```

## Error Scenarios & Handling

| Scenario | Status | Response |
|----------|--------|----------|
| Missing prompt | 400 | `"Prompt is required"` |
| No API keys configured | 500 | `"No image API keys configured..."` |
| All API calls failed | 500 | `"Failed to fetch minimum 2 images..."` |
| Invalid API key | 500 | `"Scene and image generation failed"` |
| Network error | 500 | Error message from catch block |

## Performance Notes

- **Speed**: ~2-5 seconds (depends on API response times)
- **Concurrency**: Sequential image fetching (no parallel requests)
- **Caching**: None (fresh API calls each time)
- **Rate Limiting**: Depends on image API tier limits

## Future Enhancements (Optional)

- Parallel image fetching for faster responses
- Response caching with TTL
- Support for custom number of scenes
- Image filtering/rating parameters
- Batch prompt processing
- Weighted preference for image sources
- Retry logic with exponential backoff

## Troubleshooting

**Issue**: "No image API keys configured"
- **Solution**: Add at least one of `PEXELS_API_KEY`, `PIXABAY_API_KEY`, or `UNSPLASH_API_KEY` to `.env`

**Issue**: "Failed to fetch minimum 2 images"
- **Solution**: 
  - Check API key validity
  - Verify API account isn't rate-limited
  - Try a different prompt with clearer keywords
  - Enable additional fallback APIs

**Issue**: Empty images array
- **Solution**: Check console logs for API errors, verify network connectivity

**Issue**: Slow response time
- **Solution**: This is normal (API calls are sequential). Consider implementing parallel fetching if needed.

## Testing

To test the endpoint locally:

```bash
# Start the server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:5000/api/scene-images \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful mountain landscape"}'
```

Expected response: 5 scene descriptions + 2-5 image URLs
