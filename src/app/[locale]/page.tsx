
'use client';

import { useRef } from 'react';
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
import type { Blog } from '@/lib/types';
import { useOnVisible } from '@/hooks/use-on-visible';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

export default function DashboardPage({ blogs }: { blogs: Blog[] }) {
  const t = useTranslations();
  const featuresRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const moreFeaturesRef = useRef<HTMLDivElement>(null);
  const featuresVisible = useOnVisible(featuresRef);
  const destinationsVisible = useOnVisible(destinationsRef);
  const storiesVisible = useOnVisible(storiesRef);
  const moreFeaturesVisible = useOnVisible(moreFeaturesRef);

  const destinations = allDestinations.slice(0, 3);

  const features = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature1Title'),
      description: t('DashboardPage.feature1Description'),
      link: `/itinerary-planner`,
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature2Title'),
      description: t('DashboardPage.feature2Description'),
      link: `/local-artisans`,
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature3Title'),
      description: t('DashboardPage.feature3Description'),
      link: `/hidden-gems`,
    },
  ];

  const moreFeatures = [
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature4Title'),
      description: t('DashboardPage.feature4Description'),
      link: `/expenses`,
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature5Title'),
      description: t('DashboardPage.feature5Description'),
      link: `/local-supporters`,
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: t('DashboardPage.feature6Title'),
      description: t('DashboardPage.feature6Description'),
      link: `/suggest-bookings`,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative w-full min-h-screen text-white flex items-center justify-center">
          <HeroVideo />
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
            <div className='flex items-center gap-2 mb-4'>
                <Sparkles className='w-5 h-5 text-white' />
                <p className='font-bold text-white tracking-widest'>{t('DashboardPage.heroSubtitle')}</p>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
              {t('DashboardPage.heroTitle1')} <span className='text-primary'>{t('DashboardPage.heroTitle2')}</span><br/> {t('DashboardPage.heroTitle3')}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl text-gray-200">
              {t('DashboardPage.heroDescription')}
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full">
                <Link href="/itinerary-planner">{t('DashboardPage.startPlanning')}</Link>
              </Button>
               <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 rounded-full">
                <Link href="/about">{t('DashboardPage.learnMore')}</Link>
              </Button>
            </div>
             <div className="mt-8 flex gap-4">
                 <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary"/>{t('DashboardPage.aiPowered')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Leaf className="w-4 h-4 mr-2 text-primary"/>{t('DashboardPage.greenAndIntuitive')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Users className="w-4 h-4 mr-2 text-primary"/>{t('DashboardPage.userFriendly')}</div>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className={cn("text-center max-w-3xl mx-auto features-header fade-in-up", { 'visible': featuresVisible })}>
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                {t('DashboardPage.featuresTitle')} <span className='text-primary'>{t('DashboardPage.featuresTitleHighlight')}</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                {t('DashboardPage.featuresDescription')}
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
                {t('DashboardPage.topDestinationsTitle')} <Globe className="inline-block h-10 w-10 text-primary" />
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                {t('DashboardPage.topDestinationsDescription')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              {destinations.map((dest, index) => (
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
                      {t('DashboardPage.storiesTitle')}
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg">
                      {t('DashboardPage.storiesDescription')}
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                {(blogs || []).slice(0,3).map((blog, index) => {
                    const readTime = Math.ceil(blog.content.split(' ').length / 200);
                    return (
                    <Link href={`/blog/${blog.id}`} key={blog.id}>
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
                        <Link href="/blog">{t('AppLayout.blog')}</Link>
                    </Button>
                </div>
            </div>
        </section>
        
        <section ref={moreFeaturesRef} className="py-16 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className={cn("text-center max-w-3xl mx-auto features-header fade-in-up", { 'visible': moreFeaturesVisible })}>
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">
                        {t('DashboardPage.moreFeaturesTitle')}
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        {t('DashboardPage.moreFeaturesDescription')}
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
