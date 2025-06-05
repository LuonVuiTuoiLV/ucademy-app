// modules/user/pages/information/components/index.tsx (InfoPageContainer.tsx)
'use client';

import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
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
  avatar: z
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
