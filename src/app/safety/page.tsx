
'use client';

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
import { Loader2, Shield, Heart, Hospital } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  location: z.string().min(2, "Please enter your location."),
  situation: z.string().min(10, "Please describe your situation in a bit more detail."),
});

export default function SafetyPage() {
  const [assistance, setAssistance] = useState<GetSafetyAssistanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      situation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssistance(null);
    try {
      const result = await getSafetyAssistance({
        location: values.location,
        details: values.situation,
      });
      setAssistance(result);
    } catch (error) {
      console.error("Failed to get assistance:", error);
      toast({
        title: "Error",
        description: "Could not get assistance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Safety Companion</h1>
        <p className="text-muted-foreground max-w-2xl">
          Feeling lost or need help? Your AI safety companion, powered by local knowledge, is here to assist you in any situation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Get Assistance</CardTitle>
            <CardDescription>Describe your situation, and our AI will provide guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Madrid, Spain" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's the situation?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I'm lost near the train station and my phone is about to die."
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
                      Getting Help...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Get Help
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
            <h2 className="font-headline text-2xl font-bold">Your Safety Guide</h2>
            
            {isLoading && (
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                         <CardContent>
                          <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                         <CardContent>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            )}
            
            {!isLoading && !assistance && (
              <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full min-h-[300px]">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your safety guidance will appear here.</p>
              </Card>
            )}

            {assistance && (
                <div className="space-y-6">
                    {assistance.safetyAlert && (
                        <Card className="border-yellow-500/50 bg-yellow-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600"><Shield className="h-5 w-5"/> Safety Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-yellow-700">{assistance.safetyAlert}</p>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><Heart className="h-5 w-5"/> Your Local Supporter's Guidance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{assistance.assistanceMessage}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Hospital className="h-5 w-5"/> Nearby Hospitals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{assistance.nearbyHospitals}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
