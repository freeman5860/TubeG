import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = {};
    if (category) where.categoryId = category;
    if (source) where.source = source;

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        include: {
          category: true,
          _count: { select: { prompts: true } },
        },
        orderBy: { fetchedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.topic.count({ where }),
    ]);

    return NextResponse.json({ topics, total });
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
