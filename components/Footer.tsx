'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FooterProps {
  totalCoins?: number
}

export default function Footer({ totalCoins }: FooterProps) {
  const pathname = usePathname()
  
  if (pathname !== '/' && pathname !== '/game') {
    return null
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-4 border-t">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-sm">
          累計獲得金額: ${totalCoins}
        </div>
        <Link
          href="https://twitter.com/7DbpRihzKefprwx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M22.46 6.012c-.807.358-1.674.6-2.586.705a4.526 4.526 0 001.984-2.496 9.037 9.037 0 01-2.866 1.095 4.513 4.513 0 00-7.69 4.116 12.81 12.81 0 01-9.3-4.715 4.513 4.513 0 001.396 6.022 4.49 4.49 0 01-2.043-.564v.057a4.513 4.513 0 003.62 4.425 4.52 4.52 0 01-2.038.077 4.513 4.513 0 004.216 3.134 9.05 9.05 0 01-5.604 1.932c-.364 0-.724-.021-1.08-.063a12.773 12.773 0 006.92 2.03c8.3 0 12.84-6.876 12.84-12.84 0-.195-.004-.39-.013-.583a9.172 9.172 0 002.252-2.336z" />
          </svg>
        </Link>
      </div>
    </footer>
  )
}