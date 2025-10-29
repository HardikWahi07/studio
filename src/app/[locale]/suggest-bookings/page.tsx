
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Train, Bus, Clock, DollarSign, Leaf, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { CityCombobox } from "@/components/city-combobox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const transportOptions = [
  {
    mode: "Flight",
    icon: <Plane className="h-8 w-8 text-primary" />,
    duration: "2h 15m",
    cost: "$250",
    carbon: "High",
    carbonValue: 3,
    recommendation: null,
  },
  {
    mode: "Train",
    icon: <Train className="h-8 w-8 text-primary" />,
    duration: "8h 30m",
    cost: "$120",
    carbon: "Low",
    carbonValue: 1,
    recommendation: "Eco-Friendly Choice",
  },
  {
    mode: "Bus",
    icon: <Bus className="h-8 w-8 text-primary" />,
    duration: "12h 0m",
    cost: "$75",
    carbon: "Medium",
    carbonValue: 2,
    recommendation: "Budget Choice",
  },
];

const CarbonFootprint = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(3)].map((_, i) => (
        <Leaf
          key={i}
          className={`h-4 w-4 ${i < value ? "text-primary fill-current" : "text-muted-foreground/50"}`}
        />
      ))}
    </div>
  );
};

export default function SuggestBookingsPage() {
  const t = useTranslations('SuggestBookingsPage');
  const tNav = useTranslations('TransportPage');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    setIsLoading(true);
    setShowResults(false);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
    }, 1500)
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{tNav('routeTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">{tNav('from')}</label>
                    <CityCombobox value={from} onValueChange={setFrom} />
                </div>
                 <div className="md:col-span-2">
                    <label className="text-sm font-medium">{tNav('to')}</label>
                    <CityCombobox value={to} onValueChange={setTo} />
                </div>
                <Button type="submit" className="md:col-span-1 w-full" disabled={isLoading}>
                    <Search className="mr-2"/>
                    {isLoading ? "Searching..." : t('findButton')}
                </Button>
            </form>
        </CardContent>
      </Card>
      

      {(isLoading || showResults) && (
        <div className="space-y-6">
            {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            
            {showResults && transportOptions.map((option) => (
                <Card key={option.mode} className="relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                {option.recommendation && (
                    <Badge className="absolute top-4 right-4">{option.recommendation}</Badge>
                )}
                <CardHeader className="flex-row items-center gap-4">
                    {option.icon}
                    <CardTitle className="font-headline text-2xl">{option.mode}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{option.duration}</span>
                        <span className="text-xs text-muted-foreground">{tNav('duration')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{option.cost}</span>
                        <span className="text-xs text-muted-foreground">{tNav('cost')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-5 flex items-center">
                        <CarbonFootprint value={option.carbonValue} />
                        </div>
                        <span className="font-semibold">{option.carbon}</span>
                        <span className="text-xs text-muted-foreground">{tNav('carbon')}</span>
                    </div>
                    </div>
                </CardContent>
                </Card>
            ))}
        </div>
        )}
    </main>
  );
}
