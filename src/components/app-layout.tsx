"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Home,
  Map,
  Sparkles,
  Train,
  Briefcase,
  Users,
  Shield,
  Menu,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/itinerary-planner", icon: Map, label: "Itinerary Planner" },
  { href: "/hidden-gems", icon: Sparkles, label: "Hidden Gems" },
  { href: "/transport", icon: Train, label: "Smart Transport" },
  { href: "/local-artisans", icon: Briefcase, label: "Local Artisans" },
  { href: "/expenses", icon: Users, label: "Expense Splitter" },
  { href: "/safety", icon: Shield, label: "Safety Companion" },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar
          variant="sidebar"
          collapsible={isMobile ? "offcanvas" : "icon"}
        >
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background min-h-screen">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
            <SidebarTrigger className="md:hidden">
              <Menu />
            </SidebarTrigger>
            {/* Can add user profile button here */}
          </header>
          {children}
          </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
