
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from "@/hooks/use-translations";
import { PlusCircle, Trash2, Users } from "lucide-react";

type Expense = {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
};

type Balance = {
  name: string;
  amount: number;
};

export default function ExpensesPage() {
  const t = useTranslations("ExpensesPage");

  // State Management
  const [participants, setParticipants] = useState<string[]>(["Aritra", "Hardik"]);
  const [newParticipant, setNewParticipant] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [paidBy, setPaidBy] = useState<string>("");

  const handleAddParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant("");
    }
  };
  
  const handleRemoveParticipant = (name: string) => {
    setParticipants(participants.filter(p => p !== name));
    // Also remove expenses paid by the removed participant
    setExpenses(expenses.filter(e => e.paidBy !== name));
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description || !numAmount || !paidBy) {
      alert("Please fill out all expense fields.");
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: numAmount,
      paidBy,
    };
    setExpenses([...expenses, newExpense]);

    // Reset form
    setDescription("");
    setAmount("");
    setPaidBy("");
  };

  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [expenses]);
  
  const balances = useMemo<Balance[]>(() => {
    if (participants.length === 0 || expenses.length === 0) return [];
  
    const totalContributions: { [key: string]: number } = {};
    participants.forEach(p => totalContributions[p] = 0);
    expenses.forEach(e => {
        totalContributions[e.paidBy] = (totalContributions[e.paidBy] || 0) + e.amount;
    });

    const sharePerPerson = totalSpent / participants.length;

    return participants.map(p => ({
        name: p,
        amount: totalContributions[p] - sharePerPerson
    }));

  }, [expenses, participants, totalSpent]);

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">{t('description')}</p>
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
                      placeholder="Add new participant..."
                  />
                  <Button onClick={handleAddParticipant}>Add</Button>
              </div>
          </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('addExpenseTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="description">{t('descriptionLabel')}</Label>
                  <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="amount">{t('amountLabel')}</Label>
                  <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('amountPlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="paidBy">{t('paidByLabel')}</Label>
                  <Select onValueChange={setPaidBy} value={paidBy}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('paidByPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2" /> {t('addExpenseButton')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('expenseLogTitle')}</CardTitle>
              <CardDescription>{t('expenseLogDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tableHeaderDescription')}</TableHead>
                    <TableHead>{t('tableHeaderPaidBy')}</TableHead>
                    <TableHead className="text-right">{t('tableHeaderAmount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length > 0 ? expenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.paidBy}</TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">{t('noExpenses')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-end font-bold text-lg">
                {t('totalSpent')} ${totalSpent.toFixed(2)}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('balanceSummaryTitle')}</CardTitle>
              <CardDescription>{t('balanceSummaryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances.map(b => (
                        <div key={b.name} className={`p-4 rounded-lg text-center ${b.amount >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <p className="font-bold">{b.name}</p>
                            <p className={`text-2xl font-bold ${b.amount >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {b.amount >= 0 ? `+` : ``}${b.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
