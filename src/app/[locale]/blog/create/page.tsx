'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Loader2, PenSquare } from 'lucide-react';
import { useState } from 'react';

const blogSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    content: z.string().min(100, "Your story must be at least 100 characters long."),
    imageHint: z.string().min(2, "Please provide a hint for the cover image.")
});

export default function CreateBlogPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof blogSchema>>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: "",
            content: "",
            imageHint: ""
        }
    });

    async function onSubmit(values: z.infer<typeof blogSchema>) {
        if (!user || !firestore) return;
        setIsSubmitting(true);

        try {
            const newDocRef = doc(collection(firestore, 'blogs'));
            await setDoc(newDocRef, {
                ...values,
                id: newDocRef.id,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous Traveler',
                authorAvatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Post Published!",
                description: "Your story is now live for the community to see.",
            });

            router.push(`/blog/${newDocRef.id}`);

        } catch (error) {
            console.error("Blog post creation failed:", error);
            toast({
                title: "Publishing Failed",
                description: "We couldn't publish your post. Please try again.",
                variant: 'destructive'
            });
            setIsSubmitting(false);
        }
    }
    
    if (isUserLoading) {
        return <div className="flex-1 p-8"><Loader2 className="animate-spin" /></div>
    }

    if (!user) {
        // This should be handled by a proper redirect or a login prompt component
        return (
            <main className="flex-1 p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>You must be logged in to create a blog post.</CardDescription>
                    </CardHeader>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex-1 p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Create a New Blog Post</CardTitle>
                    <CardDescription>Share your travel story with the TripMind community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Post Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. My Unforgettable Week in Bali" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Story</FormLabel>
                                        <FormControl>
                                            <Textarea rows={10} placeholder="Share your adventure..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="imageHint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image Hint</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 'Sunset over rice paddies'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <PenSquare className="mr-2 h-4 w-4" />
                                        Publish Story
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    );
}
