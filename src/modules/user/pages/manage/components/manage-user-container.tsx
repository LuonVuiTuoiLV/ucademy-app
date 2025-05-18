'use client';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Import Server Action mới
import {
  updateUserStatusByAdmin /* softDeleteUserByAdmin */,
  UpdateUserStatusByAdminParams,
} from '@/modules/user/actions';
import {
  BadgeStatus,
  Heading,
  TableActionItem,
} from '@/shared/components/common';
import {
  IconCancel, // Dùng cho Unactive/Ban
  IconCheck, // Dùng cho Active
  IconDelete, // Dùng cho nút xóa (nếu có)
} from '@/shared/components/icons'; // Import các icon cần thiết
import {
  Button,
  // Thêm DropdownMenu nếu muốn gộp các hành động
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import {
  allValue,
  UserRole, // Import UserRole
  userRole, // Danh sách vai trò người dùng
  UserStatus, // Sử dụng UserStatus thay vì CourseStatus
  userStatus, // Danh sách trạng thái người dùng
} from '@/shared/constants';
import { useQueryString } from '@/shared/hooks';
import { UserItemData } from '@/shared/types'; // Import UpdateUserStatusByAdminParams

interface UserManageContainerProps {
  users?: UserItemData[]; // UserItemData cần có clerkId, role, status, banned (từ Clerk)
}

const UserManageContainer = ({ users = [] }: UserManageContainerProps) => {
  const { handleSearchData, handleSelectStatus: handleFilterByStatus } =
    useQueryString(); // Đổi tên để tránh nhầm lẫn

  const processUserUpdate = async (
    params: UpdateUserStatusByAdminParams,
    successMessage: string,
  ) => {
    const result = await updateUserStatusByAdmin(params);

    if (result?.success) {
      toast.success(successMessage);
      // Cần revalidate hoặc refresh data ở đây nếu không muốn đợi revalidatePath
    } else {
      toast.error(result?.message || 'Có lỗi xảy ra.');
    }
  };

  // Hàm thay đổi trạng thái (ACTIVE, UNACTIVE, BANNED)
  const handleChangeUserStatus = (
    user: UserItemData,
    newStatus: UserStatus,
  ) => {
    let swalTitle = `Bạn có chắc muốn chuyển trạng thái người dùng "${user.name}" thành "${userStatus.find((s) => s.value === newStatus)?.title}"?`;
    let swalConfirmButtonText = 'Đồng ý';
    let swalIcon: 'question' | 'warning' = 'question';

    if (newStatus === UserStatus.BANNED) {
      swalTitle = `Bạn có chắc muốn CẤM người dùng "${user.name}"? Hành động này sẽ ngăn họ đăng nhập.`;
      swalConfirmButtonText = 'Đồng ý Cấm';
      swalIcon = 'warning';
    } else if (
      newStatus === UserStatus.ACTIVE &&
      user.status === UserStatus.BANNED
    ) {
      swalTitle = `Bạn có chắc muốn BỎ CẤM người dùng "${user.name}"?`;
      swalConfirmButtonText = 'Đồng ý Bỏ cấm';
    } else if (newStatus === UserStatus.UNACTIVE) {
      swalTitle = `Bạn có chắc muốn VÔ HIỆU HÓA người dùng "${user.name}"? (Họ vẫn có thể đăng nhập nếu không bị cấm ở Clerk).`;
      // UNACTIVE có thể không ảnh hưởng đến Clerk ban status.
    }

    Swal.fire({
      title: swalTitle,
      icon: swalIcon,
      showCancelButton: true,
      confirmButtonText: swalConfirmButtonText,
      cancelButtonText: 'Hủy',
      confirmButtonColor: newStatus === UserStatus.BANNED ? '#d33' : '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await processUserUpdate(
          { targetUserId: user._id, newStatus }, // Gửi _id của Mongoose
          'Cập nhật trạng thái người dùng thành công.',
        );
      }
    });
  };

  // Hàm thay đổi vai trò (ví dụ)
  const handleChangeUserRole = (user: UserItemData, newRole: UserRole) => {
    Swal.fire({
      title: `Đổi vai trò cho "${user.name}" thành "${userRole.find((r) => r.value === newRole)?.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await processUserUpdate(
          { targetUserId: user._id, newRole },
          'Cập nhật vai trò người dùng thành công.',
        );
      }
    });
  };

  // Hàm xử lý xóa mềm (ví dụ)
  const handleDeleteUser = (user: UserItemData) => {
    Swal.fire({
      title: `Bạn có chắc muốn XÓA MỀM người dùng "${user.name}"?`,
      text: 'Hành động này có thể kèm theo việc cấm người dùng trên Clerk.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý Xóa mềm',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Gọi server action để soft delete và có thể ban trên Clerk
        // await softDeleteUserByAdmin(user._id);
        // Hoặc dùng updateUserStatusByAdmin với trạng thái đặc biệt và _destroy: true
        await processUserUpdate(
          {
            targetUserId: user._id,
            newStatus: UserStatus.UNACTIVE, // Hoặc một status DELETED
            // Nếu schema UserModelProps có _destroy, bạn có thể thêm vào updateData trong server action
          },
          `Đã vô hiệu hóa người dùng ${user.name}.`,
        );
        toast.success('Đã vô hiệu hóa người dùng.');
      }
    });
  };

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <Heading className="">Quản Lý Thành Viên</Heading>
        <div className="flex gap-3">
          <div className="w-full lg:w-[300px]">
            <Input
              placeholder="Tìm tên, email, username..." // Sửa placeholder
              onChange={handleSearchData} // Sửa cách lấy giá trị
            />
          </div>
          <Select
            onValueChange={(value) => handleFilterByStatus(value as UserStatus)} // Sử dụng UserStatus
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={allValue}>Tất cả trạng thái</SelectItem>
                {userStatus.map(
                  (
                    statusItem, // Lặp qua userStatus
                  ) => (
                    <SelectItem
                      key={statusItem.value}
                      value={statusItem.value}
                    >
                      {statusItem.title}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* Thêm Select để lọc theo Role nếu cần */}
        </div>
      </div>
      <Table className="table-responsive">
        <TableHeader>
          <TableRow>
            <TableHead>Thông tin</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái (Hệ thống)</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              // Bỏ qua user đã bị _destroy nếu bạn có trường đó
              // if (user._destroy) return null;

              const userStatusItem = userStatus.find(
                (item) => item.value === user.status,
              );
              const userRoleItem = userRole.find(
                (item) => item.value === user.role,
              );

              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={user.name || user.username || 'Avatar'}
                        className="size-12 shrink-0 rounded-full object-cover" // Giảm size ảnh
                        height={48}
                        src={user.avatar || '/placeholder-avatar.png'} // Thêm placeholder
                        width={48}
                      />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {user.name || 'N/A'}
                        </h3>
                        <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          @{user.username || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ID: {user.clerkId.slice(-6)}{' '}
                          {/* Hiển thị 1 phần clerkId */}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600 dark:text-gray-300 lg:text-sm">
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BadgeStatus
                      className="cursor-pointer"
                      title={userRoleItem?.title || user.role}
                      variant={userRoleItem?.variant || 'default'}
                      // onClick để mở modal đổi role
                      onClick={() => {
                        /* TODO: Mở modal đổi role, ví dụ: handleChangeUserRole(user, newRoleFromModal) */
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <BadgeStatus
                      className="cursor-pointer"
                      title={userStatusItem?.title || user.status}
                      variant={userStatusItem?.variant || 'default'}
                      // onClick để mở modal đổi status
                      onClick={() => {
                        /* TODO: Mở modal đổi status, ví dụ: handleChangeUserStatus(user, newStatusFromModal) */
                      }}
                    />
                  </TableCell>

                  <TableCell className="flex justify-end gap-4">
                    <TableActionItem
                      type="study"
                      url={`/manage/member/update?slug=${user._id}`}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="size-8 p-0"
                          variant="ghost"
                        >
                          <span className="sr-only">Mở menu</span>
                          {/* <MoreHorizontal className="h-4 w-4" /> Bạn cần icon này */}
                          ...
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status !== UserStatus.ACTIVE && !user.banned && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserStatus(user, UserStatus.ACTIVE)
                            }
                          >
                            <IconCheck className="mr-2 size-4 text-green-500" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        {user.status !== UserStatus.UNACTIVE &&
                          !user.banned && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeUserStatus(
                                  user,
                                  UserStatus.UNACTIVE,
                                )
                              }
                            >
                              <IconCancel className="mr-2 size-4 text-yellow-500" />
                              Vô hiệu hóa
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        {/* Hành động cho Ban/Unban Clerk */}
                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserStatus(user, UserStatus.ACTIVE)
                            }
                          >
                            Bỏ cấm
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserStatus(user, UserStatus.BANNED)
                            }
                          >
                            Cấm User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {/* Hành động cho Role (ví dụ) */}
                        {user.role !== UserRole.ADMIN && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserRole(user, UserRole.ADMIN)
                            }
                          >
                            Gán quyền Admin
                          </DropdownMenuItem>
                        )}
                        {user.role === UserRole.ADMIN &&
                          user.clerkId !== 'ID_CUA_ADMIN_HIEN_TAI' && (
                            /* Không cho tự bỏ quyền admin của chính mình */ <DropdownMenuItem
                              onClick={() =>
                                handleChangeUserRole(user, UserRole.USER)
                              }
                            >
                              Bỏ quyền Admin
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 hover:!text-red-600"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <IconDelete className="mr-2 size-4" /> Xóa mềm User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center"
                colSpan={6}
              >
                Không có thành viên nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default UserManageContainer;
