import { Trophy, Clock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  endingThisWeek: number;
  competitionsWithRewards: number;
}

async function getStats(): Promise<Stats> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/stats`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { total: 0, endingThisWeek: 0, competitionsWithRewards: 0 };
  }
}

export async function StatsRow() {
  const stats = await getStats();

  const items = [
    {
      icon: Globe,
      label: "Aktif Yarışma",
      value: stats.total.toString(),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Clock,
      label: "Bu Hafta Bitiyor",
      value: stats.endingThisWeek.toString(),
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      icon: Trophy,
      label: "Ödüllü Yarışma",
      value: stats.competitionsWithRewards.toString(),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
