"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Suspense } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Home, CreditCard, RefreshCw, Wrench, LogOut, Bell, Search, Settings, Users } from "lucide-react"
import Image from "next/image"

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User, href: "/dashboard" },
  { id: "properties", label: "Properties", icon: Home, href: "/dashboard/properties" },
  { id: "co-occupants", label: "Co-Occupants", icon: Users, href: "/dashboard/co-occupants" },
  { id: "payments", label: "Payments", icon: CreditCard, href: "/dashboard/payments" },
  { id: "refunds", label: "Refunds", icon: RefreshCw, href: "/dashboard/refunds" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, href: "/dashboard/maintenance" },
]

function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    // Close mobile sidebar when menu item is clicked
    setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-white/20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative">
            <p className="text-blue-100 text-xs font-medium mb-1">Welcome back,</p>
            <p className="text-white font-bold text-sm">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-12 text-base">
                      <Link href={item.href} className="flex items-center gap-3" onClick={handleMenuClick}>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-12">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden" />
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src="/al-raseen-app-logo.png"
                        alt="Alraseen Logo"
                        width={40}
                        height={40}
                        className="rounded-xl shadow-lg"
                      />
                      <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Alraseen
                      </h1>
                      <p className="text-xs text-gray-500 font-medium">Real Estate</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10"
                  >
                    <Search className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 relative h-8 w-8 md:h-10 md:w-10"
                  >
                    <Bell className="w-3 h-3 md:w-4 md:h-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10"
                  >
                    <Settings className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="p-4 md:p-8">{children}</main>
          </SidebarInset>
        </div>
      </Suspense>
    </SidebarProvider>
  )
}
