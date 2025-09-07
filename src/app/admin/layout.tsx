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
          <Button asChild variant="outline" className="mr-4">
            <Link href="/" target="_blank">
              Visit Site <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Button>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
