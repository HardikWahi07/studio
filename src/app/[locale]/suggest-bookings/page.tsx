'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function SuggestBookingsPage() {
    const t = useTranslations('SuggestBookingsPage');
    const locale = useLocale();

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('description')}
        </p>
      </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Use the AI Trip Planner
                </CardTitle>
                <CardDescription>
                    To get the best booking suggestions, please use our full AI Trip Planner. It allows you to specify dates, accommodation, interests, and much more to get a truly personalized plan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href={`/${locale}/trip-planner`}>
                        <Plane className="mr-2" />
                        Go to AI Trip Planner
                    </Link>
                </Button>
            </CardContent>
        </Card>
    </main>
  );
}
