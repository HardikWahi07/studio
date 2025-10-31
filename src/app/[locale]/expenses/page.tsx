
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PexelsImage } from '@/components/pexels-image';
import type { PlanTripOutput } from '@/ai/flows/plan-trip.types';

type Trip = PlanTripOutput & {
  id: string;
  destination: string;
  tripTitle: string;
};

function SelectTripDialog({ onTripSelected }: { onTripSelected: (trip: Trip) => void }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const tripsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'trips'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: trips, isLoading } = useCollection<Trip>(tripsQuery);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select a Trip</DialogTitle>
        <DialogDescription>Choose a trip to create an expense splitter for.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2 py-4 max-h-[60vh] overflow-y-auto">
        {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
        {!isLoading && !trips?.length && (
          <div className="text-center text-muted-foreground p-4">
            <p>No trips found.</p>
            <Button variant="link" asChild><Link href="/trip-planner">Plan a new trip</Link></Button>
          </div>
        )}
        {trips?.map(trip => (
          <DialogTrigger asChild key={trip.id}>
            <button
              onClick={() => onTripSelected(trip)}
              className="w-full text-left p-2 rounded-md hover:bg-accent flex items-center gap-4"
            >
                <div className="w-16 h-12 rounded-md overflow-hidden relative">
                    <PexelsImage query={trip.destination} alt={trip.destination} fill className="object-cover" />
                </div>
                <div className='flex-1'>
                    <p className="font-semibold">{trip.tripTitle}</p>
                    <p className="text-sm text-muted-foreground">{trip.destination}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
        ))}
      </div>
    </DialogContent>
  );
}

export default function ExpensesDashboardPage() {
  const { user, isUserLoading } = useUser();
  const [activeSplitters, setActiveSplitters] = useState<Trip[]>([]);

  const handleTripSelected = (trip: Trip) => {
    // Avoid adding duplicates
    if (!activeSplitters.some(t => t.id === trip.id)) {
      setActiveSplitters(prev => [...prev, trip]);
    }
  };

  if (isUserLoading) {
    return <div className="flex-1 p-8 flex justify-center items-center"><Loader2 className="animate-spin" /></div>
  }
  
  if (!user) {
        return (
            <main className="flex-1 p-4 md:p-8">
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[400px]">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 font-bold text-lg">Please Log In</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm">
                        You need to be logged in to manage expense splitters.
                    </p>
                </Card>
            </main>
        )
    }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold">Group Expense Splitter</h1>
          <p className="text-muted-foreground max-w-2xl">Create and manage shared expenses for your trips.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" /> New Splitter
            </Button>
          </DialogTrigger>
          <SelectTripDialog onTripSelected={handleTripSelected} />
        </Dialog>
      </div>

      {activeSplitters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 font-bold text-lg">No Active Splitters</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
                Click "New Splitter" to create a shared expense workspace for one of your trips.
            </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeSplitters.map(trip => (
            <Link key={trip.id} href={`/expenses/${trip.id}/workspace`}>
              <Card className="h-full group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                    <div className="aspect-video w-full relative">
                        <PexelsImage query={trip.destination} alt={trip.destination} fill className="rounded-t-lg object-cover" />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-xl group-hover:text-primary">{trip.tripTitle}</CardTitle>
                  <CardDescription>{trip.destination}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
