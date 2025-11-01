
"use client";

import { useState, useMemo } from "react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Users, ArrowLeft, HandCoins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type Trip = {
    id: string;
    tripTitle: string;
    expenseParticipants?: string[];
}

type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  isSettlement?: boolean;
  paidTo?: string;
  createdAt: any;
};

type Balance = {
  name: string;
  amount: number;
};

function SettleDebtDialog({ participants, tripDocRef }: { participants: string[], tripDocRef: any }) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useUser();

    const handleSettle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to || !amount || !tripDocRef || !user) {
            alert("Please fill out all settlement fields.");
            return;
        }

        const settlementData = {
            description: `${from} paid ${to}`,
            amount: parseFloat(amount),
            paidBy: from,
            paidTo: to,
            isSettlement: true,
            createdAt: serverTimestamp(),
            userId: user.uid,
            tripId: tripDocRef.id
        };
        
        await addDoc(collection(tripDocRef, 'expenses'), settlementData);
        
        // Reset and close
        setFrom('');
        setTo('');
        setAmount('');
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={participants.length < 2}><HandCoins className="mr-2 h-4 w-4"/> Settle Debt</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settle a Debt</DialogTitle>
                    <DialogDescription>Record a payment made between two participants.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSettle} className="space-y-4 py-4">
                     <div>
                        <Label>From (Who Paid)</Label>
                        <Select onValueChange={setFrom} value={from}>
                            <SelectTrigger><SelectValue placeholder="Select who paid" /></SelectTrigger>
                            <SelectContent>
                                {participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label>To (Who Received)</Label>
                        <Select onValueChange={setTo} value={to}>
                            <SelectTrigger><SelectValue placeholder="Select who received the money" /></SelectTrigger>
                            <SelectContent>
                                {participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label>Amount</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 50.00" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Record Settlement</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ExpenseWorkspacePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const tripId = params.tripId as string;

  // State for the "add participant" form
  const [newParticipant, setNewParticipant] = useState("");
  
  // State for the "add expense" form
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [paidBy, setPaidBy] = useState<string>("");

  // Firestore ref for the trip document
  const tripDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !tripId) return null;
    return doc(firestore, 'users', user.uid, 'trips', tripId);
  }, [user, firestore, tripId]);
  
  // Firestore ref for the expenses subcollection
  const expensesQuery = useMemoFirebase(() => {
    if (!tripDocRef) return null;
    return query(collection(tripDocRef, 'expenses'));
  }, [tripDocRef]);
  
  // Hooks to get live data from Firestore
  const { data: trip, isLoading: isLoadingTrip } = useDoc<Trip>(tripDocRef);
  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesQuery);

  const participants = useMemo(() => trip?.expenseParticipants || [], [trip]);
  const isLoading = isLoadingTrip || isLoadingExpenses;

  const handleAddParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant) && tripDocRef && firestore) {
      const updatedData = { expenseParticipants: arrayUnion(newParticipant) };
      updateDoc(tripDocRef, updatedData)
        .then(() => {
          setNewParticipant("");
        })
        .catch(() => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: tripDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
          }));
        });
    }
  };
  
  const handleRemoveParticipant = (name: string) => {
    if (tripDocRef && firestore) {
      const updatedData = { expenseParticipants: arrayRemove(name) };
      updateDoc(tripDocRef, updatedData)
        .catch(() => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: tripDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
          }));
        });
    }
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripDocRef || !firestore || !user) return;
    
    const numAmount = parseFloat(amount);
    if (!description || !numAmount || !paidBy) {
      alert("Please fill out all expense fields.");
      return;
    }
    
    const expenseData = {
      description,
      amount: numAmount,
      paidBy,
      tripId,
      userId: user.uid,
      createdAt: serverTimestamp(),
      isSettlement: false,
    };

    addDoc(collection(tripDocRef, 'expenses'), expenseData)
      .then(() => {
        // Reset form on success
        setDescription("");
        setAmount("");
        setPaidBy("");
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${tripDocRef.path}/expenses`,
          operation: 'create',
          requestResourceData: expenseData,
        }));
      });
  };

  const handleRemoveExpense = (expenseId: string) => {
    if (!tripDocRef) return;
    const expenseDocRef = doc(tripDocRef, 'expenses', expenseId);
    deleteDoc(expenseDocRef)
        .catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: expenseDocRef.path,
                operation: 'delete',
            }));
        });
  };

  const totalSpent = useMemo(() => {
    return expenses?.filter(e => !e.isSettlement).reduce((acc, expense) => acc + expense.amount, 0) || 0;
  }, [expenses]);
  
  const balances = useMemo<Balance[]>(() => {
    if (!participants || participants.length === 0 || !expenses) return [];
  
    const totalContributions: { [key: string]: number } = {};
    participants.forEach(p => totalContributions[p] = 0);
    
    expenses.forEach(e => {
        if(e.isSettlement) {
            // Money moves from 'paidBy' (payer) to 'paidTo' (receiver)
            // Payer's contribution increases, receiver's decreases
            if(e.paidBy in totalContributions) totalContributions[e.paidBy] += e.amount;
            if(e.paidTo && e.paidTo in totalContributions) totalContributions[e.paidTo] -= e.amount;
        } else {
            // This is a normal expense
            if(e.paidBy in totalContributions) {
                totalContributions[e.paidBy] += e.amount;
            }
        }
    });

    const sharePerPerson = totalSpent / participants.length;

    return participants.map(p => ({
        name: p,
        amount: totalContributions[p] - sharePerPerson
    }));

  }, [expenses, participants, totalSpent]);

  if (isLoading) {
      return (
          <main className="flex-1 p-4 md:p-8 space-y-8">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-64 lg:col-span-1" />
                <Skeleton className="h-96 lg:col-span-2" />
              </div>
          </main>
      )
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/expenses"><ArrowLeft className="mr-2"/> Back to All Splitters</Link>
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Expense Splitter: {trip?.tripTitle}</h1>
        <p className="text-muted-foreground max-w-2xl">Keep track of who paid for what. Add expenses below to automatically calculate the balance.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users/> Participants</CardTitle>
              <CardDescription>Add or remove people sharing the expenses for this trip.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                  {participants.map(p => (
                      <div key={p} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                          <span>{p}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveParticipant(p)}>
                              <Trash2 className="h-4 w-4 text-destructive"/>
                          </Button>
                      </div>
                  ))}
              </div>
              <div className="flex gap-2">
                  <Input 
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      placeholder="Add new participant name..."
                      onKeyDown={(e) => {if (e.key === 'Enter') handleAddParticipant()}}
                  />
                  <Button onClick={handleAddParticipant}>Add Participant</Button>
              </div>
          </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Dinner at pizzeria" />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 80.00" />
                </div>
                <div>
                  <Label htmlFor="paidBy">Paid By</Label>
                  <Select onValueChange={setPaidBy} value={paidBy} disabled={participants.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who paid" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={participants.length === 0}>
                  <PlusCircle className="mr-2" /> Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Expense Log</CardTitle>
              <CardDescription>A list of all shared expenses for this trip.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses && expenses.length > 0 ? expenses.map(expense => (
                    <TableRow key={expense.id} className={expense.isSettlement ? "bg-green-50 dark:bg-green-900/20" : ""}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.paidBy}</TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveExpense(expense.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No expenses added yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-end font-bold text-lg">
                Total Shared Cost: ${totalSpent.toFixed(2)}
            </CardFooter>
          </Card>

          {balances.length > 0 && (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Balance Summary</CardTitle>
                            <CardDescription>Calculations based on an equal split. Positive means they are owed money, negative means they owe money.</CardDescription>
                        </div>
                        <SettleDebtDialog participants={participants} tripDocRef={tripDocRef} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {balances.map(b => (
                            <div key={b.name} className={`p-4 rounded-lg text-center ${b.amount >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                <p className="font-bold">{b.name}</p>
                                <p className={`text-2xl font-bold ${b.amount >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {b.amount >= 0 ? `+` : ``}{b.amount.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
// final commit
