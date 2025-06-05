'use client';
import { useCallback, useState } from 'react';
import { extractMuxId, extractYouTubeId, getYouTubeDuration } from '../utils';
import { useMuxDuration } from './use-mux-duration';

export const useVideoDuration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    getMuxDuration,
    isLoading: isMuxLoading,
    error: muxError,
  } = useMuxDuration();

  const fetchDuration = useCallback(
    async (videoUrl: string): Promise<number | null> => {
      if (!videoUrl.trim()) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if it's YouTube URL
        const youtubeId = extractYouTubeId(videoUrl);
        if (youtubeId) {
          const duration = await getYouTubeDuration(youtubeId);
          return duration;
        }

        // Check if it's Mux URL
        const muxId = extractMuxId(videoUrl);
        if (muxId) {
          const duration = await getMuxDuration(muxId);
          if (muxError) {
            setError(muxError);
          }
          return duration;
        }

        setError('URL không được hỗ trợ. Chỉ hỗ trợ YouTube và Mux video.');
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(`Lỗi khi lấy thời lượng video: ${errorMessage}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getMuxDuration, muxError],
  );

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    fetchDuration,
    formatDuration,
    isLoading: isLoading || isMuxLoading,
    error: error || muxError,
  };
};
