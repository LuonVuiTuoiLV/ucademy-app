'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { updateLesson } from '@/modules/lesson/actions';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components/ui';
import { editorOptions } from '@/shared/constants';
import { hmsToSeconds, secondsToHMS } from '@/shared/helpers';
import { useVideoDuration } from '@/shared/hooks/use-video-duration';
import { LessonItemData } from '@/shared/types';

const formSchema = z.object({
  slug: z.string().optional(),
  duration: z.number().optional(),
  video_url: z.string().optional(),
  content: z.string().optional(),
});

interface OutlineItemProps {
  lesson: LessonItemData;
}

const OutlineItem = ({ lesson }: OutlineItemProps) => {
  const editorRef = useRef<unknown>(null);
  const [isGettingDuration, setIsGettingDuration] = useState(false);
  const {
    fetchDuration,
    formatDuration,
    isLoading: isDurationLoading,
    error: durationError,
  } = useVideoDuration();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: lesson.slug,
      duration: lesson.duration,
      video_url: lesson.video_url,
      content: lesson.content,
    },
  });

  const videoUrl = form.watch('video_url');
  const formDuration = form.watch('duration');

  // State cục bộ cho các input giờ, phút, giây
  const [hms, setHms] = useState<{ h: string; m: string; s: string }>(() => {
    const initialHms = secondsToHMS(lesson.duration);
    return {
      h: initialHms.h.toString(),
      m: initialHms.m.toString(),
      s: initialHms.s.toString(),
    };
  });

  // Đồng bộ từ formDuration (tổng giây) sang state hms (giờ, phút, giây)
  useEffect(() => {
    const newHms = secondsToHMS(formDuration);
    setHms({
      h: newHms.h.toString(),
      m: newHms.m.toString(),
      s: newHms.s.toString(),
    });
  }, [formDuration]);

  // Xử lý khi một trong các ô giờ, phút, giây thay đổi
  const handleHmsChange = (part: 'h' | 'm' | 's', value: string) => {
    const numericValue =
      value === '' ? '' : Math.max(0, parseInt(value, 10)).toString(); // Cho phép xóa, không âm

    const newHms = { ...hms, [part]: numericValue };
    setHms(newHms);

    // Cập nhật lại trường duration của form (tổng số giây)
    const totalSeconds = hmsToSeconds(
      part === 'h' ? Number(numericValue) : Number(newHms.h),
      part === 'm' ? Number(numericValue) : Number(newHms.m),
      part === 's' ? Number(numericValue) : Number(newHms.s),
    );
    form.setValue('duration', totalSeconds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    const getDurationFromVideo = async () => {
      if (!videoUrl || videoUrl.trim() === '') {
        return;
      }

      setIsGettingDuration(true);
      try {
        const duration = await fetchDuration(videoUrl);
        if (duration && duration > 0) {
          form.setValue('duration', duration);
          toast.success(`Đã lấy thời lượng video: ${formatDuration(duration)}`);
        } else if (durationError) {
          toast.error(durationError);
        }
      } catch (error) {
        toast.error('Không thể lấy thời lượng video');
      } finally {
        setIsGettingDuration(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều lần
    if (
      videoUrl !== lesson.video_url ||
      (videoUrl && form.getValues('duration') === 0 && lesson.duration === 0)
    ) {
      const timeoutId = setTimeout(() => {
        getDurationFromVideo();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    videoUrl,
    fetchDuration,
    form,
    durationError,
    lesson.video_url,
    lesson.duration,
  ]);

  // Manual get duration button handler
  const handleGetDuration = async () => {
    const currentVideoUrl = form.getValues('video_url');
    if (!currentVideoUrl || currentVideoUrl.trim() === '') {
      toast.error('Vui lòng nhập URL video trước');
      return;
    }

    setIsGettingDuration(true);
    try {
      const duration = await fetchDuration(currentVideoUrl);
      if (duration && duration > 0) {
        form.setValue('duration', duration);
        toast.success(`Đã lấy thời lượng video: ${formatDuration(duration)}`);
      } else {
        toast.error('Không thể lấy thời lượng video. Vui lòng kiểm tra URL.');
      }
    } catch (error) {
      toast.error('Lỗi khi lấy thời lượng video');
    } finally {
      setIsGettingDuration(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await updateLesson({
        lessonId: lesson._id,
        updateData: {
          ...values,
          duration: Number(values.duration) || 0, // Đảm bảo duration là số
        },
      });

      if (response?.success) {
        toast.success('Cập nhật bài học thành công');
      }
    } catch (error) {
      console.log(error);
      toast.error('Lỗi khi cập nhật bài học');
    }
  }

  const { theme } = useTheme();

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="bai-1-tong-quan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>
                Thời lượng
                {formDuration !== undefined && formDuration > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({formatDuration(formDuration || 0)})
                  </span>
                )}
              </FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <Input
                    type="number"
                    placeholder="Giờ"
                    min="0"
                    value={hms.h}
                    onChange={(e) => handleHmsChange('h', e.target.value)}
                    disabled={isGettingDuration || isDurationLoading}
                  />
                </FormControl>
                <span className="font-semibold">:</span>
                <FormControl className="flex-1">
                  <Input
                    type="number"
                    placeholder="Phút"
                    min="0"
                    max="59"
                    value={hms.m}
                    onChange={(e) => handleHmsChange('m', e.target.value)}
                    disabled={isGettingDuration || isDurationLoading}
                  />
                </FormControl>
                <span className="font-semibold">:</span>
                <FormControl className="flex-1">
                  <Input
                    type="number"
                    placeholder="Giây"
                    min="0"
                    max="59"
                    value={hms.s}
                    onChange={(e) => handleHmsChange('s', e.target.value)}
                    disabled={isGettingDuration || isDurationLoading}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetDuration}
                  disabled={isGettingDuration || isDurationLoading || !videoUrl}
                  className="whitespace-nowrap"
                >
                  {isGettingDuration || isDurationLoading
                    ? 'Đang lấy...'
                    : 'Lấy TL'}
                </Button>
              </div>

              <Controller
                name="duration"
                control={form.control}
                render={() => <FormMessage />}
              />
              {durationError && !isGettingDuration && (
                <p className="mt-1 text-sm text-red-500">{durationError}</p>
              )}
            </FormItem>
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Video URL
                    {isGettingDuration && (
                      <span className="ml-2 text-sm text-blue-500">
                        (Đang lấy thời lượng...)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/abcdefXZ hoặc Mux ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-start-1 col-end-3">
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                      value={field.value}
                      onInit={(_event, editor) => {
                        (editorRef.current = editor).setContent(
                          lesson.content || '',
                        );
                      }}
                      {...editorOptions(field, theme)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-8 flex items-center justify-end gap-5">
            <Button
              type="submit"
              disabled={isGettingDuration || isDurationLoading}
            >
              Cập nhật
            </Button>
            <Link
              className="text-sm text-slate-600"
              href="/"
            >
              Xem trước
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OutlineItem;
