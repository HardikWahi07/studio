
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Menu,
  Briefcase,
  Users,
  Map,
  Sparkles,
  Plane,
  ChevronDown
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/itinerary-planner", label: "AI Trip Planner" },
  { href: "/transport", label: "Booking" },
  { href: "/local-artisans", label: "Local Connect" },
  { href: "/hidden-gems", label: "Hidden Gems" },
];

const travelTools = [
  { href: "/expenses", icon: Users, label: "Expense Splitter" },
  { href: "/safety", icon: Plane, label: "Safety Companion" },
  { href: "/transport", icon: Briefcase, label: "Smart Transport" },
]


function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-foreground/60", className)}
    >
      {children}
    </Link>
  )
}

function TravelToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium text-foreground/60 hover:text-primary focus:ring-0">
          Travel Tools
          <ChevronDown className="w-4 h-4 ml-1"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {travelTools.map(tool => (
          <DropdownMenuItem key={tool.href} asChild>
            <Link href={tool.href} className="flex items-center gap-2">
              <tool.icon className="w-4 h-4"/>
              {tool.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-white/80 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="mr-6 flex items-center gap-2">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
            <TravelToolsDropdown />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost">Login</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  {[...navItems, ...travelTools].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
            <div className="grid gap-8 md:grid-cols-4">
                <div>
                    <Logo className="text-white"/>
                    <p className="text-sm text-primary-foreground/80 mt-2">The smartest, easiest way to explore this world. All-powered travel palnner easy to be a conscious travelers.</p>
                </div>
                <div>
                    <h4 className="font-bold">Quick Links</h4>
                    <ul className="space-y-2 mt-2 text-sm text-primary-foreground/80">
                        <li><Link href="#" className="hover:underline">Plan Trip</Link></li>
                        <li><Link href="#" className="hover:underline">About Us</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold">Best in Search</h4>
                    <ul className="space-y-2 mt-2 text-sm text-primary-foreground/80">
                        <li><Link href="#" className="hover:underline">Work with us: for travelers</Link></li>
                        <li><Link href="#" className="hover:underline">Blog</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold">Contact Us</h4>
                     <ul className="space-y-2 mt-2 text-sm text-primary-foreground/80">
                        <li><Link href="#" className="hover:underline">support@tripmind.com</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
                © 2024 TripMind. All rights reserved. Plan Smart. Travel Green.
            </div>
        </div>
      </footer>
    </div>
  )
}
