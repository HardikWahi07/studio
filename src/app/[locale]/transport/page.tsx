import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Train, Bus, Clock, DollarSign, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

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

export default function TransportPage() {
  const t = useTranslations('TransportPage');

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('description')}
          <br />
          <span className="text-xs">{t('mockDataNotice')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('routeTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-lg font-bold">{t('fromLocation')}</div>
            <div className="text-muted-foreground">{t('to')}</div>
            <div className="text-lg font-bold">{t('toLocation')}</div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {transportOptions.map((option) => (
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
                    <span className="text-xs text-muted-foreground">{t('duration')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{option.cost}</span>
                    <span className="text-xs text-muted-foreground">{t('cost')}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-5 flex items-center">
                      <CarbonFootprint value={option.carbonValue} />
                    </div>
                    <span className="font-semibold">{option.carbon}</span>
                    <span className="text-xs text-muted-foreground">{t('carbon')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
