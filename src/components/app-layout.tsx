
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { useUser } from "@/firebase"
import { useTheme } from "next-themes";
import { useTranslations } from "@/hooks/use-translations"

import {
  Menu,
  Briefcase,
  Users,
  ChevronDown,
  Wand2,
  Globe,
  CircleDollarSign,
  LifeBuoy,
  HelpCircle,
  Mail,
  User,
  LogIn,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AuthButton } from "./auth-button"
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { AuthDialog } from "./auth-dialog"
import { ScrollArea } from "./ui/scroll-area"
import { HelpChatbox } from "./help-chatbox"


const languages = [
    { "code": "en", "label": "English" },
    { "code": "es", "label": "Español" },
    { "code": "fr", "label": "Français" },
    { "code": "de", "label": "Deutsch" },
    { "code": "hi", "label": "हिन्दी" },
    { "code": "ur", "label": "اردو" },
    { "code": "ar", "label": "العربية" },
    { "code": "bn", "label": "বাংলা" },
    { "code": "pa", "label": "ਪੰਜਾਬੀ" },
    { "code": "pt", "label": "Português" },
    { "code": "ru", "label": "Русский" },
    { "code": "zh", "label": "中文" },
    { "code": "ta", "label": "தமிழ்" },
    { "code": "te", "label": "తెలుగు" },
    { "code": "mr", "label": "मराठी" }
];

const currencies = [
    { code: "USD", label: "USD ($)" },
    { code: "EUR", label: "EUR (€)" },
    { code: "GBP", label: "GBP (£)" },
    { code: "JPY", label: "JPY (¥)" },
    { code: "AUD", label: "AUD (A$)" },
    { code: "CAD", label: "CAD (C$)" },
    { code: "CHF", label: "CHF (Fr)" },
    { code: "CNY", label: "CNY (¥)" },
    { code: "INR", label: "INR (₹)" },
    { code: "RUB", label: "RUB (₽)" },
    { code: "AED", label: "AED (د.إ)" },
    { code: "AFN", label: "AFN (؋)" },
    { code: "ALL", label: "ALL (L)" },
    { code: "AMD", label: "AMD (֏)" },
    { code: "ANG", label: "ANG (ƒ)" },
    { code: "AOA", label: "AOA (Kz)" },
    { code: "ARS", label: "ARS ($)" },
    { code: "AWG", label: "AWG (ƒ)" },
    { code: "AZN", label: "AZN (₼)" },
    { code: "BAM", label: "BAM (KM)" },
    { code: "BBD", label: "BBD ($)" },
    { code: "BDT", label: "BDT (৳)" },
    { code: "BGN", label: "BGN (лв)" },
    { code: "BHD", label: "BHD (.د.ب)" },
    { code: "BIF", label: "BIF (FBu)" },
    { code: "BMD", label: "BMD ($)" },
    { code: "BND", label: "BND ($)" },
    { code: "BOB", label: "BOB (Bs.)" },
    { code: "BRL", label: "BRL (R$)" },
    { code: "BSD", label: "BSD ($)" },
    { code: "BTN", label: "BTN (Nu.)" },
    { code: "BWP", label: "BWP (P)" },
    { code: "BYN", label: "BYN (Br)" },
    { code: "BZD", label: "BZD (BZ$)" },
    { code: "CDF", label: "CDF (FC)" },
    { code: "CLP", label: "CLP ($)" },
    { code: "COP", label: "COP ($)" },
    { code: "CRC", label: "CRC (₡)" },
    { code: "CUP", label: "CUP (₱)" },
    { code: "CVE", label: "CVE ($)" },
    { code: "CZK", label: "CZK (Kč)" },
    { code: "DJF", label: "DJF (Fdj)" },
    { code: "DKK", label: "DKK (kr)" },
    { code: "DOP", label: "DOP (RD$)" },
    { code: "DZD", label: "DZD (د.ج)" },
    { code: "EGP", label: "EGP (£)" },
    { code: "ERN", label: "ERN (Nfk)" },
    { code: "ETB", label: "ETB (Br)" },
    { code: "FJD", label: "FJD ($)" },
    { code: "FKP", label: "FKP (£)" },
    { code: "GEL", label: "GEL (₾)" },
    { code: "GHS", label: "GHS (GH¢)" },
    { code: "GIP", label: "GIP (£)" },
    { code: "GMD", label: "GMD (D)" },
    { code: "GNF", label: "GNF (FG)" },
    { code: "GTQ", label: "GTQ (Q)" },
    { code: "GYD", label: "GYD ($)" },
    { code: "HKD", label: "HKD (HK$)" },
    { code: "HNL", label: "HNL (L)" },
    { code: "HRK", label: "HRK (kn)" },
    { code: "HTG", label: "HTG (G)" },
    { code: "HUF", label: "HUF (Ft)" },
    { code: "IDR", label: "IDR (Rp)" },
    { code: "ILS", label: "ILS (₪)" },
    { code: "IQD", label: "IQD (ع.د)" },
    { code: "IRR", label: "IRR (﷼)" },
    { code: "ISK", label: "ISK (kr)" },
    { code: "JMD", label: "JMD (J$)" },
    { code: "JOD", label: "JOD (JD)" },
    { code: "KES", label: "KES (KSh)" },
    { code: "KGS", label: "KGS (лв)" },
    { code: "KHR", label: "KHR (៛)" },
    { code: "KMF", label: "KMF (CF)" },
    { code: "KPW", label: "KPW (₩)" },
    { code: "KRW", label: "KRW (₩)" },
    { code: "KWD", label: "KWD (KD)" },
    { code: "KYD", label: "KYD ($)" },
    { code: "KZT", label: "KZT (₸)" },
    { code: "LAK", label: "LAK (₭)" },
    { code: "LBP", label: "LBP (£)" },
    { code: "LKR", label: "LKR (රු)" },
    { code: "LRD", label: "LRD ($)" },
    { code: "LSL", label: "LSL (L)" },
    { code: "LYD", label: "LYD (LD)" },
    { code: "MAD", label: "MAD (MAD)" },
    { code: "MDL", label: "MDL (L)" },
    { code: "MGA", label: "MGA (Ar)" },
    { code: "MKD", label: "MKD (ден)" },
    { code: "MMK", label: "MMK (K)" },
    { code: "MNT", label: "MNT (₮)" },
    { code: "MOP", label: "MOP (MOP$)" },
    { code: "MRU", label: "MRU (UM)" },
    { code: "MUR", label: "MUR (₨)" },
    { code: "MVR", label: "MVR (.ރ)" },
    { code: "MWK", label: "MWK (MK)" },
    { code: "MXN", label: "MXN ($)" },
    { code: "MYR", label: "MYR (RM)" },
    { code: "MZN", label: "MZN (MT)" },
    { code: "NAD", label: "NAD ($)" },
    { code: "NGN", label: "NGN (₦)" },
    { code: "NIO", label: "NIO (C$)" },
    { code: "NOK", label: "NOK (kr)" },
    { code: "NPR", label: "NPR (₨)" },
    { code: "NZD", label: "NZD ($)" },
    { code: "OMR", label: "OMR (﷼)" },
    { code: "PAB", label: "PAB (B/.)" },
    { code: "PEN", label: "PEN (S/)" },
    { code: "PGK", label: "PGK (K)" },
    { code: "PHP", label: "PHP (₱)" },
    { code: "PKR", label: "PKR (₨)" },
    { code: "PLN", label: "PLN (zł)" },
    { code: "PYG", label: "PYG (₲)" },
    { code: "QAR", label: "QAR (﷼)" },
    { code: "RON", label: "RON (lei)" },
    { code: "RSD", label: "RSD (дин)" },
    { code: "RWF", label: "RWF (R₣)" },
    { code: "SAR", label: "SAR (﷼)" },
    { code: "SBD", label: "SBD ($)" },
    { code: "SCR", label: "SCR (₨)" },
    { code: "SDG", label: "SDG (ج.س.)" },
    { code: "SEK", label: "SEK (kr)" },
    { code: "SGD", label: "SGD ($)" },
    { code: "SHP", label: "SHP (£)" },
    { code: "SLL", label: "SLL (Le)" },
    { code: "SOS", label: "SOS (S)" },
    { code: "SRD", label: "SRD ($)" },
    { code: "SSP", label: "SSP (£)" },
    { code: "STN", label: "STN (Db)" },
    { code: "SYP", label: "SYP (£)" },
    { code: "SZL", label: "SZL (L)" },
    { code: "THB", label: "THB (฿)" },
    { code: "TJS", label: "TJS (SM)" },
    { code: "TMT", label: "TMT (T)" },
    { code: "TND", label: "TND (DT)" },
    { code: "TOP", label: "TOP (T$)" },
    { code: "TRY", label: "TRY (₺)" },
    { code: "TTD", label: "TTD (TT$)" },
    { code: "TWD", label: "TWD (NT$)" },
    { code: "TZS", label: "TZS (TSh)" },
    { code: "UAH", label: "UAH (₴)" },
    { code: "UGX", label: "UGX (USh)" },
    { code: "UYU", label: "UYU ($U)" },
    { code: "UZS", label: "UZS (so'm)" },
    { code: "VES", label: "VES (Bs.)" },
    { code: "VND", label: "VND (₫)" },
    { code: "VUV", label: "VUV (VT)" },
    { code: "WST", label: "WST (WS$)" },
    { code: "XAF", label: "XAF (FCFA)" },
    { code: "XCD", label: "XCD ($)" },
    { code: "XOF", label: "XOF (CFA)" },
    { code: "XPF", label: "XPF (₣)" },
    { code: "YER", label: "YER (﷼)" },
    { code: "ZAR", label: "ZAR (R)" },
    { code: "ZMW", label: "ZMW (ZK)" },
];


function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en';
  const fullHref = `/${locale}${href === '/' ? '' : href}`;
  
  // More robust active check: handles home page and sub-pages
  const isActive = (pathname === fullHref) || (href !== '/' && pathname.startsWith(fullHref));

  const { isScrolled, isHomePage } = useScrollState();
  const { theme } = useTheme();

  const linkColorClass = isHomePage && !isScrolled && theme === 'dark' ? "text-white" : "text-foreground";

  return (
    <Link
      href={fullHref}
      className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary font-semibold" : linkColorClass, className)}
    >
      {children}
    </Link>
  )
}

function TravelToolsDropdown({ onHelpClick }: { onHelpClick: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { isScrolled, isHomePage } = useScrollState();
  const { theme } = useTheme();
  
  const linkColorClass = isHomePage && !isScrolled && theme === 'dark' ? 'text-white hover:bg-white/10 hover:text-white' : 'text-foreground hover:bg-accent hover:text-accent-foreground';

  const travelTools = [
    { href: "/expenses", icon: Users, label: t('AppLayout.expenseSplitter') },
    { href: "/safety", icon: LifeBuoy, label: t('AppLayout.safety') },
  ];
  const supportLinks = [
      { key: 'help', onClick: onHelpClick, icon: HelpCircle, label: t('AppLayout.helpCenter') },
      { key: 'contact', href: "mailto:support@tripmind.com", icon: Mail, label: t('AppLayout.contactUs') },
  ]
  const isActive = travelTools.some(tool => pathname.endsWith(tool.href));
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("text-sm font-medium focus:ring-0 focus-visible:ring-0", isActive ? "text-primary font-semibold" : '', linkColorClass, isHomePage && !isScrolled && theme === 'dark' ? 'hover:bg-white/10' : '')}>
          {t('AppLayout.travelTools')}
          <ChevronDown className="w-4 h-4 ml-1"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {travelTools.map(tool => (
          <DropdownMenuItem key={tool.label} asChild>
            <Link href={`/${locale}${tool.href}`} className="flex items-center gap-2">
              <tool.icon className="w-4 h-4"/>
              {tool.label}
            </Link>
          </DropdownMenuItem>
        ))}
         <DropdownMenuSeparator />
          {supportLinks.map(link => (
            <DropdownMenuItem key={link.key} asChild>
                {link.href ? (
                    <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                        <link.icon className="w-4 h-4"/>
                        {link.label}
                    </Link>
                ) : (
                    <div onClick={link.onClick} className="flex items-center gap-2 cursor-pointer">
                        <link.icon className="w-4 h-4"/>
                        {link.label}
                    </div>
                )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useScrollState() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const locale = pathname.split('/')[1] || 'en';
  const isHomePage = pathname === `/${locale}` || pathname === '/';

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
  }, [pathname, isHomePage]);

  return { isScrolled, isHomePage };
}

function LanguageSelector() {
    const { isScrolled, isHomePage } = useScrollState();
    const { theme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const buttonColorClass = isHomePage && !isScrolled && theme === 'dark' ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';
    const locales = languages.map(l => l.code);
    
    const handleLanguageChange = (langCode: string) => {
      const pathSegments = pathname.split('/');
      // Pathname might be /en/about or just /about, we want to replace the locale part
      const newPath = pathSegments.length > 2 && locales.includes(pathSegments[1]) ? `/${langCode}/${pathSegments.slice(2).join('/')}` : `/${langCode}`;
      router.push(newPath);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('hidden sm:inline-flex', buttonColorClass)}>
                    <Globe />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-96 overflow-y-auto">
                {languages.map(lang => (
                    <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)}>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CurrencySelector() {
    const { isScrolled, isHomePage } = useScrollState();
    const { theme } = useTheme();
    const { setCurrency } = useSettings();
    const buttonColorClass = isHomePage && !isScrolled && theme === 'dark' ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn('hidden sm:inline-flex', buttonColorClass)}>
                    <CircleDollarSign />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-96 overflow-y-auto">
                {currencies.map(currency => (
                    <DropdownMenuItem key={currency.code} onSelect={() => setCurrency(currency.code)}>
                        {currency.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { user, isUserLoading } = useUser();
  const { isScrolled, isHomePage } = useScrollState();
  const { theme } = useTheme();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [isHelpChatOpen, setIsHelpChatOpen] = React.useState(false);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const loggedInNavItems = [
    { href: "/", label: t('AppLayout.home') },
    { href: "/my-trips", label: t('AppLayout.myTrips') },
    { href: "/trip-planner", label: t('AppLayout.aiTripPlanner') },
    { href: "/itinerary-planner", label: t('AppLayout.aiItineraryGenerator') },
    { href: "/suggest-bookings", label: t('AppLayout.suggestBookings') },
    { href: "/booking", label: t('AppLayout.booking') },
    { href: "/blog", label: t('AppLayout.blog') },
    { href: "/about", label: t('AppLayout.about') },
    { href: "/local-artisans", label: t('AppLayout.localConnect') },
    { href: "/hidden-gems", label: t('AppLayout.hiddenGems') },
  ];
  
  const loggedOutNavItems = [
    { href: "/", label: t('AppLayout.home') },
    { href: "/about", label: t('AppLayout.about') },
    { href: "/blog", label: t('AppLayout.blog') },
    { href: "/trip-planner", label: t('AppLayout.aiTripPlanner') },
    { href: "/itinerary-planner", label: t('AppLayout.aiItineraryGenerator') },
    { href: "/suggest-bookings", label: t('AppLayout.suggestBookings') },
  ];

  const navItems = user ? loggedInNavItems : loggedOutNavItems;
  const allNavItems = user ? [...loggedInNavItems, ...[
      { href: "/expenses", label: t('AppLayout.expenseSplitter') },
      { href: "/safety", label: t('AppLayout.safety') },
      { key: 'help', onClick: () => setIsHelpChatOpen(true), label: t('AppLayout.helpCenter') },
      { key: 'contact', href: 'mailto:support@tripmind.com', label: t('AppLayout.contactUs') },
    ]] : [...loggedOutNavItems, ...[
      { key: 'help', onClick: () => setIsHelpChatOpen(true), label: t('AppLayout.helpCenter') },
      { key: 'contact', href: 'mailto:support@tripmind.com', label: t('AppLayout.contactUs') },
    ]];

  const footerQuickLinks = [
    { key: "plan", href: "/trip-planner", label: t('AppLayout.planTrip') },
    { key: "connect", href: "/local-artisans", label: t('AppLayout.localConnect') },
    { key: "gems", href: "/hidden-gems", label: t('AppLayout.hiddenGems') },
  ];

  const footerCompanyLinks = [
    { key: "about", href: "/about", label: t('AppLayout.aboutUs') },
    { key: "blog", href: "/blog", label: t('AppLayout.blog') },
    { key: "work", href: "#", label: t('AppLayout.workWithUs') },
  ];

  const footerSupportLinks = [
    { key: "help", onClick: () => setIsHelpChatOpen(true), label: t('AppLayout.helpCenter') },
    { key: "faq", href: "#", label: t('AppLayout.faq') },
    { key: "contact", href: "mailto:support@tripmind.com", label: t('AppLayout.contactUs') },
    { key: "tos", href: "#", label: t('AppLayout.termsOfService') },
  ];

  const logoColor = isHomePage && !isScrolled && isMounted && theme === 'dark' ? 'text-white' : 'text-primary';
  const hamburgerClasses = cn(
      "lg:hidden",
      isMounted && isHomePage && !isScrolled 
        ? (theme === 'dark' ? 'border-gray-400 text-white hover:bg-white/20 hover:text-white' : 'border-gray-400 text-foreground hover:bg-accent hover:text-accent-foreground') 
        : ''
    );

  return (
    <div className="flex min-h-screen flex-col">
       <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-background/80 shadow-md backdrop-blur-sm border-b" : "bg-transparent"
        )}>
        <div className="container mx-auto flex h-16 items-center px-4">
            <Link href={`/${locale}`} className="mr-6 flex items-center gap-2">
              <Logo className={logoColor} />
            </Link>
          {isMounted && !isUserLoading && (
            <nav id="navLinks" className="hidden items-center gap-4 lg:flex">
              {navItems.map((item) => (
                <NavLink key={item.label} href={item.href}>{item.label}</NavLink>
              ))}
              {user && <TravelToolsDropdown onHelpClick={() => setIsHelpChatOpen(true)} />}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-1">
             {isMounted ? (
              <>
                <ThemeToggle className={cn(isHomePage && !isScrolled && theme === 'dark' ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground')} />
                <LanguageSelector />
                <CurrencySelector />
                <AuthButton isScrolled={isScrolled} isHomePage={isHomePage} />
              </>
             ) : (
              <div className="h-10 w-[140px]" /> 
             )}
            <Sheet>
              <SheetTrigger asChild>
                <Button id="hamburger" variant="outline" size="icon" className={hamburgerClasses}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('AppLayout.toggleNavigation')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <ScrollArea className="flex-1">
                  {isMounted && !isUserLoading && (
                    <nav className="grid gap-6 text-lg font-medium mt-8 pr-6">
                      {user ? (
                          <div className="flex items-center gap-4 px-2.5 text-muted-foreground">
                              <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                  <AvatarFallback><User /></AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col space-y-1">
                                  <p className="text-sm font-medium leading-none text-foreground">{user.displayName}</p>
                                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                              </div>
                          </div>
                      ) : (
                        <Button onClick={() => setIsAuthDialogOpen(true)} className="flex items-center gap-4 justify-start" variant="outline">
                           <LogIn />
                           {t('AuthButton.login')}
                        </Button>
                      )}
                      <DropdownMenuSeparator />
                      {allNavItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href === '#' ? '#' : `/${locale}${item.href}`}
                          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                          onClick={item.onClick}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  )}
                </ScrollArea>
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
                {t('AppLayout.footerDescription')}
              </p>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('AppLayout.quickLinks')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                {footerQuickLinks.map(link => (
                    <li key={link.key}><Link href={`/${locale}${link.href}`} className="hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('AppLayout.company')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                {footerCompanyLinks.map(link => (
                    <li key={link.key}><Link href={link.href === '#' ? '#' : `/${locale}${link.href}`} className="hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('AppLayout.support')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                {footerSupportLinks.map(link => (
                    <li key={link.key}>
                        <a onClick={link.onClick} href={link.href} className="hover:text-white transition-colors cursor-pointer">{link.label}</a>
                    </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            {t('AppLayout.copyright')}
          </div>
        </div>
      </footer>
       {isMounted && (
        <Button
          onClick={() => setIsHelpChatOpen(true)}
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          aria-label="Open help chat"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
       )}
      <HelpChatbox isOpen={isHelpChatOpen} onOpenChange={setIsHelpChatOpen} />
    </div>
  )
}

