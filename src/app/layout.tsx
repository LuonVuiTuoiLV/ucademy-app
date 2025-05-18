import 'react-toastify/dist/ReactToastify.css';
import './globals.scss';

import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from '@/shared/components/common';
import { ConditionalChatLayout } from '@/shared/components/layout';
import { UserProvider } from '@/shared/contexts';

export const metadata: Metadata = {
  title: 'Ucademy',
  description: 'Nền tảng học lập trình trực tuyến siêu cấp vip pro',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
  },
};

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        suppressHydrationWarning
        lang="vi"
      >
        <body className={`${manrope.variable} `}>
          <ThemeProvider
            disableTransitionOnChange
            enableSystem
            attribute="class"
            defaultTheme="system"
          >
            <UserProvider>
              <ConditionalChatLayout>{children}</ConditionalChatLayout>
            </UserProvider>
            <SpeedInsights />
            <Analytics />
            <ToastContainer
              autoClose={2000}
              bodyClassName="text-sm font-medium"
              position="top-right"
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
