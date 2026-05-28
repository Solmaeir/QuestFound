import { Suspense } from "react";
import { StatsRow } from "@/components/StatsRow";
import { FilterBar } from "@/components/FilterBar";
import { CompetitionCard, CompetitionCardSkeleton, type CompetitionCardProps } from "@/components/CompetitionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  category?: string;
  country?: string;
  search?: string;
  sortBy?: string;
  page?: string;
}

async function CompetitionGrid({ searchParams }: { searchParams: SearchParams }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.country) params.set("country", searchParams.country);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.sortBy) params.set("sortBy", searchParams.sortBy);
  if (searchParams.page) params.set("page", searchParams.page);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/competitions?${params.toString()}`, { cache: "no-store" });
  const data = await res.json();
  const { competitions, pagination } = data;

  if (!competitions || competitions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Arama kriterlerinize uygun yarışma bulunamadı.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="outline">Filtreleri Temizle</Button>
        </Link>
      </div>
    );
  }

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {pagination.total} yarışmadan {competitions.length} tanesi gösteriliyor
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(competitions as CompetitionCardProps[]).map((c) => (
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
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <Link href={`/?${new URLSearchParams({ ...Object.fromEntries(params), page: String(currentPage - 1) })}`}>
              <Button variant="outline">Önceki</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/?${new URLSearchParams({ ...Object.fromEntries(params), page: String(currentPage + 1) })}`}>
              <Button variant="outline">Sonraki</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CompetitionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Zap className="h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">QuestFound</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          TÜBİTAK, TEKNOFEST, uluslararası hackathon ve startup yarışmalarını tek platformda keşfedin.
        </p>
      </section>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        }
      >
        <StatsRow />
      </Suspense>

      <section className="space-y-6">
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>

        <Suspense fallback={<GridSkeleton />}>
          <CompetitionGrid searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
