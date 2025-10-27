"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generatePersonalizedItinerary, GeneratePersonalizedItineraryInput } from "@/ai/flows/generate-personalized-itineraries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  budget: z.string().min(2, "Please specify a budget (e.g., 'budget-friendly', 'moderate', 'luxury')."),
  interests: z.string().min(5, "Tell us more about your interests."),
});

export default function ItineraryPlannerPage() {
  const [itinerary, setItinerary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      budget: "",
      interests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setItinerary("");
    try {
      const result = await generatePersonalizedItinerary(values as GeneratePersonalizedItineraryInput);
      setItinerary(result.itinerary);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">AI Itinerary Generator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Let our AI craft the perfect, personalized travel plan for you. Just enter your preferences below and watch the magic happen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Trip Details</CardTitle>
            <CardDescription>Fill in the form to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kyoto, Japan" {...field} />
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
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Moderate" {...field} />
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
                      <FormLabel>Interests & Preferences</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Interested in historic temples, local cuisine, nature walks, and minimal travel between locations."
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Personalized Itinerary</CardTitle>
            <CardDescription>Your AI-generated travel plan will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                 <div className="space-y-2">
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                </div>
                 <div className="space-y-2 pt-4">
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                </div>
                 <div className="space-y-2 pt-4">
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            )}
            {!isLoading && !itinerary && (
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[300px]">
                <Map className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your itinerary is waiting to be created.</p>
              </div>
            )}
            {itinerary && (
              <div className="prose prose-sm md:prose-base max-w-none text-foreground">
                <pre className="whitespace-pre-wrap bg-secondary/50 p-4 rounded-md font-sans text-sm">
                  {itinerary}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
