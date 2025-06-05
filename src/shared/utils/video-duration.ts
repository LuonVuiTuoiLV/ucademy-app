// utils/videoDuration.ts
export const getVideoDuration = async (
  videoUrl: string,
): Promise<number | null> => {
  try {
    // Check if it's YouTube URL
    const youtubeId = extractYouTubeId(videoUrl);
    if (youtubeId) {
      return await getYouTubeDuration(youtubeId);
    }

    // Check if it's Mux URL or ID
    const muxId = extractMuxId(videoUrl);
    if (muxId) {
      return await getMuxDuration(muxId);
    }

    return null;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return null;
  }
};

// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([^#&?]+)/, // youtu.be/VIDEO_ID
    /[?&]v=([^#&?]+)/, // youtube.com/watch?v=VIDEO_ID
    /googleusercontent\.com\/youtube\.com\/([^#&?]+)/, // googleusercontent.com/youtube.com/VIDEO_ID
    /\/embed\/([^#&?]+)/, // youtube.com/embed/VIDEO_ID
    /\/v\/([^#&?]+)/, // youtube.com/v/VIDEO_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Extract Mux playback ID - FIXED to handle direct IDs
export const extractMuxId = (url: string): string | null => {
  // Check for Mux player URL
  const muxUrlMatch = url.match(/player\.mux\.com\/([^\\/?#&]+)/);
  if (muxUrlMatch && muxUrlMatch[1]) {
    return muxUrlMatch[1];
  }

  // Check for Mux stream URL
  const muxStreamMatch = url.match(/stream\.mux\.com\/([^\\/?#&.]+)/);
  if (muxStreamMatch && muxStreamMatch[1]) {
    return muxStreamMatch[1];
  }

  // Check if it's a direct Mux playback ID
  // Mux playback IDs are typically long alphanumeric strings
  const muxIdPattern = /^[a-zA-Z0-9]{20,}$/;
  if (muxIdPattern.test(url.trim())) {
    return url.trim();
  }

  return null;
};

// Get YouTube video duration using YouTube Data API
export const getYouTubeDuration = async (
  videoId: string,
): Promise<number | null> => {
  try {
    // You need to get YouTube Data API key from Google Cloud Console
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!API_KEY) {
      console.warn('YouTube API key not found');
      return null;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${API_KEY}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube video data');
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const duration = data.items[0].contentDetails.duration;
      return parseYouTubeDuration(duration);
    }

    return null;
  } catch (error) {
    console.error('Error fetching YouTube duration:', error);
    return null;
  }
};

// Parse YouTube duration format (PT4M13S) to seconds
export const parseYouTubeDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
};

// Get Mux video duration using player metadata (client-side)
export const getMuxDuration = async (
  playbackId: string,
): Promise<number | null> => {
  try {
    // Method 1: Use video element to get duration
    return await getMuxDurationFromPlayer(playbackId);
  } catch (error) {
    console.error('Error fetching Mux duration:', error);

    // Method 2: Fallback to HLS manifest parsing
    try {
      return await getMuxDurationFromHLS(playbackId);
    } catch (hlsError) {
      console.error('Error fetching Mux duration from HLS:', hlsError);
      return null;
    }
  }
};

// Method 1: Create invisible video element to get metadata
export const getMuxDurationFromPlayer = (
  playbackId: string,
): Promise<number | null> => {
  return new Promise((resolve) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    // Create invisible video element
    const video = document.createElement('video');
    video.style.display = 'none';
    video.style.position = 'absolute';
    video.style.top = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    // Set Mux HLS source
    video.src = `https://stream.mux.com/${playbackId}.m3u8`;

    let resolved = false;

    const cleanup = () => {
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };

    const resolveOnce = (value: number | null) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(value);
      }
    };

    video.addEventListener('canplay', () => {
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        resolveOnce(Math.round(video.duration));
      } else {
        setTimeout(() => {
          if (
            video.duration &&
            isFinite(video.duration) &&
            video.duration > 0
          ) {
            resolveOnce(Math.round(video.duration));
          } else {
            resolveOnce(null);
          }
        }, 100); // Trễ ngắn
      }
    });

    video.addEventListener('error', (e) => {
      console.warn('Mux video loading error:', e);
      resolveOnce(null);
    });

    // Timeout after 15 seconds
    const timeoutId = setTimeout(() => {
      resolveOnce(null);
    }, 15000);

    // Add to DOM and load
    document.body.appendChild(video);

    try {
      video.load();
    } catch (loadError) {
      clearTimeout(timeoutId);
      resolveOnce(null);
    }
  });
};

// Method 2: Parse HLS manifest to get duration
export const getMuxDurationFromHLS = async (
  playbackId: string,
): Promise<number | null> => {
  try {
    const manifestUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    const response = await fetch(manifestUrl, {
      mode: 'cors',
      headers: {
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const manifest = await response.text();

    // Look for EXT-X-ENDLIST and calculate total duration
    const lines = manifest.split('\n');
    let totalDuration = 0;
    let hasEndList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if playlist has ended
      if (line === '#EXT-X-ENDLIST') {
        hasEndList = true;
      }

      // Look for segment duration
      if (line.startsWith('#EXTINF:')) {
        const durationMatch = line.match(/#EXTINF:([0-9.]+)/);
        if (durationMatch) {
          totalDuration += parseFloat(durationMatch[1]);
        }
      }
    }

    return hasEndList && totalDuration > 0 ? Math.round(totalDuration) : null;
  } catch (error) {
    console.error('Error parsing HLS manifest:', error);
    return null;
  }
};

// Alternative method: Use HTML5 video element to get duration (works for direct video URLs)
export const getVideoDurationFromElement = (
  videoUrl: string,
): Promise<number | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';

    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });

    video.addEventListener('error', () => {
      resolve(null);
    });

    // Set timeout to avoid hanging
    setTimeout(() => {
      resolve(null);
    }, 10000);

    video.src = videoUrl;
    video.load();
  });
};
