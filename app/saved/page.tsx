"use client";

import { useEffect, useState } from "react";
import { CompetitionCard, CompetitionCardSkeleton, type CompetitionCardProps } from "@/components/CompetitionCard";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SavedPage() {
  const [competitions, setCompetitions] = useState<CompetitionCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/competitions/saved")
      .then((r) => {
        if (r.status === 401) throw new Error("auth");
        return r.json();
      })
      .then(setCompetitions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">İzleme Listem</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CompetitionCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="text-center py-20 space-y-4">
        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">İzleme Listesi</h1>
        <p className="text-muted-foreground">İzleme listenizi görmek için giriş yapmalısınız.</p>
        <Link href="/auth/signin">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">İzleme Listem</h1>
        <p className="text-muted-foreground">Henüz kaydettiğiniz yarışma yok.</p>
        <Link href="/">
          <Button>Yarışmaları Keşfet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">İzleme Listem</h1>
        <span className="text-sm text-muted-foreground">{competitions.length} yarışma</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitions.map((c) => (
          <CompetitionCard
            key={c.id}
            id={c.id}
            title={c.title}
            organization={c.organization}
            description={c.description}
            category={c.category}
            reward={c.reward}
            currency={c.currency}
            deadline={c.deadline}
            country={c.country}
            isSaved
          />
        ))}
      </div>
    </div>
  );
}
