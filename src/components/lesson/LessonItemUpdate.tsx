'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { editorOptions } from '@/constants';
import { ILesson } from '@/database/lesson.model';
import { updateLesson } from '@/lib/actions/lesson.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { Button } from '../ui/button';

const formSchema = z.object({
  slug: z.string().optional(),
  duration: z.number().optional(),
  video_url: z.string().optional(),
  content: z.string().optional(),
});

const LessonItemUpdate = ({ lesson }: { lesson: ILesson }) => {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: lesson.slug,
      duration: lesson.duration,
      video_url: lesson.video_url,
      content: lesson.content,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await updateLesson({
        lessonId: lesson._id,
        updateDate: values,
      });
      if (res?.success) {
        toast.success('Cập nhật bài học thành công');
      }
    } catch (error) {
      console.log(' error:', error);
    } finally {
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.setContent(lesson.content);
      }
    }, 1000);
  }, [lesson.content]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn</FormLabel>
                  <FormControl>
                    <Input placeholder="bai-1-tong-quan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="bai-1-tong-quan"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com//abcdef"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div></div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-start-1 col-end-3">
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Editor
                      apiKey="n0g7i7j45fg3j03ufcwoajpucclemuk16x3dcjc3006t4gup"
                      onInit={(_evt, editor) =>
                        (editorRef.current = editor).setContent(
                          lesson.content || ''
                        )
                      }
                      {...editorOptions(field, theme)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end items-center gap-5 mt-8">
            <Button type="submit">Cập nhật</Button>
            <Link href="/" className="text-sn text-slate-600">
              Xem trước
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LessonItemUpdate;
