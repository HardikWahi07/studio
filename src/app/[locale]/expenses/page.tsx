
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Users, FileDigit, Landmark, VenetianMask } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

type Participant = {
  id: number;
  name: string;
  contribution: number;
};

type Transaction = {
  from: string;
  to: string;
  amount: number;
};

export default function ExpensesPage() {
  const t = useTranslations('ExpensesPage');
  const [step, setStep] = useState(1);
  const [numPeople, setNumPeople] = useState(2);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initialParticipants = Array.from({ length: numPeople }, (_, i) => ({
      id: i,
      name: `Person ${i + 1}`,
      contribution: 0,
    }));
    setParticipants(initialParticipants);
    setStep(2);
  };

  const handleParticipantNameChange = (id: number, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };
  
  const handleParticipantContributionChange = (id: number, contribution: string) => {
      const value = parseFloat(contribution);
      setParticipants(
          participants.map(p => p.id === id ? { ...p, contribution: isNaN(value) ? 0 : value } : p)
      );
  };

  const calculateExpenses = () => {
    const totalContributions = participants.reduce((acc, p) => acc + p.contribution, 0);

    if (Math.abs(totalCost - totalContributions) > 0.01) {
      alert(t('alertCostMismatch'));
      return;
    }

    const sharePerPerson = totalCost / participants.length;

    const balances = participants.map(p => ({
      name: p.name,
      balance: p.contribution - sharePerPerson,
    }));

    const debtors = balances.filter(p => p.balance < 0).map(p => ({...p})).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(p => p.balance > 0).map(p => ({...p})).sort((a, b) => b.balance - a.balance);

    const newTransactions: Transaction[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amountToTransfer = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amountToTransfer > 0.01) {
        newTransactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: amountToTransfer,
        });
      }

      debtor.balance += amountToTransfer;
      creditor.balance -= amountToTransfer;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }
    
    setTransactions(newTransactions);
    setStep(3);
  };
  
  const cardVariants = {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 }
  };

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">{t('description')}</p>
      </div>

       <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
                {step === 1 && (
                     <motion.div key="step1" variants={cardVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users /> {t('step1Title')}</CardTitle>
                                <CardDescription>{t('step1Description')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSetupSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                    <Label htmlFor="numPeople">{t('numPeopleLabel')}</Label>
                                    <Input
                                        id="numPeople"
                                        type="number"
                                        value={numPeople}
                                        onChange={e => setNumPeople(Math.max(2, parseInt(e.target.value) || 2))}
                                        min="2"
                                    />
                                    </div>
                                    <Button type="submit" className="w-full">
                                    {t('nextButton')} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                
                {step === 2 && (
                    <motion.div key="step2" variants={cardVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileDigit /> {t('step2Title')}</CardTitle>
                                <CardDescription>{t('step2Description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="totalCost">{t('totalCostLabel')}</Label>
                                    <Input
                                        id="totalCost"
                                        type="number"
                                        placeholder="0.00"
                                        onChange={e => setTotalCost(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold">{t('contributionsTitle')}</h4>
                                    <div className="space-y-4">
                                        {participants.map(p => (
                                            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end p-4 border rounded-lg">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`p-name-${p.id}`}>{t('participantNameLabel', {number: p.id + 1})}</Label>
                                                    <Input
                                                        id={`p-name-${p.id}`}
                                                        value={p.name}
                                                        onChange={e => handleParticipantNameChange(p.id, e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`p-contrib-${p.id}`}>{t('contributionLabel')}</Label>
                                                    <Input
                                                        id={`p-contrib-${p.id}`}
                                                        type="number"
                                                        placeholder="0.00"
                                                        onChange={e => handleParticipantContributionChange(p.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('backButton')}
                                </Button>
                                <Button onClick={calculateExpenses}>
                                    {t('calculateButton')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={cardVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Landmark /> {t('step3Title')}</CardTitle>
                                <CardDescription>{t('step3Description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {transactions.length > 0 ? (
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {transactions.map((t, i) => (
                                            <Card key={i} className="p-4 bg-secondary">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col items-center text-center">
                                                        <VenetianMask className="w-8 h-8 mb-1" />
                                                        <span className="font-bold">{t.from}</span>
                                                        <span className="text-xs text-muted-foreground">{("owes")}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <ArrowRight className="w-8 h-8 text-primary" />
                                                        <span className="font-bold text-primary">${t.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center text-center">
                                                        <Landmark className="w-8 h-8 mb-1" />
                                                        <span className="font-bold">{t.to}</span>
                                                        <span className="text-xs text-muted-foreground">{("is owed")}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground">{t('allSettled')}</p>
                                )}
                            </CardContent>
                             <CardFooter>
                                <Button variant="outline" onClick={() => { setStep(1); setTransactions([]); }}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('startOverButton')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </main>
  );
}
