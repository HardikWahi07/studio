
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import {
  Menu,
  Briefcase,
  Users,
  Plane,
  ChevronDown,
  Wand2,
  Globe,
  CircleDollarSign,
  Heart,
  Shield,
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

const languages = [
    { "code": "en", "label": "English" },
    { "code": "es", "label": "Español" },
    { "code": "fr", "label": "Français" },
    { "code": "de", "label": "Deutsch" },
    { "code": "hi", "label": "हिन्दी" },
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
  const locale = useLocale();
  const fullHref = `/${locale}${href === '/' ? '' : href}`;
  const isActive = pathname === fullHref;

  const { isScrolled, isHomePage } = useScrollState();
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-foreground";

  return (
    <Link
      href={fullHref}
      className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary font-semibold" : linkColorClass, className)}
    >
      {children}
    </Link>
  )
}

function TravelToolsDropdown() {
  const t = useTranslations('AppLayout');
  const locale = useLocale();
  const pathname = usePathname();
  const { isScrolled, isHomePage } = useScrollState();
  const linkColorClass = isHomePage && !isScrolled ? "text-white" : "text-foreground";

  const travelTools = [
    { href: "/expenses", icon: Users, label: t('expenseSplitter') },
    { href: "/local-supporters", icon: Shield, label: t('localSupporters') },
    { href: "/transport", icon: Briefcase, label: t('smartTransport') },
    { href: "/itinerary-planner", icon: Wand2, label: t('aiItineraryGenerator') },
  ];
  const isActive = travelTools.some(tool => pathname.endsWith(tool.href));
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("text-sm font-medium hover:text-primary focus:ring-0 focus-visible:ring-0", isActive ? "text-primary font-semibold" : linkColorClass)}>
          {t('travelTools')}
          <ChevronDown className="w-4 h-4 ml-1"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {travelTools.map(tool => (
          <DropdownMenuItem key={tool.href} asChild>
            <Link href={`/${locale}${tool.href}`} className="flex items-center gap-2">
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
  const isHomePage = pathname === '/' || (languages.some(lang => pathname === `/${lang.code}`));
  const [isScrolled, setIsScrolled] = React.useState(!isHomePage);

  React.useEffect(() => {
     const isHome = pathname === '/' || (languages.some(lang => pathname === `/${lang.code}`));
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return { isScrolled, isHomePage };
}

function LanguageSelector() {
    const { isScrolled, isHomePage } = useScrollState();
    const pathname = usePathname();
    const buttonColorClass = isHomePage && !isScrolled ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';
    
    const handleLanguageChange = (langCode: string) => {
      // a regex to replace the current locale in the path
      const newPath = pathname.replace(/^\/[a-z]{2}/, `/${langCode}`);
      window.location.href = newPath;
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
    const { setCurrency } = useSettings();
    const buttonColorClass = isHomePage && !isScrolled ? 'text-white hover:text-white hover:bg-white/10' : 'text-foreground';

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
  const { isScrolled, isHomePage } = useScrollState();
  const t = useTranslations('AppLayout');
  const locale = useLocale();

  const navItems = [
    { href: "/", label: t('home') },
    { href: "/my-trips", label: t('myTrips') },
    { href: "/about", label: t('about') },
    { href: "/trip-planner", label: t('aiTripPlanner') },
    { href: "/transport", label: t('booking') },
    { href: "/local-artisans", label: t('localConnect') },
    { href: "/hidden-gems", label: t('hiddenGems') },
  ];

  const allNavItems = [...navItems, ...[
      { href: "/expenses", label: t('expenseSplitter') },
      { href: "/local-supporters", label: t('localSupporters') },
      { href: "/transport", label: t('smartTransport') },
      { href: "/itinerary-planner", label: t('aiItineraryGenerator') }
    ]
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-background/80 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href={`/${locale}`} className="mr-6 flex items-center gap-2">
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
                  <span className="sr-only">{t('toggleNavigation')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  {allNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href}`}
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
                {t('footerDescription')}
              </p>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('quickLinks')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href={`/${locale}/trip-planner`} className="hover:text-white transition-colors">{t('planTrip')}</Link></li>
                <li><Link href={`/${locale}/local-artisans`} className="hover:text-white transition-colors">{t('localConnect')}</Link></li>
                <li><Link href={`/${locale}/hidden-gems`} className="hover:text-white transition-colors">{t('hiddenGems')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('company')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{t('aboutUs')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('blog')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('workWithUs')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold tracking-wider uppercase text-gray-400 text-sm">{t('support')}</h4>
              <ul className="space-y-2 mt-4 text-sm text-gray-300">
                <li><Link href={`/${locale}/local-supporters`} className="hover:text-white transition-colors">{t('localSupporters')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('faq')}</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">{t('termsOfService')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            {t('copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
