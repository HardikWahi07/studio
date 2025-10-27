import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Map,
  Sparkles,
  Train,
  Users,
  Shield,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: 'AI Itinerary Generator',
    description:
      'Personalized, eco-friendly travel plans based on your interests and budget.',
    link: '/itinerary-planner',
    image: PlaceHolderImages.find(p => p.id === 'feature-itinerary'),
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Hidden Gems Explorer',
    description:
      "Discover authentic, lesser-known experiences. Includes a 'Spontaneity Button'!",
    link: '/hidden-gems',
    image: PlaceHolderImages.find(p => p.id === 'feature-gems'),
  },
  {
    icon: <Train className="h-8 w-8 text-primary" />,
    title: 'Smart Transport',
    description:
      'Compare travel modes by cost, time, and carbon footprint for sustainable routes.',
    link: '/transport',
    image: PlaceHolderImages.find(p => p.id === 'feature-transport'),
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'Local Business Connector',
    description:
      'Connect with local artisans and experiences to support community tourism.',
    link: '/local-artisans',
    image: PlaceHolderImages.find(p => p.id === 'feature-local'),
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Group Expense Splitter',
    description:
      'Log shared trip expenses and automatically calculate who owes whom.',
    link: '/expenses',
    image: PlaceHolderImages.find(p => p.id === 'feature-expenses'),
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: 'Safety Companion',
    description:
      'Real-time alerts, nearby hospital info, and an AI chatbot for emergencies.',
    link: '/safety',
    image: PlaceHolderImages.find(p => p.id === 'feature-safety'),
  },
];

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-dashboard');

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-12 p-4 md:p-8 pt-6">
        <section className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              TripMind
            </h1>
            <p className="mt-2 text-lg md:text-2xl text-white/90 max-w-2xl drop-shadow-md">
              Plan smart. Travel green. Enjoy more.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
            Your Smart Travel Assistant
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="flex-row items-center gap-4">
                  {feature.icon}
                  <div>
                    <CardTitle className="font-headline text-xl">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {feature.image && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <Image
                        src={feature.image.imageUrl}
                        alt={feature.image.description}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={feature.image.imageHint}
                      />
                    </div>
                  )}
                  <CardDescription>{feature.description}</CardDescription>
                  <Button asChild variant="ghost" className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80">
                    <Link href={feature.link}>
                      Explore Feature <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
