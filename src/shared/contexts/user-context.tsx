'use client';
import { useAuth } from '@clerk/nextjs';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'; // Import Dispatch và SetStateAction

import { getUserInfo } from '@/modules/user/actions'; // Đảm bảo đường dẫn này đúng

import { UserModelProps } from '../types'; // Đảm bảo đường dẫn này đúng

// 1. Cập nhật kiểu cho Context để bao gồm isLoadingUser
interface UserContextType {
  userInfo: UserModelProps | null;
  setUserInfo: Dispatch<SetStateAction<UserModelProps | null>>;
  isLoadingUser: boolean; // Thêm isLoadingUser vào kiểu
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserModelProps | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // 2. Thêm state cho isLoadingUser, khởi tạo là true
  const { userId } = useAuth();

  useEffect(() => {
    async function fetchUserInfo() {
      setIsLoadingUser(true); // Bắt đầu quá trình tải
      if (!userId) {
        // Nếu không có userId (ví dụ: người dùng chưa đăng nhập)
        setUserInfo(null);
        setIsLoadingUser(false); // Kết thúc tải

        return;
      }
      try {
        const user = await getUserInfo({ userId }); // userId đã được kiểm tra là có giá trị

        if (user) {
          setUserInfo(user);
        } else {
          setUserInfo(null); // Nếu không tìm thấy user trong DB của bạn
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setUserInfo(null); // Xử lý lỗi bằng cách đặt userInfo thành null
      } finally {
        setIsLoadingUser(false); // Luôn kết thúc tải, dù thành công hay thất bại
      }
    }
    fetchUserInfo();
  }, [userId]);

  return (
    // 3. Cung cấp isLoadingUser trong value của Provider
    <UserContext.Provider value={{ userInfo, setUserInfo, isLoadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  // 4. Đảm bảo kiểu trả về của hook khớp với UserContextType
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
};
