
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Map, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOnVisible } from "@/hooks/use-on-visible";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  budget: z.string().min(2, "Please specify a budget (e.g., 'budget-friendly', 'moderate', 'luxury')."),
  interests: z.string().min(5, "Tell us more about your interests."),
});

// A type guard to check if window.ai is available
declare global {
  interface Window {
    ai?: {
      canCreateTextSession: () => Promise<'readily' | 'after-user-consent' | 'no'>;
      createTextSession: () => Promise<any>;
    };
  }
}

export default function ItineraryGeneratorPage() {
  const t = useTranslations();
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAiError, setShowAiError] = useState(false);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsVisible = useOnVisible(resultsRef);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      budget: "",
      interests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setShowAiError(false);
    setIsLoading(true);
    setItinerary(null);

    try {
      const canCreate = await window.ai?.canCreateTextSession();
      
      if (canCreate === 'no' || canCreate === undefined) {
          throw new Error("On-device AI not supported by this browser.");
      }

      const session = await window.ai.createTextSession();
      const prompt = `You are an expert travel assistant. Generate a personalized, day-by-day trip itinerary based on the following information. Your response must be plain text, formatted with markdown for readability. Do NOT use JSON.

      - **Destination:** ${values.destination}
      - **Budget:** ${values.budget}
      - **Interests & Preferences:** ${values.interests}

      Your Task:
      1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.
      2.  **Generate a Day-by-Day Itinerary:** Create a plan for a 3-day trip. For each day, create a detailed plan.
          - Each day needs a **title** and a brief **summary**.
          - For each activity, provide a time, description, location, and any useful details.
          - For meals, suggest specific, real restaurants based on the user's interests.
          - Include simple transport advice between activities (e.g., "Take the metro - 15 mins").`;

      const stream = session.promptStreaming(prompt);
      let fullResponse = "";
      for await (const chunk of stream) {
          fullResponse += chunk;
      }

      setItinerary(fullResponse);

    } catch (error) {
      console.error("Failed to generate itinerary with on-device AI:", error);
      setShowAiError(true);
      toast({
        title: t('ItineraryPlannerPage.toastErrorTitle'),
        description: t('ItineraryPlannerPage.toastErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('AppLayout.aiItineraryGenerator')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('ItineraryPlannerPage.description')}
        </p>
      </div>
      
      {showAiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>On-Device AI Not Supported</AlertTitle>
          <AlertDescription>
            This browser does not support the built-in AI required for this feature. Please try again with a browser that supports the Prompt API, like the latest version of Google Chrome.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('ItineraryPlannerPage.formTitle')}</CardTitle>
              <CardDescription>{t('ItineraryPlannerPage.formDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ItineraryPlannerPage.destinationLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('ItineraryPlannerPage.destinationPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ItineraryPlannerPage.budgetLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('ItineraryPlannerPage.budgetPlaceholder')} {...field} />
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
                        <FormLabel>{t('ItineraryPlannerPage.interestsLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('ItineraryPlannerPage.interestsPlaceholder')}
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('ItineraryPlannerPage.generatingButton')}
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('ItineraryPlannerPage.generateButton')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card ref={resultsRef}>
              <CardHeader>
                 <CardTitle>{itinerary ? "Your Personalized Itinerary" : t('ItineraryPlannerPage.resultTitle')}</CardTitle>
                <CardDescription>{t('ItineraryPlannerPage.resultDescription')}</CardDescription>
              </CardHeader>
              <CardContent className={cn("fade-in-up", { 'visible': resultsVisible })}>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center pt-10 text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-primary" />
                      <p className="mt-4 text-lg font-semibold text-muted-foreground">Crafting your itinerary with on-device AI...</p>
                  </div>
                )}
                {!isLoading && !itinerary && (
                  <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[300px]">
                    <Map className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">{t('ItineraryPlannerPage.waitingMessage')}</p>
                  </div>
                )}
                {itinerary && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {itinerary}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
