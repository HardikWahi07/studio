
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
  Wand2,
  Globe,
  CircleDollarSign,
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
import { AuthButton } from "./auth-button"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/trip-planner", label: "AI Trip Planner" },
  { href: "/transport", label: "Booking" },
  { href: "/local-artisans", label: "Local Connect" },
  { href: "/hidden-gems", label: "Hidden Gems" },
];

const travelTools = [
  { href: "/expenses", icon: Users, label: "Expense Splitter" },
  { href: "/safety", icon: Plane, label: "Safety Companion" },
  { href: "/transport", icon: Briefcase, label: "Smart Transport" },
  { href: "/itinerary-planner", icon: Wand2, label: "AI Itinerary Generator" },
]

const languages = [
    { "code": "af", "label": "Afrikaans" },
    { "code": "sq", "label": "Albanian" },
    { "code": "am", "label": "Amharic" },
    { "code": "ar", "label": "Arabic" },
    { "code": "hy", "label": "Armenian" },
    { "code": "az", "label": "Azerbaijani" },
    { "code": "eu", "label": "Basque" },
    { "code": "be", "label": "Belarusian" },
    { "code": "bn", "label": "Bengali" },
    { "code": "bs", "label": "Bosnian" },
    { "code": "bg", "label": "Bulgarian" },
    { "code": "ca", "label": "Catalan" },
    { "code": "ceb", "label": "Cebuano" },
    { "code": "ny", "label": "Chichewa" },
    { "code": "zh", "label": "Chinese (Simplified)" },
    { "code": "zh-TW", "label": "Chinese (Traditional)" },
    { "code": "co", "label": "Corsican" },
    { "code": "hr", "label": "Croatian" },
    { "code": "cs", "label": "Czech" },
    { "code": "da", "label": "Danish" },
    { "code": "nl", "label": "Dutch" },
    { "code": "en", "label": "English" },
    { "code": "eo", "label": "Esperanto" },
    { "code": "et", "label": "Estonian" },
    { "code": "tl", "label": "Filipino" },
    { "code": "fi", "label": "Finnish" },
    { "code": "fr", "label": "French" },
    { "code": "fy", "label": "Frisian" },
    { "code": "gl", "label": "Galician" },
    { "code": "ka", "label": "Georgian" },
    { "code": "de", "label": "German" },
    { "code": "el", "label": "Greek" },
    { "code": "gu", "label": "Gujarati" },
    { "code": "ht", "label": "Haitian Creole" },
    { "code": "ha", "label": "Hausa" },
    { "code": "haw", "label": "Hawaiian" },
    { "code": "iw", "label": "Hebrew" },
    { "code": "hi", "label": "Hindi" },
    { "code": "hmn", "label": "Hmong" },
    { "code": "hu", "label": "Hungarian" },
    { "code": "is", "label": "Icelandic" },
    { "code": "ig", "label": "Igbo" },
    { "code": "id", "label": "Indonesian" },
    { "code": "ga", "label": "Irish" },
    { "code": "it", "label": "Italian" },
    { "code": "ja", "label": "Japanese" },
    { "code": "jw", "label": "Javanese" },
    { "code": "kn", "label": "Kannada" },
    { "code": "kk", "label": "Kazakh" },
    { "code": "km", "label": "Khmer" },
    { "code": "rw", "label": "Kinyarwanda" },
    { "code": "ko", "label": "Korean" },
    { "code": "ku", "label": "Kurdish (Kurmanji)" },
    { "code": "ky", "label": "Kyrgyz" },
    { "code": "lo", "label": "Lao" },
    { "code": "la", "label": "Latin" },
    { "code": "lv", "label": "Latvian" },
    { "code": "lt", "label": "Lithuanian" },
    { "code": "lb", "label": "Luxembourgish" },
    { "code": "mk", "label": "Macedonian" },
    { "code": "mg", "label": "Malagasy" },
    { "code": "ms", "label": "Malay" },
    { "code": "ml", "label": "Malayalam" },
    { "code": "mt", "label": "Maltese" },
    { "code": "mi", "label": "Maori" },
    { "code": "mr", "label": "Marathi" },
    { "code": "mn", "label": "Mongolian" },
    { "code": "my", "label": "Myanmar (Burmese)" },
    { "code": "ne", "label": "Nepali" },
    { "code": "no", "label": "Norwegian" },
    { "code": "or", "label": "Odia (Oriya)" },
    { "code": "ps", "label": "Pashto" },
    { "code": "fa", "label": "Persian" },
    { "code": "pl", "label": "Polish" },
    { "code": "pt", "label": "Portuguese" },
    { "code": "pa", "label": "Punjabi" },
    { "code": "ro", "label": "Romanian" },
    { "code": "ru", "label": "Russian" },
    { "code": "sm", "label": "Samoan" },
    { "code": "gd", "label": "Scots Gaelic" },
    { "code": "sr", "label": "Serbian" },
    { "code": "st", "label": "Sesotho" },
    { "code": "sn", "label": "Shona" },
    { "code": "sd", "label": "Sindhi" },
    { "code": "si", "label": "Sinhala" },
    { "code": "sk", "label": "Slovak" },
    { "code": "sl", "label": "Slovenian" },
    { "code": "so", "label": "Somali" },
    { "code": "es", "label": "Spanish" },
    { "code": "su", "label": "Sundanese" },
    { "code": "sw", "label": "Swahili" },
    { "code": "sv", "label": "Swedish" },
    { "code": "tg", "label": "Tajik" },
    { "code": "ta", "label": "Tamil" },
    { "code": "tt", "label": "Tatar" },
    { "code": "te", "label": "Telugu" },
    { "code": "th", "label": "Thai" },
    { "code": "tr", "label": "Turkish" },
    { "code": "tk", "label": "Turkmen" },
    { "code": "uk", "label": "Ukrainian" },
    { "code": "ur", "label": "Urdu" },
    { "code": "ug", "label": "Uyghur" },
    { "code": "uz", "label": "Uzbek" },
    { "code": "vi", "label": "Vietnamese" },
    { "code": "cy", "label": "Welsh" },
    { "code": "xh", "label": "Xhosa" },
    { "code": "yi", "label": "Yiddish" },
    { "code": "yo", "label": "Yoruba" },
    { "code": "zu", "label": "Zulu" }
];

const currencies = [
    { code: "USD", label: "USD ($)" },
    { code: "EUR", label: "EUR (€)" },
    { code: "GBP", label: "GBP (£)" },
    { code: "INR", label: "INR (₹)" },
    { code: "JPY", label: "JPY (¥)" },
];


function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  const { isScrolled, isHomePage } = useScrollState();
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-foreground";

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
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-foreground";
  
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

function LanguageSelector() {
    const { isScrolled, isHomePage } = useScrollState();
    const buttonColorClass = isHomePage && !isScrolled ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';
    const [selectedLanguage, setSelectedLanguage] = React.useState(languages[0]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('hidden sm:inline-flex', buttonColorClass)}>
                    <Globe />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-96 overflow-y-auto">
                {languages.map(lang => (
                    <DropdownMenuItem key={lang.code} onSelect={() => setSelectedLanguage(lang)}>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CurrencySelector() {
    const { isScrolled, isHomePage } = useScrollState();
    const buttonColorClass = isHomePage && !isScrolled ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';
    const [selectedCurrency, setSelectedCurrency] = React.useState(currencies[0]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('hidden sm:inline-flex', buttonColorClass)}>
                    <CircleDollarSign />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {currencies.map(currency => (
                    <DropdownMenuItem key={currency.code} onSelect={() => setSelectedCurrency(currency)}>
                        {currency.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isScrolled, isHomePage } = useScrollState();

  return (
    <div className="flex min-h-screen flex-col">
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-background/80 shadow-md backdrop-blur-sm" : "bg-transparent"
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
            <LanguageSelector />
            <CurrencySelector />
            <AuthButton isScrolled={isScrolled} isHomePage={isHomePage} />
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
      <main className="flex-1">{children}</main>
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
                <li><Link href="/trip-planner" className="hover:text-white transition-colors">Plan a Trip</Link></li>
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
