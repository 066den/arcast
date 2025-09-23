'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { adminNavigation } from '@/lib/config'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader className="items-center">
        <Link href="/">
          <Image
            src="/icons/logo-dark.svg"
            alt={siteConfig.name}
            width={140}
            height={40}
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.href === pathname}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
