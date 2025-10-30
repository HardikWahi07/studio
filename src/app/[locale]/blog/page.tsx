
'use client'

import { useState, useEffect, useRef } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, PenSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';
import { PexelsImage } from '@/components/pexels-image';
import type { Blog } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useOnVisible } from '@/hooks/use-on-visible';
import { cn } from '@/lib/utils';

export default function BlogPage() {
    const t = useTranslations('BlogPage');
    const locale = useLocale();
    const { user } = useUser();
    const firestore = useFirestore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const containerRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnVisible(containerRef, false);

    const blogsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // For simplicity, we fetch all and filter client-side.
        // For a larger scale app, you would use Firestore's search capabilities
        // with a service like Algolia.
        return query(collection(firestore, 'blogs'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: blogs, isLoading } = useCollection<Blog>(blogsQuery);

    const filteredBlogs = blogs?.filter(blog => 
        blog.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const getCreatedAtDate = (blog: Blog) => {
      if (blog.createdAt?.toDate) { // It's a Firestore Timestamp
        return blog.createdAt.toDate();
      }
      return new Date(blog.createdAt); // It's likely an ISO string from server-side rendering
    };

    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground max-w-2xl">{t('description')}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder={t('searchPlaceholder')} 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {user && (
                    <Button asChild>
                        <Link href={`/${locale}/blog/create`}>
                            <PenSquare className="mr-2 h-4 w-4" />
                            {t('createButton')}
                        </Link>
                    </Button>
                )}
            </div>

            <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && [...Array(6)].map((_, i) => (
                    <Card key={i}><Skeleton className="h-96 w-full"/></Card>
                ))}
                
                {!isLoading && filteredBlogs && filteredBlogs.length > 0 && filteredBlogs.map((blog, index) => {
                    const readTime = Math.ceil(blog.content.split(' ').length / 200);
                    return (
                        <Card key={blog.id} className={cn("flex flex-col group overflow-hidden fade-in-up", { 'visible': isVisible })} style={{ transitionDelay: `${index * 100}ms` }}>
                           <CardHeader className="p-0">
                                <Link href={`/${locale}/blog/${blog.id}`} className="block">
                                    <div className="aspect-video w-full overflow-hidden">
                                        <PexelsImage 
                                            query={blog.imageHint || 'travel journal'} 
                                            alt={blog.title} 
                                            width={400} height={225} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </Link>
                           </CardHeader>
                           <CardContent className="p-6 flex-grow">
                                <Link href={`/${locale}/blog/${blog.id}`} className="block">
                                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{blog.title}</CardTitle>
                                </Link>
                                <p className="text-muted-foreground text-sm mt-2 line-clamp-3">{blog.content}</p>
                           </CardContent>
                           <CardFooter className="p-6 pt-0 flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={blog.authorAvatar} alt={blog.authorName} />
                                        <AvatarFallback>{blog.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{blog.authorName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(getCreatedAtDate(blog), 'PPP')}
                                        </p>
                                    </div>
                               </div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="w-4 h-4"/> {readTime} min
                                </div>
                           </CardFooter>
                        </Card>
                    )
                })}
            </div>
            
            {!isLoading && (!filteredBlogs || filteredBlogs.length === 0) && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">{t('noPosts')}</p>
                </div>
            )}
        </main>
    )
}
