'use client';

import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/modules/notification/actions';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useUserContext } from '@/shared/contexts';
import { timeAgo } from '@/shared/helpers';
import { PlainNotificationData } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Bell, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const NotificationBell: React.FC = () => {
  const { userInfo, isLoadingUser } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<PlainNotificationData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Ref để track polling interval
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);

  // Fetch số lượng thông báo chưa đọc
  const fetchCount = useCallback(async () => {
    if (userInfo?._id) {
      try {
        const count = await getUnreadNotificationCount(userInfo._id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Lỗi khi fetch unread count:', error);
      }
    } else {
      setUnreadCount(0);
    }
  }, [userInfo?._id]);

  // Fetch danh sách thông báo
  const fetchNotifications = useCallback(
    async (force = false) => {
      if (!userInfo?._id) {
        setNotifications([]);
        return;
      }

      // Tránh fetch quá thường xuyên
      const now = Date.now();
      if (!force && now - lastFetchTime.current < 2000) {
        return;
      }
      lastFetchTime.current = now;

      setIsLoading(true);
      try {
        const result = await getUserNotifications({
          userId: userInfo._id,
          limit: 10,
        });

        if (result && result.notifications) {
          setNotifications(result.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Lỗi khi fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userInfo?._id],
  );

  // Refresh toàn bộ dữ liệu
  const refreshData = useCallback(async () => {
    if (userInfo?._id) {
      await Promise.all([
        fetchCount(),
        isOpen ? fetchNotifications(true) : Promise.resolve(),
      ]);
    }
  }, [userInfo?._id, fetchCount, fetchNotifications, isOpen]);

  // Setup polling khi có user
  useEffect(() => {
    if (!isLoadingUser && userInfo?._id) {
      // Initial fetch
      fetchCount();

      // Setup polling mỗi 30 giây
      pollingInterval.current = setInterval(() => {
        fetchCount();
        // Chỉ fetch notifications nếu popup đang mở
        if (isOpen) {
          fetchNotifications();
        }
      }, 30000);
    } else if (!isLoadingUser && !userInfo?._id) {
      // Clear data khi không có user
      setUnreadCount(0);
      setNotifications([]);

      // Clear polling
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [userInfo?._id, isLoadingUser, isOpen, fetchCount, fetchNotifications]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && userInfo?._id) {
      // Fetch notifications khi mở popup
      fetchNotifications(true);
    }
  };

  const handleNotificationClick = async (
    notification: PlainNotificationData,
  ) => {
    if (userInfo?._id && !notification.is_read) {
      try {
        const success = await markNotificationAsRead(
          notification._id.toString(),
          userInfo._id,
        );

        if (success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, is_read: true } : n,
            ),
          );

          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Lỗi khi mark notification as read:', error);
      }
    }

    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (userInfo?._id) {
      try {
        const success = await markAllNotificationsAsRead(userInfo._id);

        if (success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true })),
          );
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Lỗi khi mark all notifications as read:', error);
      }
    }
  };

  // Manual refresh function (có thể expose ra ngoài nếu cần)
  const handleRefresh = () => {
    refreshData();
  };

  if (isLoadingUser) {
    return (
      <div className="size-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
    );
  }

  if (!userInfo?._id) {
    return null;
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
      >
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold">Thông báo</h4>
          <div className="flex gap-2">
            {/* Nút refresh thủ công */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-xs"
              disabled={isLoading}
            >
              🔄
            </Button>

            {/* Đánh dấu tất cả đã đọc */}
            {notifications.some((n) => !n.is_read) && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckCheck className="mr-1 size-4" />
                Đọc tất cả
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2">Đang tải...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <Bell className="mx-auto mb-2 size-8 text-gray-300" />
              <p>Bạn chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id.toString()}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'cursor-pointer p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                    !notification.is_read &&
                      'border-l-4 border-l-blue-500 bg-blue-50 font-medium dark:bg-blue-900/30',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 text-sm">{notification.message}</p>
                    {!notification.is_read && (
                      <div className="mt-1 size-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
