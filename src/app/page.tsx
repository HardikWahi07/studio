
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Shield,
  Leaf,
  MapPin,
  Globe,
  Wallet,
} from 'lucide-react';
import { HeroVideo } from '@/components/hero-video';

const features = [
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: 'AI Trip Planner',
    description:
      'Smart itineraries tailored to your preferences, budget, and travel style.',
    link: '/itinerary-planner',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Local Connect',
    description:
      'Discover authentic experiences from local artisans and guides.',
    link: '/local-artisans',
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: 'Hidden Gems',
    description:
      'Uncover secret spots and off-the-beaten-path destinations.',
    link: '/hidden-gems',
  },
];

const moreFeatures = [
  {
    icon: <Wallet className="h-6 w-6 text-primary" />,
    title: 'Expense Splitter',
    description: 'Track and split trip costs',
    link: '/expenses',
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: 'Safety Dashboard',
    description: 'Emergency contacts & alerts',
    link: '/safety',
  },
  {
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: 'Eco Score',
    description: 'Track your green impact',
    link: '/transport',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative w-full h-screen text-white">
          <HeroVideo />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              The Smarter, Greener, <br /> Easier Way to Explore
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              Your AI-powered travel partner for discovering hidden gems, booking
              eco-friendly transport, and creating unforgettable, sustainable
              journeys.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                <Link href="/itinerary-planner">Start Planning Your Trip</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto features-header">
              <h2 className="text-3xl md:text-4xl font-bold">
                Everything You Need for the Perfect Trip
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Our AI-powered tools make travel planning seamless, sustainable,
                and exciting.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <div key={feature.title} className="text-center feature-card" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {feature.description}
                  </p>
                  <Button variant="link" asChild className="mt-2 text-primary">
                     <Link href={feature.link}>Learn More</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
