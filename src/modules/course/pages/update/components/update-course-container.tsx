'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useImmer } from 'use-immer';
import { z } from 'zod';

import { updateCourse } from '@/modules/course/actions';
import { IconAdd } from '@/shared/components/icons';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputFormatCurrency,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/shared/components/ui';
import {
  CourseLevel,
  courseLevel,
  CourseStatus,
  courseStatus,
} from '@/shared/constants';
import { CourseItemData } from '@/shared/types';
import { UploadButton } from '@/shared/utils/uploadthing';

const formSchema = z
  .object({
    title: z.string().min(10, 'Tên khóa học phải có ít nhất 10 ký tự'),
    slug: z.string().optional(),
    price: z.string().optional(),
    sale_price: z.string().optional(),
    intro_url: z.string().optional(),
    desc: z.string().optional(),
    is_free: z.boolean().optional(),
    image: z.string().optional(),
    views: z.number().int().optional(),
    status: z
      .enum([
        CourseStatus.APPROVED,
        CourseStatus.PENDING,
        CourseStatus.COMING_SOON,
        CourseStatus.REJECTED,
      ])
      .optional(),
    level: z
      .enum([
        CourseLevel.BEGINNER,
        CourseLevel.INTERMEDIATE,
        CourseLevel.ADVANCED,
      ])
      .optional(),
    info: z.object({
      requirements: z.array(z.string()).optional(),
      benefits: z.array(z.string()).optional(),
      qa: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .optional(),
    }),
  })
  .refine(
    (data) => {
      if (
        data.is_free === false &&
        (!data.price || data.price === '0' || data.price === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Khóa học không miễn phí phải có giá',
      path: ['price'],
    },
  );

interface UpdateCourseContainerProps {
  course: CourseItemData;
}

const UpdateCourseContainer = ({ course }: UpdateCourseContainerProps) => {
  console.log(' course:', course);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseInfo, setCourseInfo] = useImmer({
    requirements: course.info.requirements,
    benefits: course.info.benefits,
    qa: course.info.qa,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      price: course.price.toString(),
      sale_price: course.sale_price.toString(),
      is_free: course.is_free,
      intro_url: course.intro_url,
      desc: course.desc,
      image: course.image,
      status: course.status,
      level: course.level,
      views: course.views,
      info: {
        requirements: course.info.requirements,
        benefits: course.info.benefits,
        qa: course.info.qa,
      },
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('onSubmit: Bắt đầu xử lý, giá trị form:', values);
    setIsSubmitting(true);
    console.log('onSubmit: isSubmitting được đặt thành true');

    let priceValue = 0;
    let salePriceValue = 0;

    if (!values.is_free) {
      priceValue = Number(values.price?.replace(/,/g, '') || 0);
      salePriceValue = Number(values.sale_price?.replace(/,/g, '') || 0);
    }

    try {
      const response = await updateCourse({
        slug: course.slug,
        updateData: {
          title: values.title,
          slug: values.slug,
          is_free: Boolean(values.is_free),
          price: priceValue,
          sale_price: salePriceValue,
          intro_url: values.intro_url,
          desc: values.desc,
          views: values.views,
          info: {
            requirements: courseInfo.requirements,
            benefits: courseInfo.benefits,
            qa: courseInfo.qa,
          },
          status: values.status,
          level: values.level,
          image: values.image,
        },
        path: `/manage/course/update?slug=${values.slug || course.slug}`,
      });
      console.log('onSubmit: Kết quả từ updateCourse:', response);

      if (response?.success) {
        toast.success(response.message || 'Cập nhật khóa học thành công');
        console.log(
          'onSubmit: Cập nhật thành công, chuyển hướng về /manage/course',
        );
        if (values.slug && values.slug !== course.slug) {
          router.push(`/manage/course/update?slug=${values.slug}`);
        } else {
          router.push('/manage/course');
        }
      } else {
        toast.error(response?.error || 'Cập nhật khóa học không thành công.');
        console.error(
          'onSubmit: Cập nhật thất bại hoặc response không có success:true',
          response?.error,
        );
      }
    } catch (error) {
      console.error('onSubmit: Lỗi trong khối try-catch:', error);
      toast.error('Đã có lỗi xảy ra trong quá trình cập nhật.');
    } finally {
      console.log('onSubmit: Khối finally, đặt isSubmitting thành false');
      setIsSubmitting(false);
    }
  }

  const imageWatch = form.watch('image');
  const isFreeChecked = form.watch('is_free');
  useEffect(() => {
    if (isFreeChecked) {
      form.setValue('price', '0');
      form.setValue('sale_price', '0');
    }
  }, [isFreeChecked, form]);
  return (
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="mb-8 mt-10 grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khóa học *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tên khóa học"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn khóa học</FormLabel>
                <FormControl>
                  <Input
                    placeholder="khoa-hoc-lap-trinh"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_free"
            render={({ field }) => (
              <FormItem className="col-start-1 col-end-3">
                <FormLabel>Khóa học Free</FormLabel>
                <FormControl className="h-12">
                  <div className="flex flex-col justify-center">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá khuyến mãi</FormLabel>
                <FormControl>
                  <InputFormatCurrency
                    placeholder="599.000"
                    {...field}
                    onChange={(event) => field.onChange(event.target.value)}
                    disabled={isFreeChecked}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá gốc</FormLabel>
                <FormControl>
                  <InputFormatCurrency
                    placeholder="999.000"
                    {...field}
                    onChange={(event) => field.onChange(event.target.value)}
                    disabled={isFreeChecked}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="desc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả khóa học</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập mô tả..."
                    {...field}
                    className="h-[250px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Ảnh đại diện</FormLabel>
                <FormControl>
                  <>
                    <div className="bgDarkMode borderDarkMode relative flex h-[250px] items-center justify-center rounded-md border border-gray-200 bg-white">
                      {imageWatch ? (
                        <Image
                          fill
                          alt=""
                          className="size-full rounded-md object-cover"
                          src={imageWatch}
                        />
                      ) : (
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(response) => {
                            form.setValue('image', response[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            console.error(`ERROR! ${error.message}`);
                          }}
                        />
                      )}
                    </div>
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="intro_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Youtube URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://youtube.com/axfgdr5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="views"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lượt xem</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1000"
                    type="number"
                    {...field}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseStatus.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                        >
                          {status.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trình độ</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevel.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                        >
                          {level.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="info.requirements"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center justify-between gap-5">
                  <span>Yêu cầu</span>
                  <button
                    className="text-primary"
                    type="button"
                    onClick={() => {
                      setCourseInfo((draft) => {
                        draft.requirements.push('');
                      });
                    }}
                  >
                    <IconAdd className="size-5" />
                  </button>
                </FormLabel>
                <FormControl>
                  <>
                    {courseInfo.requirements.map((r, index) => (
                      <Input
                        key={index}
                        placeholder={`Yêu cầu số ${index + 1}`}
                        value={r}
                        onChange={(event) => {
                          setCourseInfo((draft) => {
                            draft.requirements[index] = event.target.value;
                          });
                        }}
                      />
                    ))}
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="info.benefits"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center justify-between gap-5">
                  <span>Lợi ích</span>
                  <button
                    className="text-primary"
                    type="button"
                    onClick={() => {
                      setCourseInfo((draft) => {
                        draft.benefits.push('');
                      });
                    }}
                  >
                    <IconAdd className="size-5" />
                  </button>
                </FormLabel>
                <FormControl>
                  <>
                    {courseInfo.benefits.map((r, index) => (
                      <Input
                        key={index}
                        placeholder={`Lợi ích số ${index + 1}`}
                        value={r}
                        onChange={(event) => {
                          setCourseInfo((draft) => {
                            draft.benefits[index] = event.target.value;
                          });
                        }}
                      />
                    ))}
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="info.qa"
            render={() => (
              <FormItem className="col-start-1 col-end-3">
                <FormLabel className="flex items-center justify-between gap-5">
                  <span>Q.A</span>
                  <button
                    className="text-primary"
                    type="button"
                    onClick={() => {
                      setCourseInfo((draft) => {
                        draft.qa.push({
                          question: '',
                          answer: '',
                        });
                      });
                    }}
                  >
                    <IconAdd className="size-5" />
                  </button>
                </FormLabel>
                <FormControl>
                  <>
                    {courseInfo.qa.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-5"
                      >
                        <Input
                          key={index}
                          placeholder={`Câu hỏi số ${index + 1}`}
                          value={item.question}
                          onChange={(event) => {
                            setCourseInfo((draft) => {
                              draft.qa[index].question = event.target.value;
                            });
                          }}
                        />
                        <Input
                          key={index}
                          placeholder={`Câu trả lời số ${index + 1}`}
                          value={item.answer}
                          onChange={(event) => {
                            setCourseInfo((draft) => {
                              draft.qa[index].answer = event.target.value;
                            });
                          }}
                        />
                      </div>
                    ))}
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="w-[150px]"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
          variant="primary"
        >
          Cập nhật khóa học
        </Button>
      </form>
    </Form>
  );
};

export default UpdateCourseContainer;
