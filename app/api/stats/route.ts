import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const [total, endingThisWeek, byCategory, competitions] = await Promise.all([
    prisma.competition.count({ where: { isActive: true } }),
    prisma.competition.count({
      where: {
        isActive: true,
        deadline: { gte: now, lte: sevenDaysLater },
      },
    }),
    prisma.competition.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { _all: true },
    }),
    prisma.competition.findMany({
      where: { isActive: true, reward: { not: null } },
      select: { reward: true, currency: true },
    }),
  ]);

  const categoryStats = byCategory.reduce((acc, item) => {
    acc[item.category] = item._count._all;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    total,
    endingThisWeek,
    categoryStats,
    competitionsWithRewards: competitions.length,
  });
}
