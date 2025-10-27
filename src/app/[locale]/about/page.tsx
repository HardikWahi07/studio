'use client';

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Leaf, Heart } from 'lucide-react';
import { useOnVisible } from '@/hooks/use-on-visible';
import { AnimatedStat } from '@/components/animated-stat';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

const values = [
  {
    icon: <Cpu className="h-10 w-10 text-primary" />,
    translationKey: 'value1'
  },
  {
    icon: <Leaf className="h-10 w-10 text-primary" />,
    translationKey: 'value2'
  },
  {
    icon: <Heart className="h-10 w-10 text-primary" />,
    translationKey: 'value3'
  },
];

export default function AboutPage() {
  const t = useTranslations('AboutPage');
  const statsRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnVisible(statsRef);
  const firestore = useFirestore();

  const statLabels: { [key: string]: { label: string, format: (val: number) => string } } = {
    routesPlanned: { label: t('routesPlanned'), format: (val) => val > 1000 ? `${(val/1000).toFixed(1)}K+` : `${val}+` },
    happyTravelers: { label: t('happyTravelers'), format: (val) => val > 1000 ? `${(val/1000).toFixed(1)}K+` : `${val}+` },
    destinations: { label: t('destinations'), format: (val) => `${val}+` },
  };

  const statsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'app-stats', 'live-stats');
  }, [firestore]);
  
  const { data: appStats, isLoading } = useDoc<{ routesPlanned: number, happyTravelers: number, destinations: number }>(statsDocRef);

  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-6 md:p-10 shadow-lg border-gray-200/80">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">
                {t('visionTitle')}
              </h2>
              <div className="space-y-4 text-muted-foreground text-base md:text-lg">
                <p>{t('visionP1')}</p>
                <p>{t('visionP2')}</p>
                <p>{t('visionP3')}</p>
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
                key={value.translationKey}
                className="text-center p-8 h-full feature-card border-gray-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold">{t(`${value.translationKey}Title`)}</h3>
                <p className="text-muted-foreground mt-1">
                  {t(`${value.translationKey}Description`)}
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
                {t('missionTitle')}
              </h2>
              <p className="text-lg md:text-2xl max-w-3xl mx-auto italic text-gray-300">
                {t('missionStatement')}
              </p>
              <div
                ref={statsRef}
                className="mt-10 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
              >
                {isLoading && Object.keys(statLabels).map((key) => (
                    <div key={key}>
                        <Skeleton className="h-12 w-24 mx-auto mb-2" />
                        <Skeleton className="h-5 w-32 mx-auto" />
                    </div>
                ))}
                {!isLoading && appStats && Object.entries(appStats).filter(([key]) => key !== 'id').map(([key, value]) => (
                  <div key={key}>
                    <p className="text-4xl md:text-5xl font-bold">
                      {isVisible ? (
                        <AnimatedStat
                          finalValue={value}
                          label={statLabels[key].format(value)}
                        />
                      ) : (
                        0
                      )}
                    </p>
                    <p className="text-sm md:text-base font-medium text-gray-400 mt-1">
                      {statLabels[key].label}
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
