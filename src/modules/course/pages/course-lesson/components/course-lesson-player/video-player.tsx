'use client';
import MuxPlayer from '@mux/mux-player-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import YouTube from 'react-youtube';

import { Button } from '@/shared/components/ui';
import { useGlobalStore } from '@/shared/store';
import { LessonModelProps } from '@/shared/types';
import { cn } from '@/shared/utils';

import LessonNavigation from './lesson-navigation';
import RatingButton from './rating-button';

interface VideoPlayerProps {
  nextLesson: string;
  prevLesson: string;
  courseId: string;
  videoUrl: LessonModelProps | undefined;
}
const VideoPlayer = ({
  courseId,
  nextLesson,
  prevLesson,
  videoUrl,
}: VideoPlayerProps) => {
  const duration = 5000;
  const [isEndedVideo, setIsEndedVideo] = useState(false);
  const { setShouldExpandedPlayer, shouldExpandedPlayer } = useGlobalStore();
  const router = useRouter();
  const [playerType, setPlayerType] = useState<
    'mux' | 'youtube' | 'none' | 'loading'
  >('loading');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState<
    string | undefined
  >();

  useEffect(() => {
    const currentLesson = videoUrl;
    const currentActualUrl = videoUrl?.video_url;

    setCurrentLessonTitle(currentLesson?.title);

    if (currentActualUrl) {
      let ytId = null;

      // Enhanced YouTube URL detection
      if (
        currentActualUrl.includes('youtube.com/') ||
        currentActualUrl.includes('youtu.be/')
      ) {
        const patterns = [
          /youtu\.be\/([^#&?]+)/, // youtu.be/VIDEO_ID
          /[?&]v=([^#&?]+)/, // youtube.com/watch?v=VIDEO_ID
          /googleusercontent\.com\/youtube\.com\/([^#&?]+)/, // googleusercontent.com/youtube.com/VIDEO_ID
          /\/embed\/([^#&?]+)/, // youtube.com/embed/VIDEO_ID
          /\/v\/([^#&?]+)/, // youtube.com/v/VIDEO_ID
        ];

        for (const pattern of patterns) {
          const match = currentActualUrl.match(pattern);

          if (match && match[1]) {
            ytId = match[1];
            break;
          }
        }
      }

      if (ytId) {
        setPlayerType('youtube');
        setActiveVideoId(ytId);
      } else {
        let muxId = null;
        const muxUrlMatch = currentActualUrl.match(
          /player\.mux\.com\/([^\\/?#&]+)/,
        );

        if (muxUrlMatch && muxUrlMatch[1]) {
          muxId = muxUrlMatch[1]; // Extracted from player.mux.com/ID URL
        } else if (
          !currentActualUrl.includes('/') &&
          currentActualUrl.length > 20
        ) {
          // Heuristic: if it's not a typical URL and has a length common for IDs,
          // it might be a direct Mux playback ID.
          muxId = currentActualUrl;
        }

        if (muxId) {
          setPlayerType('mux');
          setActiveVideoId(muxId);
        } else {
          setPlayerType('none');
          setActiveVideoId(null);
          console.warn(
            'Video URL could not be identified as YouTube or Mux:',
            currentActualUrl,
          );
        }
      }
    } else {
      setPlayerType('none');
      setActiveVideoId(null);
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!isEndedVideo || playerType === 'none') return; // Don't navigate if no video or error

    const timer = setTimeout(() => {
      if (nextLesson) {
        // Only navigate if there's a next lesson
        router.push(nextLesson);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isEndedVideo, nextLesson, router, playerType]);

  const handleVideoEnd = () => {
    setIsEndedVideo(true);
  };

  const handleVideoPlay = () => {
    setIsEndedVideo(false);
  };

  return (
    <>
      <div className="relative mb-5 aspect-video">
        <div
          className={cn(
            'absolute right-0 top-0 z-10 h-1.5 bg-gradient-to-r from-primary to-secondary',
            isEndedVideo ? 'animate-bar' : '',
          )}
        />
        {playerType === 'mux' && !!activeVideoId && (
          <MuxPlayer
            className="size-full"
            metadataVideoTitle={currentLessonTitle || 'Video'}
            metadataViewerUserId="Placeholder (optional)" // You can make this dynamic if needed
            playbackId={activeVideoId}
            primaryColor="#FFFFFF"
            secondaryColor="#000000"
            streamType="on-demand"
            onEnded={handleVideoEnd}
            onPlay={handleVideoPlay}
          />
        )}

        {playerType === 'youtube' && !!activeVideoId && (
          <YouTube
            className="size-full" // Ensure YouTube player fills the container
            videoId={activeVideoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0, // Or 1 if you want autoplay
                controls: 1,
              },
            }}
            onEnd={handleVideoEnd}
            onPlay={handleVideoPlay}
          />
        )}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <LessonNavigation
          nextLesson={nextLesson}
          prevLesson={prevLesson}
        />
        <div className="flex gap-5">
          <RatingButton courseId={courseId} />
          <Button
            onClick={() => setShouldExpandedPlayer(!shouldExpandedPlayer)}
          >
            {shouldExpandedPlayer ? 'Mặc định' : 'Mở rộng'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
