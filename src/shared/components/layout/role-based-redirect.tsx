'use client';

import { useUserContext } from '@/shared/contexts';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function RoleBasedRedirect() {
  const { userId, isLoaded } = useAuth();
  const { userInfo, isLoadingUser } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || isLoadingUser || !userId) {
      return;
    }

    if (!userInfo) {
      router.push('/sign-in');
      return;
    }

    // Redirect dựa trên role
    if (userInfo.role === 'ADMIN') {
      router.push('/dashboard');
    } else {
      router.push('/explore');
    }
  }, [isLoaded, isLoadingUser, userId, userInfo, router]);

  // Hiển thị loading trong khi đang kiểm tra
  if (!isLoaded || isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return null;
}

export default RoleBasedRedirect;
