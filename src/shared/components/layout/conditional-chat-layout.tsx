'use client';

import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

import ChatWidget from '@/modules/chatbot/manage/chat-widgit';
import { ChatProvider } from '@/shared/contexts';

interface ConditionalChatLayoutProps {
  children: ReactNode;
}

const ConditionalChatLayout: React.FC<ConditionalChatLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/manage');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <ChatProvider>
      {children}
      <ChatWidget />
    </ChatProvider>
  );
};

export default ConditionalChatLayout;
