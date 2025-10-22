// src/shared/contexts/UserProvider.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { createContext, useContext, useEffect, useState } from 'react';

interface UserInfo {
  id?: string;
  clerkId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role?: 'ADMIN' | 'USER';
  // Thêm các field khác từ MongoDB nếu cần
}

interface UserContextType {
  clerkUser: any;
  userInfo: UserInfo | null;
  isLoadingUser: boolean;
  isSignedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoadingUser(true);
      return;
    }

    if (isSignedIn && user) {
      syncUserToDatabase(user);
    } else {
      setUserInfo(null);
      setIsLoadingUser(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const syncUserToDatabase = async (clerkUser: any) => {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          image: clerkUser.imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          id: data._id,
          clerkId: data.clerkId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          image: data.image,
          role: data.role || 'USER',
        });
      } else {
        console.error('Failed to sync user');
        setUserInfo({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          image: clerkUser.imageUrl,
          role: 'USER',
        });
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      // Fallback: set thông tin từ Clerk
      setUserInfo({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        image: clerkUser.imageUrl,
        role: 'USER',
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        clerkUser: user,
        userInfo,
        isLoadingUser,
        isSignedIn: isSignedIn || false,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
