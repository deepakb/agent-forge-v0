import type { Metadata } from 'next'
import { Inter, Source_Sans_3, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Primary display font for headings and important UI elements
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  preload: true,
})

// Body text font for better readability
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
})

// Monospace font for code and technical content
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'Agent Forge - Build Scalable AI Agent Systems',
  description: 'Enterprise-grade AI agent development platform for building scalable systems',
  keywords: 'AI, Agent Systems, Enterprise Software, Development Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased bg-white text-neutral-900">{children}</body>
    </html>
  )
}
