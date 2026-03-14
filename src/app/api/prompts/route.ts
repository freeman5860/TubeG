import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const limit = parseInt(searchParams.get("limit") ?? "30");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = {};
    if (topicId) where.topicId = topicId;

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        include: {
          topic: {
            include: { category: true },
          },
        },
        orderBy: { generatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.prompt.count({ where }),
    ]);

    return NextResponse.json({ prompts, total });
  } catch (error) {
    console.error("Failed to fetch prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, selected } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing prompt id" }, { status: 400 });
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { selected: !!selected },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Failed to update prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}
