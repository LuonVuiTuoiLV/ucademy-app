// app/manage/user/update/[userId]/components/update-user-detail-container.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Để điều hướng sau khi cập nhật
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import * as z from 'zod';

// Import các server actions
import {
  updateUserProfileByAdmin,
  updateUserStatusByAdmin,
} from '@/modules/user/actions';
import { BadgeStatus } from '@/shared/components/common';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'; // Import Select của Shadcn
import { ShineBorder } from '@/shared/components/ui/shine-border';
import {
  UserRole,
  userRole as userRoleOptions,
  UserStatus,
  userStatus as userStatusOptions,
} from '@/shared/constants'; // Constants cho role và status
import { UserItemData } from '@/shared/types'; // UserItemData cần có clerkId, role, status, banned
import { UploadButton } from '@/shared/utils';

// Schema cho form, bao gồm cả role và status
const updateUserFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Tên phải có ít nhất 2 ký tự.' })
    .max(50, { message: 'Tên không được quá 50 ký tự.' }),
  username: z
    .string()
    .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự.' })
    .max(30, { message: 'Tên không được quá 30 ký tự.' })
    .optional()
    .or(z.literal('')),
  avatar: z
    .string()
    .url({ message: 'Vui lòng nhập URL ảnh đại diện hợp lệ.' })
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(UserRole), // Sử dụng enum UserRole
  status: z.nativeEnum(UserStatus), // Sử dụng enum UserStatus
  // Email thường không cho admin sửa trực tiếp vì liên quan đến xác thực Clerk
});

type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

interface UpdateUserDetailContainerProps {
  initialUserData: UserItemData & { banned?: boolean }; // Nhận dữ liệu user ban đầu
}

const UpdateUserDetailContainer = ({
  initialUserData,
}: UpdateUserDetailContainerProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State để lưu trữ trạng thái banned từ Clerk (nếu cần cập nhật riêng)
  const [isClerkBanned, setIsClerkBanned] = useState(
    initialUserData.banned || false,
  );

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: initialUserData.name || '',
      username: initialUserData.username || '',
      avatar: initialUserData.avatar || '',
      role: initialUserData.role || UserRole.USER, // Mặc định là USER nếu không có
      status: initialUserData.status || UserStatus.ACTIVE, // Mặc định là ACTIVE
    },
  });

  const imageWatch = form.watch('avatar');

  // useEffect để cập nhật form nếu initialUserData thay đổi (hiếm khi xảy ra với server component parent)
  useEffect(() => {
    form.reset({
      name: initialUserData.name || '',
      username: initialUserData.username || '',
      avatar: initialUserData.avatar || '',
      role: initialUserData.role || UserRole.USER,
      status: initialUserData.status || UserStatus.ACTIVE,
    });
    setIsClerkBanned(initialUserData.banned || false);
  }, [initialUserData, form]);

  const onSubmit: SubmitHandler<UpdateUserFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Cập nhật thông tin cơ bản (name, username, avatar)
      const profileUpdateResult = await updateUserProfileByAdmin({
        // Tạo hàm này tương tự updateUserProfile nhưng có check quyền admin
        clerkId: initialUserData.clerkId,
        updateData: {
          name: data.name,
          username:
            data.username && data.username !== initialUserData.username
              ? data.username
              : undefined,
          avatar:
            data.avatar === ''
              ? null
              : data.avatar === initialUserData.avatar
                ? undefined
                : data.avatar,
        },
        // currentDbAvatar: initialUserData.avatar, // Không cần nếu updateUserProfileByAdmin tự lấy từ DB/Clerk
      });

      // 2. Cập nhật role và status (qua hàm riêng hoặc gộp)
      // Giả sử updateUserStatusByAdmin đã xử lý cả role và status (như đã làm ở lần trước)
      let statusUpdateSuccess = true;

      if (
        data.status !== initialUserData.status ||
        data.role !== initialUserData.role
      ) {
        const statusRoleUpdateResult = await updateUserStatusByAdmin({
          targetUserId: initialUserData._id, // _id của Mongoose
          newStatus: data.status,
          newRole: data.role,
        });

        if (!statusRoleUpdateResult.success) {
          statusUpdateSuccess = false;
          toast.error(
            statusRoleUpdateResult.message ||
              'Cập nhật vai trò/trạng thái thất bại.',
          );
        }
      }

      if (profileUpdateResult?.success && statusUpdateSuccess) {
        toast.success('Cập nhật thông tin người dùng thành công!');
        // Cập nhật lại isClerkBanned nếu status là BANNED
        if (data.status === UserStatus.BANNED) setIsClerkBanned(true);
        if (data.status === UserStatus.ACTIVE && isClerkBanned)
          setIsClerkBanned(false); // Nếu admin chọn ACTIVE và user đang banned clerk -> unban
        // Có thể điều hướng hoặc revalidate
        router.refresh(); // Đơn giản nhất là refresh lại trang để lấy dữ liệu mới
      } else if (!profileUpdateResult?.success) {
        toast.error(
          profileUpdateResult?.message || 'Cập nhật thông tin cơ bản thất bại.',
        );
      }
      // Các trường hợp lỗi khác đã được toast trong statusUpdateResult
    } catch (error) {
      console.error('Error updating user by admin:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý Ban/Unban trực tiếp trên Clerk và cập nhật status trong DB
  const handleToggleBanStatus = async () => {
    const targetStatus = isClerkBanned ? UserStatus.ACTIVE : UserStatus.BANNED; // Trạng thái hệ thống mong muốn
    const swalTitle = isClerkBanned
      ? `Bạn có chắc muốn BỎ CẤM người dùng "${initialUserData.name}" trên Clerk?`
      : `Bạn có chắc muốn CẤM người dùng "${initialUserData.name}" trên Clerk? Hành động này sẽ ngăn họ đăng nhập.`;

    Swal.fire({
      title: swalTitle,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isClerkBanned ? 'Đồng ý Bỏ cấm' : 'Đồng ý Cấm',
      cancelButtonText: 'Hủy',
      confirmButtonColor: isClerkBanned ? '#3085d6' : '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSubmitting(true);
        const updateResult = await updateUserStatusByAdmin({
          targetUserId: initialUserData._id,
          newStatus: targetStatus, // Server action sẽ xử lý ban/unban Clerk dựa trên status này
        });

        setIsSubmitting(false);
        if (updateResult?.success) {
          toast.success(
            `Đã ${isClerkBanned ? 'bỏ cấm' : 'cấm'} người dùng thành công.`,
          );
          setIsClerkBanned(!isClerkBanned); // Cập nhật trạng thái local
          form.setValue('status', targetStatus); // Đồng bộ status của form
          router.refresh();
        } else {
          toast.error(updateResult?.message || 'Thao tác thất bại.');
        }
      }
    });
  };

  return (
    <form
      className="borderDarkMode bgDarkMode relative mx-auto mt-8 max-w-3xl space-y-8 overflow-hidden rounded-lg p-8 pt-0 shadow-xl"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />

      {/* Phần Avatar */}
      <div className="flex flex-col items-center justify-start gap-4 pt-8">
        {/* ... (Code UploadButton và Image như cũ) ... */}
        <Image
          alt="Ảnh đại diện"
          className="size-32 rounded-full border-2 border-gray-300 object-cover dark:border-gray-600"
          height={128}
          width={128}
          src={
            imageWatch || initialUserData?.avatar || '/placeholder-avatar.png'
          }
          onError={(e) => {
            e.currentTarget.src = '/placeholder-avatar.png';
          }}
        />
        <UploadButton
          endpoint="imageUploader"
          appearance={
            {
              /* ... */
            }
          }
          content={
            {
              /* ... */
            }
          }
          onClientUploadComplete={(response) => {
            if (response && response[0] && response[0].url) {
              form.setValue('avatar', response[0].url, { shouldDirty: true });
              toast.info('Ảnh đã được chọn. Nhấn "Lưu thay đổi" để cập nhật.');
            }
          }}
          onUploadError={(error: Error) => {
            /* ... */
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Họ và Tên */}
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

        {/* Tên người dùng */}
        <div>
          <Label htmlFor="username">Tên người dùng (Username)</Label>
          <Input
            id="username"
            {...form.register('username')}
            className="mt-1"
            placeholder={initialUserData?.username || 'Nhập username mới'}
          />
          {!!form.formState.errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Email (chỉ đọc) */}
        <div>
          <Label>Email</Label>
          <Input
            disabled
            readOnly
            className="mt-1 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            value={initialUserData?.email || ''}
          />
        </div>

        {/* URL Ảnh đại diện (có thể ẩn nếu chỉ dùng UploadButton) */}
        <div>
          <Label htmlFor="avatar">URL Ảnh đại diện</Label>
          <Input
            id="avatar"
            {...form.register('avatar')}
            className="mt-1"
            placeholder="https://example.com/image.png"
            type="url"
          />
          {!!form.formState.errors.avatar && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.avatar.message}
            </p>
          )}
        </div>

        {/* Chọn Vai trò (Role) */}
        <div>
          <Label htmlFor="role">Vai trò</Label>
          <Select
            defaultValue={initialUserData.role}
            onValueChange={(value) =>
              form.setValue('role', value as UserRole, { shouldDirty: true })
            }
          >
            <SelectTrigger
              className="mt-1"
              id="role"
            >
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {userRoleOptions.map((roleOpt) => (
                <SelectItem
                  key={roleOpt.value}
                  value={roleOpt.value}
                >
                  {roleOpt.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chọn Trạng thái (Status hệ thống) */}
        <div>
          <Label htmlFor="status">Trạng thái (Hệ thống)</Label>
          <Select
            defaultValue={initialUserData.status}
            onValueChange={(value) =>
              form.setValue('status', value as UserStatus, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              className="mt-1"
              id="status"
            >
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {userStatusOptions
                .filter((statusOpt) => statusOpt.value !== UserStatus.BANNED) // Không cho admin tự đặt BANNED ở đây, dùng nút riêng
                .map((statusOpt) => (
                  <SelectItem
                    key={statusOpt.value}
                    value={statusOpt.value}
                  >
                    {statusOpt.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Label>Trạng thái trên</Label>
        <div className="mt-1 flex items-center gap-3">
          <BadgeStatus
            title={isClerkBanned ? 'Đã cấm' : 'Không cấm'}
            variant={isClerkBanned ? 'red' : 'green'}
          />
          <Button
            disabled={isSubmitting}
            type="button"
            variant={isClerkBanned ? 'outline' : 'destructive'}
            onClick={handleToggleBanStatus}
          >
            {isClerkBanned ? 'Bỏ cấm User' : 'Cấm User'}
          </Button>
        </div>
      </div>

      <Button
        className="mt-8 w-full py-3 text-base"
        disabled={isSubmitting || !form.formState.isDirty}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
};

export default UpdateUserDetailContainer;
