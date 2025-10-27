
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Shield,
  Leaf,
  MapPin,
  Star,
  Globe,
  Sparkles,
  Heart,
  BrainCircuit,
  Building,
  Plane,
  Calendar,
  Wallet,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
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

const topDestinations = [
  {
    id: "dest-bali",
    name: "Bali, Indonesia",
    rating: 4.9,
    reviews: "2.4k reviews",
  },
  {
    id: "dest-osaka",
    name: "Osaka, Japan",
    rating: 4.8,
    reviews: "1.9k reviews",
  },
  {
    id: "dest-hallstatt",
    name: "Hallstatt, Austria",
    rating: 4.7,
    reviews: "1.6k reviews",
  },
    {
    id: "dest-seoul",
    name: "Seoul, Korea",
    rating: 4.8,
    reviews: "2.1k reviews",
  },
]

const aiPicks = [
    {
        id: "ai-alps",
        title: "Swiss Alps Adventure",
        duration: "5 Days",
        perfectFor: "breathtaking views and hikes",
        price: "1,250,000",
    },
    {
        id: "ai-tropical",
        title: "Tropical Paradise",
        duration: "7 Days",
        perfectFor: "relaxation & beach activities",
        price: "1,120,000",
    },
    {
        id: "ai-cultural",
        title: "Cultural Experience",
        duration: "10 Days",
        perfectFor: "history and cultural immersion",
        price: "2,010,000",
    }
]

const localStories = [
    {
        id: "story-solo",
        title: "10 Essential Tips for Solo Travelers",
        description: "A piece of tips for solo trips and my travel adventures.",
        readTime: "4 min read",
    },
    {
        id: "story-budget",
        title: "How I Traveled Southeast Asia on a Budget",
        description: "My journey through Thailand, Vietnam, and Cambodia for under $1000.",
        readTime: "6 min read",
    },
    {
        id: "story-cafes",
        title: "Hidden Cafes in European Cities",
        description: "Explore charming cafes away from tourist hotspots.",
        readTime: "5 min read",
    }
]

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
    }
]

export default function DashboardPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative w-full h-[600px] md:h-[700px]">
           {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-white/5 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-foreground px-4">
            <div className="max-w-4xl">
              <p className="flex items-center justify-center gap-2 font-semibold text-primary">
                <Sparkles className="w-5 h-5" />
                AI-POWERED TRAVEL ASSISTANT
              </p>
              <h1 className="font-headline text-5xl md:text-7xl font-bold mt-4">
                Plan Smart. <span className="text-primary">Travel Green.</span> Enjoy More.
              </h1>
              <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
                Your intelligent travel companion that helps you discover hidden gems, book eco-friendly transport, and create unforgettable experiences—all while keeping your carbon footprint low.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Planning</Button>
                <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-border">Learn More</Button>
              </div>
              <div className="mt-8 flex justify-center gap-6 text-sm text-foreground/70">
                <span className="flex items-center gap-2"><Heart className="w-4 h-4"/> AI Powered</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Community Driven</span>
                <span className="flex items-center gap-2"><Leaf className="w-4 h-4"/> Eco Friendly</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center">Everything You Need for the <span className="text-primary">Perfect Trip</span></h2>
            <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Powerful features designed to make your travel planning seamless and sustainable</p>
            <div className="grid gap-8 md:grid-cols-3 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center bg-transparent border-border/50 hover:bg-white/50 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-headline text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-2">Top Destinations This Month <Globe className="w-8 h-8 text-primary"/></h2>
                <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Explore the most popular destinations trending among travelers worldwide</p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
                    {topDestinations.map(dest => {
                        const image = PlaceHolderImages.find(p => p.id === dest.id)
                        return (
                            <Card key={dest.id} className="overflow-hidden group">
                                <div className="relative aspect-[4/3]">
                                    {image && <Image src={image.imageUrl} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={image.imageHint}/>}
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-primary/80 text-primary-foreground backdrop-blur-sm">Trending</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold">{dest.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                                        <span className="font-semibold">{dest.rating}</span>
                                        <span>({dest.reviews})</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-2"><Sparkles className="w-8 h-8 text-primary"/> AI Picks For You</h2>
                <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Personalized destination recommendations based on your travel preferences</p>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {aiPicks.map(pick => {
                        const image = PlaceHolderImages.find(p => p.id === pick.id)
                        return (
                            <Card key={pick.id} className="overflow-hidden">
                                {image && <Image src={image.imageUrl} alt={pick.title} width={400} height={250} className="w-full object-cover" data-ai-hint={image.imageHint} />}
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg">{pick.title}</h3>
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {pick.duration}</p>
                                        <p className="flex items-center gap-2"><Plane className="w-4 h-4"/> Perfect for {pick.perfectFor}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-lg font-bold text-primary">{pick.price}</p>
                                        <Button variant="outline">Explore</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

        <section className="py-12 md:py-24 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center">Local Stories & Travel Tips</h2>
                <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Get inspired by real travelers and learn from their experiences</p>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {localStories.map(story => {
                        const image = PlaceHolderImages.find(p => p.id === story.id)
                        return (
                            <Card key={story.id} className="overflow-hidden">
                                <div className="relative aspect-video">
                                    {image && <Image src={image.imageUrl} alt={story.title} fill className="object-cover" data-ai-hint={image.imageHint}/>}
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-primary/80 text-primary-foreground backdrop-blur-sm">Travel Tips</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg">{story.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2">{story.description}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{story.readTime}</p>
                                    <Button variant="link" className="p-0 mt-2">Read Story</Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center">More Features</h2>
                <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Everything you need for a perfect trip</p>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {moreFeatures.map((feature) => (
                        <Card key={feature.title} className="text-center bg-transparent border-border/50 hover:bg-white/50 hover:shadow-lg transition-all duration-300 group">
                           <CardContent className="p-8">
                                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-lg">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                           </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
