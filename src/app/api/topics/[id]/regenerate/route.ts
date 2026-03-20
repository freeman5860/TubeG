import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyAndGenerate } from "@/lib/gemini";
import type { Category } from "@/generated/prisma/client";

export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const result = await classifyAndGenerate(
      topic.title,
      topic.description ?? ""
    );

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((c: Category) => [c.name, c.id])
    );
    const newCategoryId =
      categoryMap.get(result.category) ?? topic.categoryId;

    if (newCategoryId !== topic.categoryId) {
      await prisma.topic.update({
        where: { id },
        data: { categoryId: newCategoryId },
      });
    }

    const prompt = await prisma.prompt.create({
      data: {
        topicId: topic.id,
        aiVideoPrompt: result.prompt.aiVideoPrompt,
        videoScript: result.prompt.videoScript,
        style: result.prompt.style,
        duration: result.prompt.duration,
        tags: JSON.stringify(result.prompt.tags),
      },
    });

    return NextResponse.json({ success: true, prompt });
  } catch (error) {
    console.error("Regenerate failed:", error);
    return NextResponse.json(
      { error: "Failed to regenerate", details: String(error) },
      { status: 500 }
    );
  }
}
