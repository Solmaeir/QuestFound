"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, Clock, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel, cn, daysUntilDeadline, formatDeadline, formatReward, getDeadlineUrgency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/lib/use-toast";

export interface CompetitionCardProps {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: string;
  reward?: string | null;
  currency?: string | null;
  deadline?: string | null;
  country?: string | null;
  isSaved?: boolean;
  locale?: string;
}

const categoryVariantMap: Record<string, string> = {
  TUBITAK: "tubitak",
  HACKATHON: "hackathon",
  STARTUP: "startup",
  AI_ML: "ai_ml",
  DESIGN: "design",
  OTHER: "other",
};

export function CompetitionCard({
  id,
  title,
  organization,
  description,
  category,
  reward,
  currency,
  deadline,
  country,
  isSaved: initialSaved = false,
  locale = "tr",
}: CompetitionCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const deadlineDate = deadline ? new Date(deadline) : null;
  const urgency = getDeadlineUrgency(deadlineDate);
  const daysLeft = daysUntilDeadline(deadlineDate);

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await fetch("/api/competitions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId: id }),
      });
      if (res.status === 401) {
        toast({ title: "Giriş yapın", description: "Kaydetmek için hesabınıza giriş yapın.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      setSaved(data.saved);
      toast({ title: data.saved ? "Kaydedildi" : "Kaldırıldı", description: data.saved ? `${title} izleme listenize eklendi.` : `${title} izleme listenizden kaldırıldı.` });
    } catch {
      toast({ title: "Hata", description: "İşlem gerçekleştirilemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const urgencyClass =
    urgency === "critical"
      ? "text-red-500 dark:text-red-400"
      : urgency === "warning"
      ? "text-orange-500 dark:text-orange-400"
      : "text-muted-foreground";

  const deadlineBadgeClass =
    urgency === "critical"
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : urgency === "warning"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
      : "";

  return (
    <Link href={`/competitions/${id}`} className="group block h-full">
      <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={categoryVariantMap[category] as "default"} className="shrink-0">
              {categoryLabel(category, locale)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -mr-2 -mt-1"
              onClick={toggleSave}
              disabled={saving}
              aria-label={saved ? "İzlemeden çıkar" : "İzlemeye al"}
            >
              {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
          <h3 className="font-semibold text-base leading-snug mt-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{organization}</p>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0">
          <div className="w-full flex items-center justify-between text-sm">
            <div className={cn("flex items-center gap-1", urgencyClass)}>
              <Clock className="h-3.5 w-3.5" />
              {deadlineDate ? (
                <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", deadlineBadgeClass)}>
                  {urgency === "expired"
                    ? "Süresi doldu"
                    : daysLeft === 0
                    ? "Bugün bitiyor!"
                    : daysLeft === 1
                    ? "1 gün kaldı"
                    : `${daysLeft} gün kaldı`}
                </span>
              ) : (
                <span className="text-xs">Tarih yok</span>
              )}
            </div>
            <div className="flex items-center gap-1 font-medium text-primary">
              <Trophy className="h-3.5 w-3.5" />
              <span>{formatReward(reward, currency)}</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
            <span>{country ?? "Uluslararası"}</span>
            {deadlineDate && <span>{formatDeadline(deadlineDate, locale)}</span>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function CompetitionCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <div className="w-full flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="w-full flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
}
