import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") as Category | null;
  const country = searchParams.get("country");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") ?? "deadline";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const skip = (page - 1) * limit;

  const validCategories = Object.values(Category) as string[];
  const where: Prisma.CompetitionWhereInput = {
    isActive: true,
    ...(category && validCategories.includes(category) && { category }),
    ...(country && { country }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ],
    }),
  };

  const orderBy: Prisma.CompetitionOrderByWithRelationInput =
    sortBy === "deadline"
      ? { deadline: "asc" }
      : sortBy === "reward"
      ? { reward: "asc" }
      : { createdAt: "desc" };

  const [competitions, total] = await Promise.all([
    prisma.competition.findMany({ where, orderBy, skip, take: limit }),
    prisma.competition.count({ where }),
  ]);

  return NextResponse.json({
    competitions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const competition = await prisma.competition.create({
    data: {
      ...body,
      isActive: false, // community submissions start as pending
    },
  });

  return NextResponse.json(competition, { status: 201 });
}
