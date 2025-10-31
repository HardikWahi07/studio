
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { exploreHiddenGems, ExploreHiddenGemsOutput } from "@/ai/flows/explore-hidden-gems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Dices, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOnVisible } from '@/hooks/use-on-visible';
import { cn } from '@/lib/utils';
import { useTranslations } from "@/hooks/use-translations";

const formSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  interests: z.string().min(5, "Tell us more about your interests."),
});

const randomInterests = [
  "Street art and local galleries",
  "Family-owned restaurants and food stalls",
  "Quiet parks and urban nature spots",
  "Independent bookshops and cozy cafes",
  "Local history and forgotten landmarks",
  "Artisanal craft markets",
];

export default function HiddenGemsPage() {
  const t = useTranslations();
  const [gems, setGems] = useState<ExploreHiddenGemsOutput['gems'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsVisible = useOnVisible(resultsRef, false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      interests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGems(null); // Clear previous results
    try {
      const result = await exploreHiddenGems(values);
      setGems(result.gems);
       if (!result.gems || result.gems.length === 0) {
        toast({
            title: "No Gems Found",
            description: "Try a different destination or broaden your interests.",
        });
      }
    } catch (error) {
      console.error("Failed to explore hidden gems:", error);
      toast({
        title: t('HiddenGemsPage.toastErrorTitle'),
        description: t('HiddenGemsPage.toastErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSpontaneity = () => {
    const randomInterest = randomInterests[Math.floor(Math.random() * randomInterests.length)];
    form.setValue("interests", randomInterest);
    const destination = form.getValues("destination");
    if (destination) {
      onSubmit({ destination, interests: randomInterest });
    } else {
      form.setFocus("destination");
      toast({
        title: t('HiddenGemsPage.toastSpontaneityTitle'),
        description: t('HiddenGemsPage.toastSpontaneityDescription'),
      });
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('HiddenGemsPage.title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('HiddenGemsPage.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('HiddenGemsPage.formTitle')}</CardTitle>
          <CardDescription>{t('HiddenGemsPage.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('HiddenGemsPage.destinationLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('HiddenGemsPage.destinationPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('HiddenGemsPage.interestsLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('HiddenGemsPage.interestsPlaceholder')}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('HiddenGemsPage.searchingButton')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('HiddenGemsPage.findGemsButton')}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleSpontaneity} disabled={isLoading}>
                  <Dices className="mr-2 h-4 w-4" />
                  {t('HiddenGemsPage.spontaneityButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {gems && gems.length > 0 && (
        <div ref={resultsRef} className="pt-8">
          <h2 className="font-headline text-2xl font-bold mb-6">{t('HiddenGemsPage.discoveredGemsTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gems.map((gem, index) => (
              <Card key={index} className={cn("flex flex-col fade-in-up", { 'visible': resultsVisible })} style={{ transitionDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{gem.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                  <p className="text-muted-foreground">{gem.description}</p>
                  <div>
                    <h4 className="font-bold text-sm mb-2 text-primary">{t('HiddenGemsPage.whyAuthentic')}</h4>
                    <p className="text-sm border-l-2 border-primary pl-3">{gem.whyAuthentic}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
       {!isLoading && gems !== null && gems.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Gems Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                We couldn't find any hidden gems for that search. Try being more general.
            </p>
        </div>
       )}

    </main>
  );
}
