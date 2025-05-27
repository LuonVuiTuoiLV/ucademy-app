// modules/user/pages/information/components/index.tsx (InfoPageContainer.tsx)
'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as z from 'zod';

import { updateUserProfile } from '@/modules/user/actions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ShineBorder } from '@/shared/components/ui/shine-border';
import { useUserContext } from '@/shared/contexts/user-context';
import { UserModelProps } from '@/shared/types';
import { UploadButton } from '@/shared/utils'; // Đảm bảo đường dẫn này đúng

// Định nghĩa schema cho form validation với Zod
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Tên phải có ít nhất 2 ký tự.' })
    .max(50, { message: 'Tên không được quá 50 ký tự.' }),
  username: z
    .string()
    .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự.' })
    .max(30, { message: 'Tên người dùng không được quá 30 ký tự.' })
    .optional()
    .or(z.literal('')),
  avatar: z // Avatar giờ đây có thể là URL bất kỳ, bao gồm cả URL từ UploadThing hoặc Clerk
    .string()
    .url({ message: 'Vui lòng nhập URL ảnh đại diện hợp lệ.' })
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const InfoPageContainer = () => {
  const { userId: clerkIdFromAuth } = useAuth();
  const { isLoadingUser, setUserInfo, userInfo } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      username: '',
      avatar: '', // Sẽ được cập nhật từ userInfo hoặc sau khi upload
    },
  });

  // Theo dõi giá trị của trường 'avatar' trong form để hiển thị preview
  const imageWatch = form.watch('avatar');

  // Điền form với dữ liệu người dùng hiện tại khi có
  useEffect(() => {
    if (userInfo) {
      form.reset({
        name: userInfo.name || '',
        username: userInfo.username || '',
        avatar: userInfo.avatar || '', // Ưu tiên avatar từ DB (có thể là Clerk URL hoặc UploadThing URL đã lưu)
      });
    }
  }, [userInfo, form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!clerkIdFromAuth) {
      toast.error('Không tìm thấy thông tin người dùng để cập nhật.');

      return;
    }
    setIsSubmitting(true);
    try {
      const avatarToUpdate = data.avatar || null; // Gửi null nếu avatar rỗng

      const result = await updateUserProfile({
        clerkId: clerkIdFromAuth,
        updateData: {
          name: data.name,
          username:
            data.username && data.username !== userInfo?.username
              ? data.username
              : undefined,
          avatar: avatarToUpdate || '', // Gửi URL avatar hiện tại trong form
        },
      });

      if (result?.success) {
        toast.success(result.message || 'Cập nhật thông tin thành công!');
        if (result.updatedUser && setUserInfo) {
          setUserInfo((currentContextUser) => {
            if (currentContextUser) {
              return {
                ...currentContextUser,
                ...result.updatedUser,
              } as UserModelProps;
            } else if (
              result.updatedUser &&
              Object.keys(result.updatedUser).length > 0
            ) {
              return result.updatedUser as UserModelProps;
            }

            return currentContextUser;
          });
        }
      } else {
        toast.error(result?.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="py-10 text-center">Đang tải thông tin người dùng...</div>
    );
  }

  if (!userInfo && !isLoadingUser) {
    return (
      <div className="py-10 text-center">
        Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }

  return (
    <form
      className="borderDarkMode bgDarkMode relative mx-auto mt-8 max-w-2xl space-y-8 overflow-hidden rounded-lg p-8 pt-0 shadow-xl" // Tăng padding và max-width
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />

      {/* Phần hiển thị và upload ảnh đại diện */}
      <div className="flex flex-col items-center justify-start gap-4">
        <Label
          className="text-lg font-semibold"
          htmlFor="avatar-upload"
        >
          Ảnh đại diện
        </Label>
        <Image
          alt="Ảnh đại diện"
          className="size-32 rounded-full border-2 border-gray-300 object-cover dark:border-gray-600"
          height={128}
          src={imageWatch || userInfo?.avatar || '/placeholder-avatar.png'}
          width={128}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-avatar.png';
          }}
        />
        <UploadButton
          endpoint="imageUploader" // Endpoint của UploadThing
          appearance={{
            button:
              'ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 text-sm',
            allowedContent:
              'ut-allowed-content:text-muted-foreground ut-allowed-content:text-xs mt-1',
          }}
          content={{
            button({ isUploading, ready }) {
              if (isUploading) return 'Đang tải lên...';
              if (ready) return 'Thay đổi ảnh';

              return 'Đang chuẩn bị...';
            },
            allowedContent({ isUploading, ready }) {
              if (!ready || isUploading) return null;

              return `JPG, PNG, GIF (tối đa ${4}MB)`;
            },
          }}
          onClientUploadComplete={(response) => {
            if (response && response[0] && response[0].url) {
              form.setValue('avatar', response[0].url, { shouldDirty: true }); // Cập nhật giá trị form và đánh dấu là dirty
              toast.info(
                'Ảnh đã được tải lên. Nhấn "Cập nhật thông tin" để lưu thay đổi.',
              );
            }
          }}
          onUploadError={(error: Error) => {
            console.error(`Lỗi UploadThing: ${error.message}`);
            toast.error('Tải ảnh lên thất bại: ' + error.message);
          }}
        />
      </div>

      {/* Các trường thông tin khác */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Họ và Tên</Label>
          <Input
            id="name"
            {...form.register('name')}
            className="mt-1"
          />
          {!!form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="username">Tên người dùng (Username)</Label>
          <Input
            id="username"
            {...form.register('username')}
            className="mt-1"
            placeholder={userInfo?.username || 'Nhập username mới'}
          />
          {!!form.formState.errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div>
          <Label>Email</Label>
          <Input
            disabled
            readOnly
            className="mt-1 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            value={userInfo?.email || ''}
          />
        </div>
      </div>

      <Button
        className="w-full py-3 text-base" // Tăng kích thước nút
        disabled={isSubmitting || !form.formState.isDirty} // Chỉ enable khi form có thay đổi
        type="submit"
        variant="primary"
      >
        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
      </Button>
    </form>
  );
};

export default InfoPageContainer;
