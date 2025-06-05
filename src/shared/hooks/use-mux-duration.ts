// hooks/useMuxDuration.ts
import { useCallback, useRef, useState } from 'react';

export const useMuxDuration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getMuxDuration = useCallback(
    async (playbackId: string): Promise<number | null> => {
      if (!playbackId.trim()) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Method 1: Try using video element first (more reliable)
        const duration = await getMuxDurationFromVideo(playbackId);

        if (duration !== null) {
          return duration;
        }

        // Method 2: Fallback to HLS manifest parsing
        const hlsDuration = await getMuxDurationFromHLS(playbackId);
        return hlsDuration;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(`Lỗi khi lấy thời lượng Mux video: ${errorMessage}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getMuxDurationFromVideo = (
    playbackId: string,
  ): Promise<number | null> => {
    return new Promise((resolve) => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }

      // Clean up existing video element
      if (videoRef.current) {
        videoRef.current.remove();
      }

      // Create new video element
      const video = document.createElement('video');
      videoRef.current = video;

      video.style.display = 'none';
      video.style.position = 'absolute';
      video.style.top = '-9999px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous'; // Add this for CORS

      let resolved = false;

      const cleanup = () => {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
        videoRef.current = null;
      };

      const resolveOnce = (value: number | null) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(value);
        }
      };

      // Event listeners
      video.addEventListener('loadedmetadata', () => {
        if (video.duration && isFinite(video.duration) && video.duration > 0) {
          resolveOnce(Math.round(video.duration));
        } else {
          resolveOnce(null);
        }
      });

      video.addEventListener('error', (e) => {
        console.warn('Video loading error:', e);
        resolveOnce(null);
      });

      video.addEventListener('abort', () => {
        resolveOnce(null);
      });

      // Timeout after 15 seconds
      const timeoutId = setTimeout(() => {
        resolveOnce(null);
      }, 15000);

      // Set source and load - FIX: Remove the invalid https: prefix
      video.src = `https://stream.mux.com/${playbackId}.m3u8`;

      // Add to DOM
      document.body.appendChild(video);

      // Try to load
      try {
        video.load();
      } catch (loadError) {
        clearTimeout(timeoutId);
        resolveOnce(null);
      }
    });
  };

  const getMuxDurationFromHLS = async (
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

      // Parse HLS manifest
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

        // Alternative: look for total duration in header
        if (line.startsWith('#EXT-X-PLAYLIST-TYPE:')) {
          // This is a VOD playlist, continue parsing
        }
      }

      // Only return duration if we have a complete playlist
      return hasEndList && totalDuration > 0 ? Math.round(totalDuration) : null;
    } catch (error) {
      console.error('Error parsing HLS manifest:', error);
      return null;
    }
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.remove();
      videoRef.current = null;
    }
  }, []);

  return {
    getMuxDuration,
    isLoading,
    error,
    cleanup,
  };
};
