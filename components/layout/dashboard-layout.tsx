"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"
import { User, Home, CreditCard, RefreshCw, Wrench, Phone, LogOut, Bell, Search, Settings } from "lucide-react"

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User, href: "/" },
  { id: "properties", label: "Properties", icon: Home, href: "/properties" },
  { id: "payments", label: "Payments", icon: CreditCard, href: "/payments" },
  { id: "refunds", label: "Refunds", icon: RefreshCw, href: "/refunds" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, href: "/maintenance" },
  { id: "emergency", label: "Emergency", icon: Phone, href: "/emergency" },
]

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-white/20">
        {/* User Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative">
            <p className="text-blue-100 text-xs font-medium mb-1">Welcome back,</p>
            <p className="text-white font-bold text-sm">Ravishanker</p>
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
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} className="flex items-center gap-3">
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
            <SidebarMenuButton className="text-red-500 hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Modern Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="text-white font-bold text-xs md:text-sm">A</div>
                    </div>
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
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10">
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
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10">
                  <Settings className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 md:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
