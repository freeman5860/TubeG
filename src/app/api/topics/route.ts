import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const conditions: Prisma.TopicWhereInput[] = [];
    if (category) conditions.push({ categoryId: category });
    if (source) conditions.push({ source });
    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.TopicWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

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
