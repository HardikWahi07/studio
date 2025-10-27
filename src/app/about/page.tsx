
'use client';

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Leaf, Heart } from 'lucide-react';
import { useOnVisible } from '@/hooks/use-on-visible';
import { AnimatedStat } from '@/components/animated-stat';

const values = [
  {
    icon: <Cpu className="h-10 w-10 text-primary" />,
    title: 'AI Engine',
    description: 'Smart Planning',
  },
  {
    icon: <Leaf className="h-10 w-10 text-primary" />,
    title: 'Eco Focus',
    description: 'Sustainability',
  },
  {
    icon: <Heart className="h-10 w-10 text-primary" />,
    title: 'User First',
    description: 'Experience',
  },
];

const stats = [
  { value: 1200, label: 'Routes Planned', format: '1.2K+' },
  { value: 500, label: 'Happy Travelers', format: '500+' },
  { value: 25, label: 'Destinations', format: '25+' },
];

export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnVisible(statsRef);

  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">
            About TripMind
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            The smarter, greener, easier way to explore
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-6 md:p-10 shadow-lg border-gray-200/80">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
                Our Vision
              </h2>
              <div className="space-y-4 text-muted-foreground text-base md:text-lg">
                <p>
                  TripMind was born from a simple idea: travel should be both
                  exciting and responsible. We believe that technology can help
                  us explore the world while protecting it for future
                  generations.
                </p>
                <p>
                  Our AI-powered platform makes it easy to plan trips that are
                  not only memorable but also sustainable. From finding hidden
                  gems to calculating carbon footprints, we put the power of
                  smart travel in your hands.
                </p>
                <p>
                  Built for Hackathon 2025, TripMind represents our commitment
                  to innovation, sustainability, and creating meaningful travel
                  experiences that connect people with places and cultures.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {values.map((value) => (
              <Card
                key={value.title}
                className="text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground mt-1">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gray-900 text-white text-center p-8 md:p-12 shadow-lg">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
                Our Mission
              </h2>
              <p className="text-lg md:text-2xl max-w-3xl mx-auto italic text-gray-300">
                "To empower travelers with AI-driven insights that make every
                journey smarter, greener, and more enriching—while supporting
                local communities and protecting our planet."
              </p>
              <div
                ref={statsRef}
                className="mt-10 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl md:text-5xl font-bold">
                      {isVisible ? (
                        <AnimatedStat
                          finalValue={stat.value}
                          label={stat.format}
                        />
                      ) : (
                        0
                      )}
                    </p>
                    <p className="text-sm md:text-base font-medium text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
