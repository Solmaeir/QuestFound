import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { competitionId } = await req.json();
  const userId = session.user.id;

  const existing = await prisma.userSavedCompetition.findUnique({
    where: { userId_competitionId: { userId, competitionId } },
  });

  if (existing) {
    await prisma.userSavedCompetition.delete({
      where: { userId_competitionId: { userId, competitionId } },
    });
    return NextResponse.json({ saved: false });
  }

  await prisma.userSavedCompetition.create({
    data: { userId, competitionId },
  });

  return NextResponse.json({ saved: true });
}
