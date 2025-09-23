'use client'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import AppSidebar from '@/components/admin/AppSidebar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />

          <Link href="/" target="_blank">
            <span className="flex items-center gap-2">
              <span>Visit Site</span>
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Link>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
