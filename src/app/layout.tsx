import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '퀴즈 프로그램',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
