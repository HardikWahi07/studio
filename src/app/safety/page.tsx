"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSafetyAssistance, GetSafetyAssistanceOutput } from "@/ai/flows/get-safety-assistance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, Siren, Hospital, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  location: z.string().min(2, "Location is required."),
  emergencyType: z.string().optional(),
  details: z.string().optional(),
});

export default function SafetyPage() {
  const [assistance, setAssistance] = useState<GetSafetyAssistanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      emergencyType: "",
      details: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssistance(null);
    try {
      const result = await getSafetyAssistance(values);
      setAssistance(result);
    } catch (error) {
      console.error("Failed to get safety assistance:", error);
      toast({
        title: "Error",
        description: "Failed to get assistance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Location & Safety Companion</h1>
        <p className="text-muted-foreground max-w-2xl">
          Your safety is our priority. Get real-time alerts, find nearby help, and use our AI assistant in emergencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Assistance</CardTitle>
              <CardDescription>Describe your situation for AI-powered help.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Paris, France" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Emergency (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Medical, Lost, Natural Disaster" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Details (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your situation..." className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    Get Assistance
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {(isLoading || assistance) ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Siren className="text-destructive"/> Safety Alert</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  ) : (
                    <Alert variant="destructive">
                      <Siren className="h-4 w-4" />
                      <AlertTitle>Heads Up!</AlertTitle>
                      <AlertDescription>{assistance?.safetyAlert}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Hospital /> Nearby Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
                  ) : (
                     <pre className="whitespace-pre-wrap bg-secondary/50 p-4 rounded-md font-sans text-sm">
                        {assistance?.nearbyHospitals}
                     </pre>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assistance & Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{assistance?.assistanceMessage}</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[400px]">
                <ShieldCheck className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 font-bold text-lg">Awaiting Your Report</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                    Enter your location and situation to receive real-time safety information and AI-powered guidance.
                </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
