'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import { ArrowRightIcon, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: `${window.location.origin}/admin/login`,
      })
      toast.success('Successfully signed out')
    } catch (error) {
      toast.error('Error signing out')
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <SidebarTrigger />

      <div className="flex items-center gap-4">
        <Link href="/" target="_blank">
          <Button variant="ghost" size="sm">
            <span className="flex items-center gap-2">
              <span>Visit Site</span>
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
