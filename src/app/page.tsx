

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Shield,
  Leaf,
  MapPin,
  Globe,
  Wallet,
  Sparkles,
  Star,
  BookOpen,
} from 'lucide-react';
import { PexelsImage } from '@/components/pexels-image';
import { destinations } from '@/lib/destinations';
import { Card, CardContent } from '@/components/ui/card';
import { HeroVideo } from '@/components/hero-video';
import { Badge } from '@/components/ui/badge';
import { DestinationCard } from '@/components/destination-card';

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

const stories = [
    {
        id: 'story-solo',
        title: '10 Essential Tips for Solo Travelers',
        description: 'A guide to staying safe and sane on your solo adventures.',
        readTime: '4 min read',
        imageHint: 'solo traveler'
    },
    {
        id: 'story-budget',
        title: 'How I Traveled Southeast Asia on a Budget',
        description: 'My journey through Vietnam, Cambodia and beyond for under $1,000.',
        readTime: '6 min read',
        imageHint: 'asia market'
    },
    {
        id: 'story-cafes',
        title: 'Hidden Cafes in European Cities',
        description: 'Espresso-hunting in the quiet, cozy corners of the continent.',
        readTime: '5 min read',
        imageHint: 'european cafe'
    }
]

const moreFeatures = [
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: 'Expense Splitter',
    description: 'Track and split trip costs',
    link: '/expenses',
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: 'Safety Dashboard',
    description: 'Emergency contacts & alerts',
    link: '/safety',
  },
  {
    icon: <Leaf className="h-8 w-8 text-primary" />,
    title: 'Eco Score',
    description: 'Track your green impact',
    link: '/transport',
  },
];

export default function DashboardPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative w-full min-h-screen text-white flex items-center justify-center">
          <HeroVideo />
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
            <div className='flex items-center gap-2 mb-4'>
                <Sparkles className='w-5 h-5 text-white' />
                <p className='font-bold text-white tracking-widest'>AI-POWERED TRAVEL ASSISTANT</p>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              Plan Smart. <span className='text-primary'>Travel Green.</span><br/> Enjoy More.
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl text-gray-200">
              Your intelligent travel companion that helps you discover hidden gems, book eco-friendly transport, and create unforgettable experiences—all while keeping your carbon footprint low.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full">
                <Link href="/itinerary-planner">Start Planning</Link>
              </Button>
               <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 rounded-full">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
             <div className="mt-8 flex gap-4">
                 <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary"/>AI-Powered</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Leaf className="w-4 h-4 mr-2 text-primary"/>Green & Intuitive</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Users className="w-4 h-4 mr-2 text-primary"/>User-Friendly</div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto features-header">
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                Everything You Need for the <span className='text-primary'>Perfect Trip</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Powerful features designed to make your travel planning seamless and sustainable.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Card key={feature.title} className="text-center p-8 feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">
                        {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                        {feature.description}
                    </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                Top Destinations This Month <Globe className="inline-block h-10 w-10 text-primary" />
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Explore the most popular destinations trending among travelers worldwide.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {destinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold font-headline">
                    Local Stories & Travel Tips
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                    Get inspired by real travelers and learn from their experiences.
                </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                {stories.map(story => {
                    return (
                    <Card key={story.id} className="overflow-hidden group">
                        <div className="aspect-video w-full overflow-hidden">
                        <PexelsImage query={story.imageHint} alt={story.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        </div>
                        <CardContent className="p-6">
                        <h3 className="font-bold text-lg">{story.title}</h3>
                        <p className="text-muted-foreground text-sm mt-2">{story.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-4">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>{story.readTime}</span>
                        </div>
                        </CardContent>
                    </Card>
                    )
                })}
                </div>
            </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className="text-center max-w-3xl mx-auto features-header">
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">
                        More Features
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Everything you need for a perfect trip.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {moreFeatures.map(feature => (
                        <Card key={feature.title} className="text-center p-8 feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground mt-2">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
