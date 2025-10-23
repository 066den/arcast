import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import AppSidebar from '@/components/admin/AppSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Skip auth check for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const session = await auth()

  // If user is not authenticated, redirect to login
  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AdminHeader user={session.user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
