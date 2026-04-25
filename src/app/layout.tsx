import type { Metadata } from 'next';
import { Barlow, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'Olite ERP', template: '%s | Olite ERP' },
  description: 'Manufacturing ERP System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
