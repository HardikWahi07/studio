
'use client';

import { useRef, useMemo } from 'react';
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
  BookOpen,
} from 'lucide-react';
import { PexelsImage } from '@/components/pexels-image';
import { destinations as allDestinations } from '@/lib/destinations';
import { Card, CardContent } from '@/components/ui/card';
import { HeroVideo } from '@/components/hero-video';
import { DestinationCard } from '@/components/destination-card';
import { useTranslations, useLocale } from 'next-intl';
import type { Blog } from '@/lib/types';
import { useOnVisible } from '@/hooks/use-on-visible';
import { cn } from '@/lib/utils';

export default function DashboardPage({ blogs }: { blogs: Blog[] }) {
  const t = useTranslations('DashboardPage');
  const locale = useLocale();
  const featuresRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const moreFeaturesRef = useRef<HTMLDivElement>(null);
  const featuresVisible = useOnVisible(featuresRef);
  const destinationsVisible = useOnVisible(destinationsRef);
  const storiesVisible = useOnVisible(storiesRef);
  const moreFeaturesVisible = useOnVisible(moreFeaturesRef);

  const destinations = allDestinations;

  const features = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: t('feature1Title'),
      description: t('feature1Description'),
      link: `/${locale}/itinerary-planner`,
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('feature2Title'),
      description: t('feature2Description'),
      link: `/${locale}/local-artisans`,
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: t('feature3Title'),
      description: t('feature3Description'),
      link: `/${locale}/hidden-gems`,
    },
  ];

  const moreFeatures = [
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: t('feature4Title'),
      description: t('feature4Description'),
      link: `/${locale}/expenses`,
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t('feature5Title'),
      description: t('feature5Description'),
      link: `/${locale}/local-supporters`,
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: t('feature6Title'),
      description: t('feature6Description'),
      link: `/${locale}/suggest-bookings`,
    },
  ];

  const getCreatedAtDate = (blog: Blog) => {
    if (blog.createdAt?.toDate) { // It's a Firestore Timestamp
      return blog.createdAt.toDate();
    }
    return new Date(blog.createdAt); // It's likely an ISO string from server-side rendering
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative w-full min-h-screen text-white flex items-center justify-center">
          <HeroVideo />
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
            <div className='flex items-center gap-2 mb-4'>
                <Sparkles className='w-5 h-5 text-white' />
                <p className='font-bold text-white tracking-widest'>{t('heroSubtitle')}</p>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              {t('heroTitle1')} <span className='text-primary'>{t('heroTitle2')}</span><br/> {t('heroTitle3')}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl text-gray-200">
              {t('heroDescription')}
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full">
                <Link href={`/${locale}/itinerary-planner`}>{t('startPlanning')}</Link>
              </Button>
               <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 rounded-full">
                <Link href={`/${locale}/about`}>{t('learnMore')}</Link>
              </Button>
            </div>
             <div className="mt-8 flex gap-4">
                 <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary"/>{t('aiPowered')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Leaf className="w-4 h-4 mr-2 text-primary"/>{t('greenAndIntuitive')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Users className="w-4 h-4 mr-2 text-primary"/>{t('userFriendly')}</div>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className={cn("text-center max-w-3xl mx-auto features-header fade-in-up", { 'visible': featuresVisible })}>
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                {t('featuresTitle')} <span className='text-primary'>{t('featuresTitleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                {t('featuresDescription')}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Link href={feature.link} key={feature.title}>
                  <Card className={cn("text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300 fade-in-up", { 'visible': featuresVisible })} style={{ transitionDelay: `${index * 150}ms` }}>
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
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section ref={destinationsRef} className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className={cn("text-center max-w-3xl mx-auto fade-in-up", { 'visible': destinationsVisible })}>
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                {t('topDestinationsTitle')} <Globe className="inline-block h-10 w-10 text-primary" />
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                {t('topDestinationsDescription')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              {destinations.slice(0, 3).map((dest, index) => (
                  <div key={dest.id} className={cn("fade-in-up", { 'visible': destinationsVisible })} style={{ transitionDelay: `${index * 150}ms` }}>
                    <DestinationCard destination={dest} />
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={storiesRef} className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className={cn("text-center max-w-3xl mx-auto fade-in-up", { 'visible': storiesVisible })}>
                  <h2 className="text-4xl md:text-5xl font-bold font-headline">
                      {t('storiesTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg">
                      {t('storiesDescription')}
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                {(blogs || []).slice(0,3).map((blog, index) => {
                    const readTime = Math.ceil(blog.content.split(' ').length / 200);
                    return (
                    <Link href={`/${locale}/blog/${blog.id}`} key={blog.id}>
                      <Card className={cn("overflow-hidden group h-full fade-in-up", { 'visible': storiesVisible })} style={{ transitionDelay: `${index * 150}ms` }}>
                          <div className="aspect-video w-full overflow-hidden">
                          <PexelsImage query={blog.imageHint || 'travel'} alt={blog.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                          </div>
                          <CardContent className="p-6">
                          <h3 className="font-bold text-lg">{blog.title}</h3>
                          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{blog.content}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-4">
                              <BookOpen className="w-4 h-4 mr-2" />
                              <span>{readTime} min read</span>
                          </div>
                          </CardContent>
                      </Card>
                    </Link>
                    )
                })}
                </div>
                 <div className={cn("text-center mt-12 fade-in-up", { 'visible': storiesVisible })} style={{ transitionDelay: '450ms' }}>
                    <Button asChild>
                        <Link href={`/${locale}/blog`}>Read More Stories</Link>
                    </Button>
                </div>
            </div>
        </section>
        
        <section ref={moreFeaturesRef} className="py-16 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className={cn("text-center max-w-3xl mx-auto features-header fade-in-up", { 'visible': moreFeaturesVisible })}>
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">
                        {t('moreFeaturesTitle')}
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        {t('moreFeaturesDescription')}
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {moreFeatures.map((feature, index) => (
                        <Link href={feature.link} key={feature.title}>
                            <Card className={cn("text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300 fade-in-up", { 'visible': moreFeaturesVisible })} style={{ transitionDelay: `${index * 150}ms` }}>
                                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                <p className="text-muted-foreground mt-2">{feature.description}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}

// This function is assumed to be implemented in a server component or API route
// For this example, we'll keep the client-side logic but acknowledge
// that getBlogs should be called from the server.
async function getBlogs(): Promise<Blog[]> {
    // In a real app, this would be an API call, e.g., await fetch('/api/blogs')
    return [
      {
        id: "1",
        title: "10 Essential Tips for Solo Travelers",
        content: "A guide to staying safe and sane on your solo adventures.",
        authorId: "user1",
        authorName: "Jane Doe",
        authorAvatar: "",
        createdAt: new Date(),
        imageHint: "solo traveler sunset"
      },
      {
        id: "2",
        title: "How I Traveled Southeast Asia on a Budget",
        content: "My journey through Vietnam, Cambodia and beyond for under $1,000.",
        authorId: "user2",
        authorName: "John Smith",
        authorAvatar: "",
        createdAt: new Date(),
        imageHint: "southeast asia market"
      },
      {
        id: "3",
        title: "Hidden Cafes in European Cities",
        content: "Espresso-hunting in the quiet, cozy corners of the continent.",
        authorId: "user3",
        authorName: "Emily White",
        authorAvatar: "",
        createdAt: new Date(),
        imageHint: "european cafe"
      },
    ]
}
