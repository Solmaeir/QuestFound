import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const competition = await prisma.competition.findUnique({
    where: { id: params.id },
  });

  if (!competition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const related = await prisma.competition.findMany({
    where: {
      category: competition.category,
      id: { not: competition.id },
      isActive: true,
    },
    take: 3,
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json({ competition, related });
}
