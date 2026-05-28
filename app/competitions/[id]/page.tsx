import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bookmark, Calendar, ExternalLink, Globe, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitionCard, type CompetitionCardProps } from "@/components/CompetitionCard";
import { categoryLabel, daysUntilDeadline, formatDeadline, formatReward, getDeadlineUrgency } from "@/lib/utils";

async function getCompetition(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/competitions/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

const categoryVariantMap: Record<string, string> = {
  TUBITAK: "tubitak",
  HACKATHON: "hackathon",
  STARTUP: "startup",
  AI_ML: "ai_ml",
  DESIGN: "design",
  OTHER: "other",
};

export default async function CompetitionDetailPage({ params }: { params: { id: string } }) {
  const data = await getCompetition(params.id);
  if (!data) notFound();

  const { competition: c, related } = data;
  const deadlineDate = c.deadline ? new Date(c.deadline) : null;
  const urgency = getDeadlineUrgency(deadlineDate);
  const daysLeft = daysUntilDeadline(deadlineDate);

  const urgencyColor =
    urgency === "critical"
      ? "text-red-600 dark:text-red-400"
      : urgency === "warning"
      ? "text-orange-500 dark:text-orange-400"
      : "text-foreground";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri Dön
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <Badge variant={categoryVariantMap[c.category] as "default"}>{categoryLabel(c.category)}</Badge>
            <h1 className="text-3xl font-bold leading-tight">{c.title}</h1>
            <p className="text-lg text-muted-foreground">{c.organization}</p>
            <div className="flex flex-wrap gap-2">
              {c.tags?.map((tag: string) => (
                <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-3">Hakkında</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.description}</p>
          </div>

          {related.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Benzer Yarışmalar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(related as CompetitionCardProps[]).map((r) => (
                  <CompetitionCard
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    organization={r.organization}
                    description={r.description}
                    category={r.category}
                    reward={r.reward}
                    currency={r.currency}
                    deadline={r.deadline}
                    country={r.country}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Yarışma Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Ödül</p>
                  <p className="font-semibold">{formatReward(c.reward, c.currency)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Son Başvuru</p>
                  <p className={`font-semibold ${urgencyColor}`}>{formatDeadline(deadlineDate)}</p>
                  {daysLeft !== null && daysLeft >= 0 && (
                    <p className={`text-sm ${urgencyColor}`}>
                      {daysLeft === 0 ? "Bugün bitiyor!" : `${daysLeft} gün kaldı`}
                    </p>
                  )}
                  {daysLeft !== null && daysLeft < 0 && (
                    <p className="text-sm text-muted-foreground">Süresi doldu</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Ülke</p>
                  <p className="font-semibold">{c.country ?? "Uluslararası"}</p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                {c.applicationUrl && (
                  <a href={c.applicationUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Başvur
                    </Button>
                  </a>
                )}
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full">
                    Kaynak Sayfaya Git
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Bookmark className="h-4 w-4 mr-1" />
              Kaydet
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-1" />
              Paylaş
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
