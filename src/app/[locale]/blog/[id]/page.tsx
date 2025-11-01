
'use client'

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PexelsImage } from '@/components/pexels-image';
import { format } from 'date-fns';
import type { Blog } from '@/lib/types';
import { Calendar, User } from 'lucide-react';

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();

  const blogDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'blogs', params.id);
  }, [firestore, params.id]);

  const { data: blog, isLoading } = useDoc<Blog>(blogDocRef);

  if (isLoading) {
    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-[400px] w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
            </div>
        </main>
    );
  }
  
  if (!blog) {
    notFound();
  }

  const getCreatedAtDate = (blog: Blog) => {
    if (blog.createdAt?.toDate) { // It's a Firestore Timestamp from client-side fetch
      return blog.createdAt.toDate();
    }
    return new Date(blog.createdAt); // It's an ISO string from server-side rendering
  };


  return (
    <main className="flex-1 bg-background">
        <div className="relative h-[300px] md:h-[500px] w-full">
            <PexelsImage
                query={blog.imageHint || 'travel story'}
                alt={blog.title}
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      <div className="container mx-auto px-4 py-8 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-lg shadow-xl p-8">
                <h1 className="font-headline text-3xl md:text-5xl font-bold text-foreground">
                    {blog.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={blog.authorAvatar} alt={blog.authorName}/>
                            <AvatarFallback><User/></AvatarFallback>
                        </Avatar>
                        <span>{blog.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4"/>
                        <span>{format(getCreatedAtDate(blog), 'PPP')}</span>
                    </div>
                </div>

                <div className="prose prose-lg max-w-none mt-8 text-foreground prose-p:text-foreground prose-headings:text-foreground">
                    <p>{blog.content}</p>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
// final commit
