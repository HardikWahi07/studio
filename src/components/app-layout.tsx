

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Menu,
  Briefcase,
  Users,
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
      className={cn("text-sm font-medium transition-colors hover:text-white", isActive ? "text-white" : "text-white/70", className)}
    >
      {children}
    </Link>
  )
}

function TravelToolsDropdown() {
  const pathname = usePathname();
  const isActive = travelTools.some(tool => tool.href === pathname);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("text-sm font-medium hover:text-white focus:ring-0", isActive ? "text-white" : "text-white/70")}>
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
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isHomePage && !isScrolled ? "bg-transparent text-white" : "bg-white/80 shadow-md backdrop-blur-sm text-black"
        )}>
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="mr-6 flex items-center gap-2">
             <Logo className={cn(isHomePage && !isScrolled ? "text-white" : "text-primary")} />
          </Link>
          <nav id="navLinks" className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
            <TravelToolsDropdown />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" className={cn("hidden sm:inline-flex", isHomePage && !isScrolled ? "hover:text-white hover:bg-white/10" : "hover:text-primary hover:bg-black/5")}>Login</Button>
            <Button className={cn(isHomePage && !isScrolled ? "bg-white text-black hover:bg-white/90" : "bg-primary hover:bg-primary/90 text-primary-foreground")}>Sign Up</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button id="hamburger" variant="outline" size="icon" className="md:hidden">
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
       <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-1">
              <Logo className="text-white" />
              <p className="text-sm text-gray-400 mt-4">
                The smartest, easiest way to explore the world. Your AI-powered travel planner to become a conscious traveler.
              </p>
            </div>
            <div>
              <h4 className="font-bold tracking-wider">Quick Links</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="/itinerary-planner" className="hover:text-white transition-colors">Plan a Trip</Link></li>
                <li><Link href="/local-artisans" className="hover:text-white transition-colors">Local Connect</Link></li>
                <li><Link href="/hidden-gems" className="hover:text-white transition-colors">Hidden Gems</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider">Company</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Work with Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider">Support</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            © 2024 TripMind. All rights reserved. Plan Smart. Travel Green.
          </div>
        </div>
      </footer>
    </div>
  )
}
