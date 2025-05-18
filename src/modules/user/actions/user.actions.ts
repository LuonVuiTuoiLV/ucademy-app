'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { FilterQuery } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { UserRole, UserStatus } from '@/shared/constants';
import { connectToDatabase } from '@/shared/lib/mongoose';
import { CourseModel, UserModel } from '@/shared/schemas';
import { QueryFilter, UserItemData, UserModelProps } from '@/shared/types';
import { CreateUserParams } from '@/shared/types/user.type';

export async function fetchUsers(
  params: QueryFilter,
): Promise<UserItemData[] | undefined> {
  try {
    connectToDatabase();
    const { limit = 10, page = 1, search, status } = params;
    const skip = (page - 1) * limit;
    const query: FilterQuery<typeof UserModel> = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }
    if (status) {
      query.status = status;
    }
    const courses = await UserModel.find(query)
      .populate({
        path: 'courses',
        model: CourseModel,
        select: 'title slug',
      })
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.log(error);
  }
}

export async function createUser(params: CreateUserParams) {
  try {
    connectToDatabase();
    const user = await UserModel.create(params);

    return user;
  } catch (error) {
    console.log(error);
  }
}
export async function getUserInfo({
  userId,
}: {
  userId: string;
}): Promise<UserModelProps | null | undefined> {
  try {
    connectToDatabase();
    const findUser = await UserModel.findOne({ clerkId: userId });

    if (!findUser?._id) return null;

    return JSON.parse(JSON.stringify(findUser));
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByIdForAdmin(
  userId: string,
): Promise<(UserItemData & { banned?: boolean }) | null> {
  try {
    await connectToDatabase();
    const user = await UserModel.findById(userId).lean<UserModelProps | null>();

    if (!user) {
      return null;
    }

    let clerkUser;

    try {
      clerkUser = await clerkClient.users.getUser(user.clerkId);
    } catch (error) {
      console.error(
        `Error fetching Clerk user ${user.clerkId} for admin view:`,
        error,
      );
    }

    const combinedUser = {
      ...JSON.parse(JSON.stringify(user)),
      banned: clerkUser?.banned || false,

      email:
        clerkUser?.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress || user.email,
      username: clerkUser?.username || user.username,
      avatar: clerkUser?.imageUrl || user.avatar,
    };

    return combinedUser as UserItemData & { banned?: boolean };
  } catch (error) {
    console.error('Error in getUserByIdForAdmin:', error);

    return null;
  }
}

export interface UpdateUserProfileParams {
  clerkId: string;
  updateData: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

export async function updateUserProfile(
  params: UpdateUserProfileParams,
): Promise<
  | {
      success: boolean;
      message?: string;
      updatedUser?: Partial<UserModelProps>;
    }
  | undefined
> {
  try {
    await connectToDatabase();
    const { clerkId, updateData } = params;

    const authUser = await currentUser();

    if (!authUser || authUser.id !== clerkId) {
      return {
        success: false,
        message: 'Không được phép thực hiện hành động này.',
      };
    }

    // ---- Cập nhật trên Clerk ----
    const clerkUpdateData: Record<string, any> = {};

    if (updateData.name) {
      const nameParts = updateData.name.split(' ');

      clerkUpdateData.firstName = nameParts[0];
      clerkUpdateData.lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Handle single name
    }
    if (updateData.username) {
      clerkUpdateData.username = updateData.username;
    }
    if (updateData.avatar) {
      clerkUpdateData.imageUrl = updateData.avatar;
    }
    if (Object.keys(clerkUpdateData).length > 0) {
      await clerkClient.users.updateUser(clerkId, clerkUpdateData);
    }

    const mongooseUpdateData: Partial<UserModelProps> = {};

    if (updateData.name !== undefined)
      mongooseUpdateData.name = updateData.name;
    if (updateData.username !== undefined)
      mongooseUpdateData.username = updateData.username;
    if (updateData.avatar !== undefined)
      mongooseUpdateData.avatar = updateData.avatar;

    if (Object.keys(mongooseUpdateData).length > 0) {
      const updatedMongoUser = await UserModel.findOneAndUpdate(
        { clerkId },
        { $set: mongooseUpdateData },
        { new: true, runValidators: true },
      ).select('-courses');

      if (!updatedMongoUser) {
        return {
          success: false,
          message: 'Không tìm thấy người dùng trong cơ sở dữ liệu.',
        };
      }

      revalidatePath('/user/information');

      return {
        success: true,
        message: 'Cập nhật thông tin thành công!',
        updatedUser: JSON.parse(JSON.stringify(updatedMongoUser)),
      };
    } else {
      return {
        success: true,
        message: 'Không có thông tin nào được thay đổi.',
      };
    }
  } catch (error: any) {
    console.error('Error in updateUserProfile action:', error);
    // Xử lý các lỗi cụ thể từ Clerk hoặc Mongoose
    if (error.errors) {
      // Lỗi validation từ Clerk hoặc Mongoose
      const messages = error.errors
        .map((error_: any) => error_.message || error_.longMessage)
        .join(', ');

      return { success: false, message: `Lỗi: ${messages}` };
    }

    return { success: false, message: 'Có lỗi xảy ra phía server.' };
  }
}
export type UpdateUserStatusByAdminParams = {
  targetUserId: string; // ID của người dùng cần cập nhật (có thể là _id của Mongoose)
  newStatus?: UserStatus; // Trạng thái mới từ hệ thống của bạn
  newRole?: UserRole; // Vai trò mới nếu muốn cập nhật cả vai trò
  // Thêm các trường khác nếu admin được phép cập nhật
};

export async function updateUserStatusByAdmin(
  params: UpdateUserStatusByAdminParams,
): Promise<{
  success: boolean;
  message: string;
  updatedUser?: Partial<UserModelProps>; // Trả về một phần user đã cập nhật
}> {
  try {
    // 1. Xác thực admin (ví dụ)
    const adminUser = await currentUser();

    if (!adminUser) {
      return {
        success: false,
        message: 'Yêu cầu đăng nhập với tư cách quản trị viên.',
      };
    }
    const findUser = await UserModel.findOne({
      email: adminUser.emailAddresses[0].emailAddress,
    });

    if (findUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: 'Không có quyền thực hiện hành động này.',
      };
    }

    await connectToDatabase();
    const { newRole, newStatus, targetUserId } = params;

    const userToUpdate = await UserModel.findById(targetUserId);
    const clerkIdToUpdate = userToUpdate.clerkId; // Lấy clerkId từ Mongoose DB

    // 2. Cập nhật trên Clerk (nếu cần)
    if (newStatus === UserStatus.BANNED && !userToUpdate.banned) {
      await clerkClient.users.banUser(clerkIdToUpdate);
    } else if (
      (newStatus === UserStatus.ACTIVE || newStatus === UserStatus.UNACTIVE) &&
      userToUpdate.banned // Nếu trạng thái mới là ACTIVE/UNACTIVE và user đang bị ban trên Clerk
    ) {
      await clerkClient.users.unbanUser(clerkIdToUpdate);
    }
    if (newRole && newRole !== userToUpdate.role) {
      await clerkClient.users.updateUserMetadata(clerkIdToUpdate, {
        publicMetadata: {
          ...(await clerkClient.users.getUser(clerkIdToUpdate)).publicMetadata,
          role: newRole,
        },
      });
    }

    const mongooseUpdateData: Partial<UserModelProps> = {};

    if (newStatus) {
      mongooseUpdateData.status = newStatus;
    }
    if (newRole) {
      mongooseUpdateData.role = newRole;
    }
    // Đồng bộ trạng thái banned từ Clerk (nếu có thay đổi)
    const refreshedClerkUser = await clerkClient.users.getUser(clerkIdToUpdate);

    if (refreshedClerkUser.banned !== userToUpdate.banned) {
      if (refreshedClerkUser.banned && newStatus !== UserStatus.BANNED) {
        mongooseUpdateData.status = UserStatus.BANNED; // Ghi đè status nếu Clerk ban
      } else if (
        !refreshedClerkUser.banned &&
        newStatus === UserStatus.BANNED
      ) {
        mongooseUpdateData.status = UserStatus.ACTIVE; // Hoặc UNACTIVE tùy logic
      }
    }

    if (Object.keys(mongooseUpdateData).length === 0) {
      return {
        success: true,
        message: 'Không có thay đổi nào được thực hiện.',
      };
    }

    const updatedDatabaseUser = await UserModel.findByIdAndUpdate(
      targetUserId,
      { $set: mongooseUpdateData },
      { new: true },
    );

    if (!updatedDatabaseUser) {
      return {
        success: false,
        message: 'Cập nhật người dùng trong cơ sở dữ liệu thất bại.',
      };
    }

    revalidatePath('/manage/user'); // Hoặc path của trang quản lý user

    return {
      success: true,
      message: 'Cập nhật thông tin người dùng thành công!',
      updatedUser: JSON.parse(JSON.stringify(updatedDatabaseUser)),
    };
  } catch (error: any) {
    console.error('Error updating user status by admin:', error);
    if (error.errors && Array.isArray(error.errors)) {
      const messages = error.errors
        .map((error_: any) => error_.longMessage || error_.message)
        .join(', ');

      return { success: false, message: `Lỗi từ Clerk: ${messages}` };
    }

    return {
      success: false,
      message: error.message || 'Có lỗi máy chủ xảy ra.',
    };
  }
}
export interface UpdateUserProfileByAdminParams {
  clerkId: string;
  updateData: {
    name?: string;
    username?: string;
    avatar?: string | null;
  };
}

export async function updateUserProfileByAdmin(
  params: UpdateUserProfileByAdminParams,
): Promise<
  | {
      success: boolean;
      message?: string;
      updatedUser?: Partial<
        Pick<UserModelProps, 'name' | 'username' | 'avatar' | 'email'>
      >; // Chỉ trả về các trường này
    }
  | undefined
> {
  try {
    // 1. Xác thực admin (quan trọng!)
    const adminUser = await currentUser();

    if (
      !adminUser ||
      (adminUser.publicMetadata?.role !== UserRole.ADMIN &&
        adminUser.privateMetadata?.role !== UserRole.ADMIN)
    ) {
      return {
        success: false,
        message: 'Không có quyền thực hiện hành động này.',
      };
    }

    await connectToDatabase();
    const { clerkId, updateData } = params;

    // ---- Lấy thông tin user hiện tại từ Clerk ----
    let clerkUserToUpdate;

    try {
      clerkUserToUpdate = await clerkClient.users.getUser(clerkId);
    } catch {
      return {
        success: false,
        message: 'Không tìm thấy người dùng trên Clerk.',
      };
    }

    // ---- Dữ liệu để cập nhật trên Clerk ----
    const clerkUpdatePayload: {
      firstName?: string;
      lastName?: string;
      username?: string;
      imageUrl?: string;
    } = {};

    if (
      updateData.name &&
      updateData.name !==
        `${clerkUserToUpdate.firstName || ''} ${clerkUserToUpdate.lastName || ''}`.trim()
    ) {
      const nameParts = updateData.name.split(' ');

      clerkUpdatePayload.firstName = nameParts[0];
      clerkUpdatePayload.lastName =
        nameParts.slice(1).join(' ') || nameParts[0];
    }
    if (
      updateData.username &&
      updateData.username !== clerkUserToUpdate.username
    ) {
      clerkUpdatePayload.username = updateData.username;
    }

    let newClerkAvatarUrl: string | null | undefined = undefined;

    if (updateData.avatar === null && clerkUserToUpdate.imageUrl) {
      // Muốn xóa avatar, Clerk thường xử lý khi bạn set imageUrl là chuỗi rỗng hoặc gọi API xóa riêng
      // await clerkClient.users.deleteUserProfileImage(clerkId); // Cách này rõ ràng hơn để xóa
      clerkUpdatePayload.imageUrl = ''; // Hoặc cách Clerk yêu cầu để xóa ảnh
      newClerkAvatarUrl = null;
    } else if (
      updateData.avatar &&
      updateData.avatar !== clerkUserToUpdate.imageUrl
    ) {
      clerkUpdatePayload.imageUrl = updateData.avatar; // <-- SỬA THÀNH imageUrl
      // newClerkAvatarUrl sẽ được lấy sau khi gọi API Clerk
    }

    // Cập nhật các trường khác (name, username) trên Clerk nếu có
    const otherClerkUpdates = { ...clerkUpdatePayload };

    delete otherClerkUpdates.imageUrl; // Đã xử lý riêng
    if (Object.keys(otherClerkUpdates).length > 0) {
      await clerkClient.users.updateUser(clerkId, otherClerkUpdates);
    }

    // ---- Lấy lại thông tin đầy đủ từ Clerk sau tất cả các cập nhật ----
    const refreshedClerkUser = await clerkClient.users.getUser(clerkId);

    if (newClerkAvatarUrl !== undefined) {
      newClerkAvatarUrl = refreshedClerkUser.imageUrl;
    }

    // ---- Dữ liệu để cập nhật trên Mongoose ----
    const mongooseUpdateData: Partial<UserModelProps> = {};

    if (updateData.name !== undefined)
      mongooseUpdateData.name = updateData.name;

    const existingMongoUser = await UserModel.findOne({ clerkId });

    if (
      updateData.username !== undefined &&
      updateData.username !== existingMongoUser?.username
    ) {
      mongooseUpdateData.username = updateData.username;
    }
    // Cập nhật avatar trong DB bằng URL mới nhất từ Clerk
    if (newClerkAvatarUrl !== undefined) {
      mongooseUpdateData.avatar =
        newClerkAvatarUrl === null ? undefined : newClerkAvatarUrl;
    } else if (
      refreshedClerkUser.imageUrl !== existingMongoUser?.avatar &&
      updateData.avatar !== undefined &&
      updateData.avatar !== null
    ) {
      // Nếu avatar trên Clerk khác DB và client có gửi gì đó (không phải xóa) thì đồng bộ
      mongooseUpdateData.avatar = refreshedClerkUser.imageUrl;
    }

    if (Object.keys(mongooseUpdateData).length > 0) {
      const updatedDatabaseUser = await UserModel.findOneAndUpdate(
        { clerkId },
        { $set: mongooseUpdateData },
        { new: true },
      ).select('name username avatar email'); // Chỉ chọn các trường cần trả về

      if (!updatedDatabaseUser)
        return { success: false, message: 'Cập nhật DB thất bại' };

      revalidatePath(
        `/manage/user/update/${existingMongoUser?._id.toString()}`,
      );
      revalidatePath('/manage/user');

      return {
        success: true,
        message: 'Cập nhật thông tin người dùng thành công!',
        updatedUser: {
          // Chỉ trả về những gì đã thay đổi hoặc cần cho UI
          name: updatedDatabaseUser.name,
          username: updatedDatabaseUser.username,
          avatar: updatedDatabaseUser.avatar, // avatar này là từ Clerk
          email: refreshedClerkUser.emailAddresses.find(
            (e) => e.id === refreshedClerkUser.primaryEmailAddressId,
          )?.emailAddress,
        },
      };
    } else if (
      newClerkAvatarUrl !== undefined ||
      Object.keys(otherClerkUpdates).length > 0
    ) {
      // Chỉ cập nhật trên Clerk, không có gì thay đổi DB (ngoài avatar đã được xử lý nếu newClerkAvatarUrl !== undefined)
      // Vẫn revalidate và trả về thông tin mới từ Clerk
      revalidatePath(
        `/manage/user/update/${existingMongoUser?._id.toString()}`,
      );
      revalidatePath('/manage/user');

      return {
        success: true,
        message: 'Cập nhật thông tin trên Clerk thành công!',
        updatedUser: {
          name: `${refreshedClerkUser.firstName || ''} ${refreshedClerkUser.lastName || ''}`.trim(),
          username: refreshedClerkUser.username || '',
          avatar: refreshedClerkUser.imageUrl,
          email: refreshedClerkUser.emailAddresses.find(
            (e) => e.id === refreshedClerkUser.primaryEmailAddressId,
          )?.emailAddress,
        },
      };
    }

    return { success: true, message: 'Không có thông tin nào được thay đổi.' };
  } catch (error: any) {
    // ... (xử lý lỗi như cũ)
    console.error('Error in updateUserProfileByAdmin action:', error);
    if (error.errors && Array.isArray(error.errors)) {
      const messages = error.errors
        .map((error_: any) => error_.longMessage || error_.message)
        .join(', ');

      return { success: false, message: `Lỗi từ Clerk: ${messages}` };
    }

    return {
      success: false,
      message: error.message || 'Có lỗi máy chủ xảy ra.',
    };
  }
}
