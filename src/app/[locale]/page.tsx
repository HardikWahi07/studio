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
import { destinations } from '@/lib/destinations';
import { Card, CardContent } from '@/components/ui/card';
import { HeroVideo } from '@/components/hero-video';
import { DestinationCard } from '@/components/destination-card';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('DashboardPage');

  const features = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: t('feature1Title'),
      description: t('feature1Description'),
      link: '/itinerary-planner',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('feature2Title'),
      description: t('feature2Description'),
      link: '/local-artisans',
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: t('feature3Title'),
      description: t('feature3Description'),
      link: '/hidden-gems',
    },
  ];

  const stories = [
      {
          id: 'story-solo',
          title: t('story1Title'),
          description: t('story1Description'),
          readTime: t('story1ReadTime'),
          imageHint: 'solo traveler'
      },
      {
          id: 'story-budget',
          title: t('story2Title'),
          description: t('story2Description'),
          readTime: t('story2ReadTime'),
          imageHint: 'asia market'
      },
      {
          id: 'story-cafes',
          title: t('story3Title'),
          description: t('story3Description'),
          readTime: t('story3ReadTime'),
          imageHint: 'european cafe'
      }
  ]

  const moreFeatures = [
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: t('feature4Title'),
      description: t('feature4Description'),
      link: '/expenses',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t('feature5Title'),
      description: t('feature5Description'),
      link: '/local-supporters',
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: t('feature6Title'),
      description: t('feature6Description'),
      link: '/transport',
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
                <Link href="/itinerary-planner">{t('startPlanning')}</Link>
              </Button>
               <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6 rounded-full">
                <Link href="#">{t('learnMore')}</Link>
              </Button>
            </div>
             <div className="mt-8 flex gap-4">
                 <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Sparkles className="w-4 h-4 mr-2 text-primary"/>{t('aiPowered')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Leaf className="w-4 h-4 mr-2 text-primary"/>{t('greenAndIntuitive')}</div>
                <div className="bg-white/20 backdrop-blur-sm border-gray-300/50 text-white py-2 px-4 rounded-full text-sm font-medium inline-flex items-center"><Users className="w-4 h-4 mr-2 text-primary"/>{t('userFriendly')}</div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto features-header">
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
                  <Card className="text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
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

        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-headline">
                {t('topDestinationsTitle')} <Globe className="inline-block h-10 w-10 text-primary" />
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                {t('topDestinationsDescription')}
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
                    {t('storiesTitle')}
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                    {t('storiesDescription')}
                </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                {stories.map(story => {
                    return (
                    <Link href="#" key={story.id}>
                      <Card className="overflow-hidden group h-full">
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
                    </Link>
                    )
                })}
                </div>
            </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className="text-center max-w-3xl mx-auto features-header">
                    <h2 className="text-4xl md:text-5xl font-bold font-headline">
                        {t('moreFeaturesTitle')}
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        {t('moreFeaturesDescription')}
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3 mt-12">
                    {moreFeatures.map(feature => (
                        <Link href={feature.link} key={feature.title}>
                            <Card className="text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
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
