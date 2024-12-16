'use client'

import { useState } from 'react'
import { MainNav } from '@/components/navigation/main-nav'
import { Header } from '@/components/navigation/header'
import { MobileNav } from '@/components/navigation/mobile-nav'
import { Breadcrumbs } from '@/components/navigation/breadcrumbs'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Navigation
              </h2>
              <MainNav />
            </div>
          </div>
        </aside>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="container">
            <div className="flex-1 space-y-4 p-8 pt-6">
              <Breadcrumbs />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}