'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSafetyAssistance, GetSafetyAssistanceOutput } from '@/ai/flows/get-safety-assistance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield, AlertTriangle, Hospital, LifeBuoy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  location: z.string().min(2, "Location is required."),
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
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Safety Companion
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Feeling lost or need help? Your AI safety companion, powered by local knowledge, is here to assist you in any situation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
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
                        <FormLabel>What is the situation?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., I'm lost near the train station"
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
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        Get Help
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-8">
            {(isLoading || assistance) && (
            <Card>
              <CardHeader>
                <CardTitle>Your Safety Guide</CardTitle>
              </CardHeader>
              <CardContent>
                 {isLoading && (
                  <div className="space-y-4">
                    <div className="h-6 w-1/3 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded-md" />
                  </div>
                )}
                {assistance && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold flex items-center gap-2 mb-2"><AlertTriangle className="text-yellow-500" />Safety Alerts</h3>
                      <p className="text-muted-foreground">{assistance.safetyAlert}</p>
                    </div>
                    <div>
                      <h3 className="font-bold flex items-center gap-2 mb-2"><Hospital className="text-red-500" />Nearby Hospitals</h3>
                      <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">{assistance.nearbyHospitals}</pre>
                    </div>
                    <div>
                      <h3 className="font-bold flex items-center gap-2 mb-2"><LifeBuoy className="text-primary"/>Your Local Supporter's Guidance</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{assistance.assistanceMessage}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {!isLoading && !assistance && (
              <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your safety guide will appear here.</p>
              </Card>
            )}

        </div>
      </div>
    </main>
  );
}
