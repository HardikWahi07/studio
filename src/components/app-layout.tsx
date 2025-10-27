
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Menu,
  Briefcase,
  Users,
  Plane,
  ChevronDown,
  User
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
import { LoadingScreen } from "@/components/ui/loading-screen"

const navItems = [
  { href: "/", label: "Home" },
  { href: "#", label: "About" },
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

  const { isScrolled, isHomePage } = useScrollState();
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-gray-700";

  return (
    <Link
      href={href}
      className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary font-semibold" : linkColorClass, className)}
    >
      {children}
    </Link>
  )
}

function TravelToolsDropdown() {
  const pathname = usePathname();
  const isActive = travelTools.some(tool => tool.href === pathname);
  const { isScrolled, isHomePage } = useScrollState();
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-gray-700";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("text-sm font-medium hover:text-primary focus:ring-0 focus-visible:ring-0", isActive ? "text-primary font-semibold" : linkColorClass)}>
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

function useScrollState() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = React.useState(!isHomePage);

  React.useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, pathname]);

  return { isScrolled, isHomePage };
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isScrolled, isHomePage } = useScrollState();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(pathname === '/');

  const handleVideoLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const childrenWithProps = React.useMemo(() => 
    React.Children.map(children, child => {
      if (React.isValidElement(child) && isHomePage) {
        // @ts-ignore
        return React.cloneElement(child, { onVideoLoad: handleVideoLoad });
      }
      return child;
    }), [children, isHomePage, handleVideoLoad]);

  return (
    <div className="flex min-h-screen flex-col">
       {isLoading && isHomePage && <LoadingScreen />}
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-white/80 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="mr-6 flex items-center gap-2">
             <Logo className={cn(isHomePage && !isScrolled ? 'text-white' : 'text-primary')} />
          </Link>
          <nav id="navLinks" className="hidden items-center gap-4 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
            <TravelToolsDropdown />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" className={cn("hidden sm:inline-flex items-center gap-2 hover:bg-black/5", isHomePage && !isScrolled ? 'text-white hover:text-white' : 'text-gray-700 hover:text-primary')}>
                <User className="w-4 h-4" /> Login
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">Sign Up</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button id="hamburger" variant="outline" size="icon" className={cn("lg:hidden", isHomePage && !isScrolled ? 'border-gray-400 text-white hover:bg-white/20 hover:text-white' : '')}>
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
      <main className="flex-1">{childrenWithProps}</main>
       <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-1">
              <Logo className="text-white" />
              <p className="text-sm text-gray-400 mt-4">
                The smartest, easiest way to explore the world. Your AI-powered travel planner to become a conscious traveler.
              </p>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">Quick Links</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="/itinerary-planner" className="hover:text-white transition-colors">Plan a Trip</Link></li>
                <li><Link href="/local-artisans" className="hover:text-white transition-colors">Local Connect</Link></li>
                <li><Link href="/hidden-gems" className="hover:text-white transition-colors">Hidden Gems</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">Company</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Work with Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">Support</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            © 2024 TripMind. All rights reserved. Plan Smart. Travel Green.
          </div>
        </div>
      </footer>
    </div>
  )
}
