# Video Creation from Images API

## Overview

The `/api/video-from-images` endpoint transforms image URLs into smooth, motion-enabled animated videos. Each image includes zoom and pan effects with fade transitions between scenes, creating a cinematic result without static slideshows.

## Endpoint Details

### POST `/api/video-from-images`

**Request:**
```json
{
  "images": [
    "https://images.pexels.com/...",
    "https://images.pexels.com/...",
    "https://cdn.pixabay.com/..."
  ],
  "options": {
    "width": 1280,
    "height": 720,
    "fps": 30,
    "imageDuration": 3,
    "transitionDuration": 0.8,
    "enableZoom": true,
    "enablePan": true,
    "scaleEnd": 1.15
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "video": "https://supabase-url/.../animated-video-1234567890.mp4",
  "storage": "AI_Generated_Video/animated-video-1234567890.mp4",
  "framesRendered": 2160,
  "duration": 11.2
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Minimum 2 valid image URLs required"
}
```

## Requirements & Features

### ✅ Image Processing
- Accepts **2 or more image URLs** (HTTP/HTTPS)
- Downloads images from URLs with timeout protection
- Validates image accessibility before processing
- **Skips failed images** with graceful error handling
- **Requires minimum 2 valid images** before video creation

### ✅ Motion Effects
- **Zoom-in animation**: Scale from 1.0 to 1.15 (configurable) over image duration
  - Creates cinematic "push-in" effect
  - Smooth easing throughout image sequence
- **Pan effect** (optional): Subtle horizontal/vertical camera movement
  - Horizontal wave motion (left-right)
  - Vertical cosine motion (top-bottom)
  - Prevents static appearance
- Duration per image: **3-4 seconds** (configurable)

### ✅ Smooth Transitions
- **Fade between images**: 0.5-1 second crossfade
  - Image 1 opacity: 1 → 0
  - Image 2 opacity: 0 → 1
  - Seamless scene transitions
- No jarring cuts or jumps

### ✅ Video Output
- **Resolution options**: 1280x720 (default) or 1920x1080
- **Aspect ratio**: Automatic crop/fit to prevent distortion
- **FPS**: 30fps default (24/60fps supported)
- **Codec**: H.264 (libx264), MP4 container
- **Quality**: CRF 23 (high quality)
- Frame-based rendering with Canvas → FFmpeg encoding

### ✅ Supabase Integration
- Automatically uploads to configured bucket
- Returns both direct URL and storage path
- Falls back to local path if upload fails
- Cleans up temporary files after upload

### ✅ Error Handling
- Validates image URL format (proper URL parsing)
- Gracefully skips unreachable images
- Requires minimum 2 valid images (enforced twice)
- Clear error messages for debugging
- Cleanup of temporary files on success/failure
- Network timeout protection (10 seconds per image)

### ✅ Code Quality
- `async/await` throughout
- Modular functions with single responsibilities
- Canvas rendering separated from FFmpeg encoding
- Proper memory management (cleanup frames after encoding)
- Logging at each stage for monitoring
- No unnecessary console output

## Configuration

### Environment Variables
Uses existing Supabase configuration:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET_AI_GENERATED`

### Optional Parameters (in request)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| width | number | 1280 | Video width in pixels |
| height | number | 720 | Video height in pixels |
| fps | number | 30 | Frames per second |
| imageDuration | number | 3 | Seconds per image |
| transitionDuration | number | 0.8 | Fade transition length |
| enableZoom | boolean | true | Enable zoom-in effect |
| enablePan | boolean | true | Enable pan movement |
| scaleEnd | number | 1.15 | Final zoom scale (1.15 = 15% zoom) |

## Usage Examples

### cURL
```bash
curl -X POST http://localhost:5000/api/video-from-images \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "https://images.pexels.com/photos/...",
      "https://images.pexels.com/photos/..."
    ],
    "options": {
      "width": 1280,
      "height": 720,
      "imageDuration": 4,
      "transitionDuration": 1
    }
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:5000/api/video-from-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [
      'https://images.pexels.com/...',
      'https://images.pexels.com/...'
    ],
    options: {
      width: 1920,
      height: 1080,
      imageDuration: 3.5,
      enableZoom: true,
      enablePan: true
    }
  })
});

const data = await response.json();
if (data.success) {
  console.log('Video URL:', data.video);
  console.log('Duration:', data.duration, 'seconds');
}
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:5000/api/video-from-images',
    json={
        'images': [
            'https://images.pexels.com/...',
            'https://images.pexels.com/...'
        ],
        'options': {
            'width': 1280,
            'height': 720,
            'imageDuration': 3,
            'scaleEnd': 1.2
        }
    }
)

result = response.json()
if result['success']:
    print(f"Video created: {result['video']}")
    print(f"Duration: {result['duration']} seconds")
    print(f"Frames rendered: {result['framesRendered']}")
```

## Implementation Details

### Files Modified/Created

1. **`server-video-from-images.js`** (new file):
   - `downloadImage()` - Fetches image from URL
   - `loadCanvasImage()` - Loads image into Canvas
   - `renderFrame()` - Renders single frame with zoom/pan
   - `renderTransition()` - Renders fade transition
   - `createVideoFromImages()` - Main orchestration function

2. **`server.js`** (updated):
   - Added import for video creation
   - Added `POST /api/video-from-images` endpoint

### Processing Flow

```
1. Client sends POST with image URLs
   ↓
2. Validate inputs (minimum 2 images, proper URLs)
   ↓
3. Download images with timeout protection
   ↓
4. Filter valid images (minimum 2 required)
   ↓
5. Load images into Canvas
   ↓
6. For each image:
   - Render animation frames (zoom-in + pan)
   - Save as PNG to temp directory
   - Render transition to next image
   ↓
7. Use FFmpeg to encode PNGs → MP4
   ↓
8. Upload video to Supabase (optional)
   ↓
9. Cleanup temporary files
   ↓
10. Return video URL and metadata
```

### Video Rendering Parameters

**Per-Image Sequence:**
- Duration: 3 seconds (configurable)
- FPS: 30fps = 90 frames
- Animation: Zoom scale from 1.0 → 1.15
- Pan: Optional subtle movement

**Transition Sequence:**
- Duration: 0.8 seconds (configurable)
- FPS: 30fps = 24 frames
- Effect: Crossfade between images

**Total Video:**
- 3 images = ~11 seconds (3+0.8) × 3
- 5 images = ~19 seconds
- Formula: (imageDuration + transitionDuration) × imageCount

## Performance Notes

- **Speed**: 5-15 seconds (depends on image count and resolution)
  - Image download: ~1-3 seconds
  - Canvas rendering: ~2-8 seconds
  - FFmpeg encoding: ~2-5 seconds
- **Memory**: ~100-200 MB for typical 1280x720 @ 3 images
- **Disk**: Temporary frames cleaned up after encoding
- **Concurrency**: Sequential processing (one video at a time safe)

## Troubleshooting

**Issue**: "Minimum 2 valid image URLs required"
- **Solution**: Ensure URLs are properly formatted (http/https) and images are publicly accessible

**Issue**: "Failed to download minimum 2 valid images"
- **Solution**: Check image URLs are reachable, try different images, increase timeout

**Issue**: Video is distorted/stretched
- **Solution**: Images are auto-fit to aspect ratio. Check source image resolution.

**Issue**: Motion effects look choppy
- **Solution**: Increase FPS to 60 in options, or increase imageDuration

**Issue**: Upload to Supabase failed, but video created locally
- **Solution**: Check Supabase configuration. Video is still usable at local path.

## Advanced Usage

### High-Quality Export
```json
{
  "images": [...],
  "options": {
    "width": 1920,
    "height": 1080,
    "fps": 60,
    "imageDuration": 4,
    "transitionDuration": 1.5,
    "scaleEnd": 1.2
  }
}
```

### Slow-Motion Zoom
```json
{
  "options": {
    "imageDuration": 5,
    "scaleEnd": 1.3,
    "enablePan": false
  }
}
```

### Quick Slideshow with Aggressive Motion
```json
{
  "options": {
    "imageDuration": 2,
    "transitionDuration": 0.3,
    "scaleEnd": 1.25,
    "enablePan": true
  }
}
```

## Future Enhancements (Optional)

- Add background music audio track
- Add captions/text overlay per scene
- Parallel image downloading for speed
- Batch video creation
- Custom transition effects (blur, dissolve, etc.)
- Ken Burns effect variations
- Color grading/filtering per image
- Support for video file inputs (extract frames)

## Integration with Scene API

Combine with `/api/scene-images` for end-to-end workflow:

```javascript
// Step 1: Generate scenes and fetch images
const sceneResponse = await fetch('http://localhost:5000/api/scene-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Beautiful sunset' })
});
const { images } = await sceneResponse.json();

// Step 2: Create animated video from images
const videoResponse = await fetch('http://localhost:5000/api/video-from-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images,
    options: { width: 1280, height: 720 }
  })
});
const { video } = await videoResponse.json();

// Result: Prompt → Scenes → Images → Animated Video
console.log('Generated video:', video);
```

## Testing

```bash
# Start server
npm run dev

# In another terminal, test with sample images
curl -X POST http://localhost:5000/api/video-from-images \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      "https://images.pexels.com/photos/3586966/pexels-photo-3586966.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/3760793/pexels-photo-3760793.jpeg?auto=compress&cs=tinysrgb&w=600"
    ]
  }'
```

Expected response: MP4 video URL with metadata
