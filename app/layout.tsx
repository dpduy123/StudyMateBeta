import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import '@/lib/cache/clearCache' // Expose clearCache to window for testing

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'StudyMate - Kết nối sinh viên, học tập cùng nhau',
  description: 'Nền tảng kết nối sinh viên để học nhóm, chia sẻ kiến thức và xây dựng mối quan hệ học thuật. Tính năng AI matching, chat rooms, và hệ thống thành tích.',
  keywords: 'sinh viên, học nhóm, kết nối, study group, university, college, AI matching, chat rooms',
  authors: [{ name: 'StudyMate Team' }],
  openGraph: {
    title: 'StudyMate - Kết nối sinh viên, học tập cùng nhau',
    description: 'Nền tảng kết nối sinh viên để học nhóm, chia sẻ kiến thức và xây dựng mối quan hệ học thuật.',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyMate - Kết nối sinh viên, học tập cùng nhau',
    description: 'Nền tảng kết nối sinh viên để học nhóm, chia sẻ kiến thức và xây dựng mối quan hệ học thuật.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
