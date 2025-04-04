import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/common';
import { manrope } from '@/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export const metadata: Metadata = {
	title: 'Ucademy',
	description: 'Nền tảng học lập trình trực tuyến.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={`${manrope.variable} `}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<ToastContainer
							autoClose={2000}
							hideProgressBar
							position="top-right"
							className="text-sm font-medium"
						></ToastContainer>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
