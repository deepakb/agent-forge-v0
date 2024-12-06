'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Applications', href: '#applications' },
  { name: 'Documentation', href: '/docs' },
  { name: 'Pricing', href: '/pricing' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-white'
      }`}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <div className="flex lg:flex-1">
            <Link
              href="/"
              className="flex items-center gap-3 font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Logo />
              Agent Forge
            </Link>
          </div>

          <div className="hidden md:flex md:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 justify-end items-center gap-x-6">
            <Link
              href="/login"
              className={`hidden md:block text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-gray-600 hover:text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Sign in
            </Link>
            <Button
              className={`transition-all ${
                isScrolled ? 'shadow-sm' : 'shadow-md'
              }`}
            >
              Get Started
            </Button>
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition-colors ${
                isScrolled ? 'text-gray-600' : 'text-gray-900'
              }`}
            >
              <span className="sr-only">Toggle menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
