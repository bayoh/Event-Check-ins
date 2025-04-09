'use client'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Navigation } from '@/components/Navigation'

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
})

// export const metadata: Metadata = {
//   title: 'Attendee Check-in System',
//   description: 'A room-based attendee check-in system with QR code scanning',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${inter.className} h-full`}>
        <MantineProvider>
          <Notifications />
          <Navigation>
            {children}
          </Navigation>
        </MantineProvider>
      </body>
    </html>
  )
} 