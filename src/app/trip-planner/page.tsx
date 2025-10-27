
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Train, Bus, Leaf, Sparkles, Star, Calendar, Users, Briefcase } from "lucide-react";
import { PexelsImage } from "@/components/pexels-image";

const transportOptions = [
    {
      mode: 'Flight',
      icon: <Plane className="h-6 w-6 text-primary" />,
      duration: '2h 15m',
      cost: '$250',
      carbon: 'High',
      carbonValue: 3,
      recommendation: null,
    },
    {
      mode: 'Train',
      icon: <Train className="h-6 w-6 text-primary" />,
      duration: '8h 30m',
      cost: '$120',
      carbon: 'Low',
      carbonValue: 1,
      recommendation: 'Eco-Friendly Choice',
    },
    {
      mode: 'Bus',
      icon: <Bus className="h-6 w-6 text-primary" />,
      duration: '12h 0m',
      cost: '$75',
      carbon: 'Medium',
      carbonValue: 2,
      recommendation: 'Budget Choice',
    },
  ];

const CarbonFootprint = ({ value }: { value: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(3)].map((_, i) => (
        <Leaf
          key={i}
          className={`h-4 w-4 ${i < value ? 'text-green-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
);

export default function TripPlannerPage() {
    return (
        <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">AI Trip Planner</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Find the best combination of transport and accommodation for your next adventure.
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" placeholder="New York, NY" defaultValue="New York, NY" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" placeholder="Chicago, IL" defaultValue="Chicago, IL" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="departure">Departure</Label>
                                <Input id="departure" type="date" defaultValue={new Date().toISOString().split('T')[0]}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="travelers">Travelers & Class</Label>
                                 <Select defaultValue="1-economy">
                                    <SelectTrigger id="travelers">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-economy">1 Traveler, Economy</SelectItem>
                                        <SelectItem value="2-economy">2 Travelers, Economy</SelectItem>
                                        <SelectItem value="1-business">1 Traveler, Business</SelectItem>
                                        <SelectItem value="2-business">2 Travelers, Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button className="w-full lg:w-auto">Search</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="font-headline text-2xl font-bold">Transport Options</h2>
                    <Card className="bg-primary/10 border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Sparkles className="h-6 w-6"/>
                                Best Eco Mix
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <p className="md:col-span-3 text-muted-foreground text-left">
                                Combine a high-speed train with a short-haul flight to get the best balance of speed, cost, and environmental impact.
                            </p>
                            <div className="font-semibold">6h 45m</div>
                            <div className="font-semibold">$180</div>
                            <div className="flex justify-center"><CarbonFootprint value={1} /></div>
                        </CardContent>
                    </Card>

                    {transportOptions.map(option => (
                        <Card key={option.mode}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {option.icon}
                                    <div>
                                        <h3 className="font-bold">{option.mode}</h3>
                                        <p className="text-sm text-muted-foreground">{option.recommendation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-center">
                                    <div>
                                        <p className="font-bold">{option.duration}</p>
                                        <p className="text-muted-foreground">Duration</p>
                                    </div>
                                    <div>
                                        <p className="font-bold">{option.cost}</p>
                                        <p className="text-muted-foreground">Cost</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <CarbonFootprint value={option.carbonValue} />
                                        <p className="text-muted-foreground">Carbon</p>
                                    </div>
                                </div>
                                <Button variant="outline">Select</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1 space-y-6">
                     <h2 className="font-headline text-2xl font-bold">Recommended Stay</h2>
                     <Card>
                         <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                            <PexelsImage query="luxury hotel chicago" alt="Hotel in Chicago" className="w-full h-full object-cover" width={400} height={225} />
                         </div>
                         <CardContent className="p-4">
                             <h3 className="font-bold">The Peninsula Chicago</h3>
                             <div className="flex items-center text-sm text-muted-foreground mt-1">
                                 <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                                 <span>4.8 (1.2k reviews)</span>
                             </div>
                             <p className="text-lg font-semibold mt-2">$450 / night</p>
                             <Button className="w-full mt-4">View Hotel</Button>
                         </CardContent>
                     </Card>
                </div>
            </div>
        </main>
    );
}
