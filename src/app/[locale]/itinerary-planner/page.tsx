"use client";

import { useState, useRef, useEffect } from "react";
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
import { TripItinerary } from "@/components/trip-itinerary";
import { useOnVisible } from "@/hooks/use-on-visible";
import { cn } from "@/lib/utils";
import type { PlanTripOutput } from "@/ai/flows/plan-trip.types";
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
  const [itinerary, setItinerary] = useState<PlanTripOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean>(true);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsVisible = useOnVisible(resultsRef);

  useEffect(() => {
    // Check for AI API availability on component mount
    async function checkAiAvailability() {
      if (window.ai && (await window.ai.canCreateTextSession()) !== 'no') {
        setAiAvailable(true);
      } else {
        setAiAvailable(false);
      }
    }
    checkAiAvailability();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      budget: "",
      interests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!aiAvailable) {
        toast({ title: "Built-in AI Not Available", description: "This feature requires a browser with built-in AI support, like the latest Chrome.", variant: "destructive" });
        return;
    }
      
    setIsLoading(true);
    setItinerary(null);
    
    try {
        const session = await window.ai!.createTextSession();
        const prompt = `You are an expert travel assistant. Generate a personalized, day-by-day trip itinerary based on the following information.

        - **Destination:** ${values.destination}
        - **Budget:** ${values.budget}
        - **Interests & Preferences:** ${values.interests}

        Your Task:
        1.  **Create a Trip Title:** Generate a creative and exciting title for the entire trip.
        2.  **Generate a Day-by-Day Itinerary:** Create a plan for a 3-day trip. For each day, create a detailed plan.
            - Each day needs a **title** and a brief **summary**.
            - For each activity, provide:
                - **Time:** A specific start time (e.g., "09:00 AM").
                - **Description:** A clear description of the activity (e.g., "Guided tour of the Louvre Museum").
                - **Location:** The address or name of the place.
                - **Cost:** An estimated cost for the activity (e.g., "€25", "$50", "Free").
                - **Details:** Practical tips, booking information, or why it's a great spot.
            - **CRITICAL: For activities like "Lunch," "Dinner," or "Coffee," you MUST suggest a specific, real business.** Base your suggestion on the user's interests.
            - **MANDATORY: Include Detailed Transportation:** Between each activity, you MUST add a 'transportToNext' segment with estimated travel times, mode of transport, and a route description.
        
        **IMPORTANT**: Your entire response MUST be a single, valid JSON object that conforms to this structure:
        {
            "tripTitle": "string",
            "itinerary": [
                {
                    "day": "number",
                    "title": "string",
                    "summary": "string",
                    "activities": [
                        {
                            "time": "string",
                            "description": "string",
                            "location": "string",
                            "details": "string",
                            "cost": "string",
                            "transportToNext": {
                                "mode": "string",
                                "duration": "string",
                                "description": "string",
                                "ecoFriendly": "boolean"
                            } | null
                        }
                    ]
                }
            ],
            "bookingOptions": [],
            "hotelOptions": [],
            "localTransportOptions": []
        }
        
        Do not include any text, markdown, or formatting before or after the JSON object. The response must start with '{' and end with '}'.`;

        const stream = session.promptStreaming(prompt);
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk;
        }

        // Clean and parse the response
        const jsonString = fullResponse.trim().replace(/^```json|```$/g, '');
        const result: PlanTripOutput = JSON.parse(jsonString);
      
        setItinerary(result);

    } catch (error) {
      console.error("Failed to generate itinerary with on-device AI:", error);
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
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('ItineraryPlannerPage.title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('ItineraryPlannerPage.description')}
        </p>
      </div>
      
      {!aiAvailable && (
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
                  <Button type="submit" className="w-full" disabled={isLoading || !aiAvailable}>
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
                 <CardTitle>{itinerary ? itinerary.tripTitle : t('ItineraryPlannerPage.resultTitle')}</CardTitle>
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
                  <TripItinerary results={itinerary} />
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
