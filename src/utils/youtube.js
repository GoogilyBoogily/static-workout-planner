/**
 * YouTube Utility Functions
 *
 * Provides functions to extract and validate YouTube video IDs from URLs
 * and generate privacy-enhanced embed URLs.
 */

/**
 * Extract YouTube video ID from watch URL
 *
 * Supports URLs in the format: youtube.com/watch?v=VIDEO_ID
 *
 * @param {string} url - YouTube watch URL
 * @returns {string|null} - 11-character video ID or null if invalid
 *
 * @example
 * extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns: 'dQw4w9WgXcQ'
 *
 * extractVideoId('youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns: 'dQw4w9WgXcQ'
 *
 * extractVideoId('https://youtu.be/dQw4w9WgXcQ')
 * // Returns: null (short URLs not supported)
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    // Handle URLs with or without protocol
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)

    // Verify it's a YouTube watch URL
    if (!urlObj.hostname.includes('youtube.com') || !urlObj.pathname.includes('/watch')) {
      return null
    }

    // Extract 'v' parameter
    const videoId = urlObj.searchParams.get('v')

    // Validate video ID length (YouTube video IDs are exactly 11 characters)
    return videoId && videoId.length === 11 ? videoId : null
  } catch (error) {
    // Invalid URL format
    return null
  }
}

/**
 * Generate privacy-enhanced YouTube embed URL from video ID
 *
 * Uses youtube-nocookie.com domain for GDPR compliance.
 * No tracking cookies are set until the user actively plays the video.
 *
 * @param {string} videoId - 11-character YouTube video ID
 * @returns {string} - Privacy-enhanced embed URL
 *
 * @example
 * getEmbedUrl('dQw4w9WgXcQ')
 * // Returns: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
 */
export function getEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
