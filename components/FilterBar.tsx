"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "ALL", label: "Tümü" },
  { value: "TUBITAK", label: "TÜBİTAK" },
  { value: "HACKATHON", label: "Hackathon" },
  { value: "AI_ML", label: "Yapay Zeka" },
  { value: "STARTUP", label: "Startup" },
  { value: "DESIGN", label: "Tasarım" },
  { value: "OTHER", label: "Diğer" },
];

const SORT_OPTIONS = [
  { value: "deadline", label: "Son Tarih" },
  { value: "newest", label: "En Yeni" },
  { value: "reward", label: "Ödül" },
];

const COUNTRIES = ["International", "Turkey", "Europe", "USA"];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "ALL";
  const activeSort = searchParams.get("sortBy") ?? "deadline";
  const activeCountry = searchParams.get("country") ?? "";
  const activeSearch = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const query = (form.elements.namedItem("search") as HTMLInputElement).value;
    updateParam("search", query);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={activeSearch}
            placeholder="Yarışma, organizasyon veya etiket ara..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Ara</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("category", cat.value)}
            className="rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sırala:</span>
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={activeSort === opt.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => updateParam("sortBy", opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Ülke:</span>
          <select
            className="text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            value={activeCountry}
            onChange={(e) => updateParam("country", e.target.value)}
          >
            <option value="">Tümü</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
