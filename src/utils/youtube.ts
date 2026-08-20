/**
 * Helper utilities to extract YouTube video ID and construct embeds / thumbnails
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const cleanUrl = url.trim();
  
  // Standard watch URLs (e.g. youtube.com/watch?v=VIDEO_ID)
  // Short URLs (e.g. youtu.be/VIDEO_ID)
  // Embed URLs (e.g. youtube.com/embed/VIDEO_ID)
  // Shorts URLs (e.g. youtube.com/shorts/VIDEO_ID)
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = cleanUrl.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  // If user entered just an 11-char ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
}

export function getYouTubeThumbnailUrl(videoId: string, quality: 'max' | 'hq' | 'default' = 'max'): string {
  if (quality === 'max') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'hq') {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}
