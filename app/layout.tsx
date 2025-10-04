import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster-simple'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Den - Virtual Birthday Parties',
  description: 'Host virtual birthday parties with friends and family. Chat, video call, and perform virtual cake cutting ceremonies together.',
  keywords: ['virtual party', 'birthday', 'celebration', 'chat', 'video call', 'cake cutting'],
  authors: [{ name: 'The Den Team' }],
  openGraph: {
    title: 'The Den - Virtual Birthday Parties',
    description: 'Create magical virtual birthday celebrations with friends and family',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
