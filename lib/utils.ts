import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, isValid } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(date: Date | null | undefined, locale?: string): string {
  if (!date || !isValid(date)) return "Belirtilmemiş";
  const loc = locale === "tr" ? tr : undefined;
  return format(date, "dd MMM yyyy", { locale: loc });
}

export function daysUntilDeadline(date: Date | null | undefined): number | null {
  if (!date || !isValid(date)) return null;
  return differenceInDays(date, new Date());
}

export function getDeadlineUrgency(date: Date | null | undefined): "critical" | "warning" | "normal" | "expired" {
  const days = daysUntilDeadline(date);
  if (days === null) return "normal";
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 14) return "warning";
  return "normal";
}

export function formatReward(reward: string | null | undefined, currency: string | null | undefined): string {
  if (!reward) return "Belirtilmemiş";
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${reward}`;
}

export function getCurrencySymbol(currency: string | null | undefined): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
    GBP: "£",
  };
  return symbols[currency ?? ""] ?? (currency ? `${currency} ` : "");
}

export function categoryLabel(category: string, locale = "tr"): string {
  const labels: Record<string, Record<string, string>> = {
    tr: {
      TUBITAK: "TÜBİTAK",
      HACKATHON: "Hackathon",
      STARTUP: "Startup",
      AI_ML: "Yapay Zeka",
      DESIGN: "Tasarım",
      OTHER: "Diğer",
    },
    en: {
      TUBITAK: "TÜBİTAK",
      HACKATHON: "Hackathon",
      STARTUP: "Startup",
      AI_ML: "AI / ML",
      DESIGN: "Design",
      OTHER: "Other",
    },
  };
  return labels[locale]?.[category] ?? category;
}
