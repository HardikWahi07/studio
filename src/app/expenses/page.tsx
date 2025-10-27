"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Scale } from "lucide-react";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  paidBy: z.string().min(1, "Please select who paid."),
});

type Expense = z.infer<typeof expenseSchema> & { id: number };

const participants = ["You", "Alex", "Mia", "Sam"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      paidBy: "",
    },
  });

  function addExpense(values: z.infer<typeof expenseSchema>) {
    setExpenses([...expenses, { ...values, id: Date.now() }]);
    form.reset();
  }

  function removeExpense(id: number) {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const sharePerPerson = totalSpent > 0 ? totalSpent / participants.length : 0;

  const balances = participants.map(participant => {
    const paid = expenses
      .filter(e => e.paidBy === participant)
      .reduce((acc, e) => acc + e.amount, 0);
    return {
      name: participant,
      balance: paid - sharePerPerson,
    };
  });

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Group Expense Splitter</h1>
        <p className="text-muted-foreground max-w-2xl">
          Keep track of who paid for what. Add expenses below to automatically calculate the balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addExpense)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dinner at pizzeria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 80.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {participants.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
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
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>{expense.paidBy}</TableCell>
                        <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No expenses added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="font-bold text-lg">
                <div className="flex justify-between w-full">
                    <span>Total Spent:</span>
                    <span>${totalSpent.toFixed(2)}</span>
                </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5"/> Balance Summary</CardTitle>
              <CardDescription>
                Calculations based on equal splitting. Positive means they are owed money, negative means they owe money.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {balances.map(p => (
                   <li key={p.name} className="flex justify-between items-center p-3 rounded-md bg-secondary">
                        <span className="font-medium">{p.name}</span>
                        <span className={`font-bold ${p.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {p.balance >= 0 ? '+' : '-'}${Math.abs(p.balance).toFixed(2)}
                        </span>
                   </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
