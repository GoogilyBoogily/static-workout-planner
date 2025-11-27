/**
 * YouTube Utility Functions
 *
 * Provides functions to extract and validate YouTube video IDs from URLs
 * and generate privacy-enhanced embed URLs.
 */

/**
 * Regex pattern for valid YouTube video IDs
 * YouTube video IDs are exactly 11 characters using Base64-like charset: A-Z, a-z, 0-9, _, -
 */
const YOUTUBE_VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/

/**
 * Extract YouTube video ID from watch URL
 *
 * Supports URLs in the format: youtube.com/watch?v=VIDEO_ID
 *
 * @param url - YouTube watch URL
 * @returns 11-character video ID or null if invalid
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
export function extractVideoId(url: string | null | undefined): string | null {
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

    // Validate video ID format: exactly 11 chars with valid Base64-like charset
    return videoId && YOUTUBE_VIDEO_ID_REGEX.test(videoId) ? videoId : null
  } catch {
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
 * @param videoId - 11-character YouTube video ID
 * @returns Privacy-enhanced embed URL
 *
 * @example
 * getEmbedUrl('dQw4w9WgXcQ')
 * // Returns: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
