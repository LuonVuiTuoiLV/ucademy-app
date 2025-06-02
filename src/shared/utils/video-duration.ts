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

    // Check if it's Mux URL
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

// Extract Mux playback ID
export const extractMuxId = (url: string): string | null => {
  const muxUrlMatch = url.match(/player\.mux\.com\/([^\\/?#&]+)/);

  if (muxUrlMatch && muxUrlMatch[1]) {
    return muxUrlMatch[1];
  } else if (!url.includes('/') && url.length > 20) {
    // Heuristic: if it's not a typical URL and has a length common for IDs
    return url;
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
    // Method 1: Use Mux player to get duration
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

// Method 1: Create invisible Mux player to get metadata
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
    video.muted = true;
    video.playsInline = true;

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

    video.addEventListener('loadedmetadata', () => {
      if (video.duration && isFinite(video.duration)) {
        resolveOnce(video.duration);
      } else {
        resolveOnce(null);
      }
    });

    video.addEventListener('error', () => {
      resolveOnce(null);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolveOnce(null);
    }, 10000);

    // Add to DOM and load
    document.body.appendChild(video);
    video.load();
  });
};

// Method 2: Parse HLS manifest to get duration
export const getMuxDurationFromHLS = async (
  playbackId: string,
): Promise<number | null> => {
  try {
    const manifestUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch HLS manifest');
    }

    const manifest = await response.text();

    // Look for EXT-X-ENDLIST and calculate total duration
    const lines = manifest.split('\n');
    let totalDuration = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for segment duration
      if (line.startsWith('#EXTINF:')) {
        const durationMatch = line.match(/#EXTINF:([0-9.]+)/);
        if (durationMatch) {
          totalDuration += parseFloat(durationMatch[1]);
        }
      }
    }

    return totalDuration > 0 ? totalDuration : null;
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
