import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllTrending } from "@/lib/sources";
import { classifyAndGenerate, delay } from "@/lib/gemini";
import type { Category } from "@/generated/prisma/client";

export const maxDuration = 60;

const TOPICS_PER_RUN = 4;
const DELAY_BETWEEN_CALLS_MS = 13000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const errors: string[] = [];
  let topicsFetched = 0;
  let promptsGenerated = 0;

  try {
    const trendingItems = await fetchAllTrending();
    topicsFetched = trendingItems.length;

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c: Category) => [c.name, c.id]));

    for (let i = 0; i < Math.min(trendingItems.length, TOPICS_PER_RUN); i++) {
      const item = trendingItems[i];
      try {
        // Rate limit: free tier is 5 RPM for gemini-2.5-flash
        if (i > 0) await delay(DELAY_BETWEEN_CALLS_MS);

        // Check if topic exists with prompts already
        const existing = await prisma.topic.findFirst({
          where: {
            title: item.title,
            fetchedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          include: { _count: { select: { prompts: true } } },
        });

        if (existing && existing._count.prompts > 0) continue;

        const result = await classifyAndGenerate(item.title, item.description);
        const categoryId =
          categoryMap.get(result.category) ?? categoryMap.get("新闻")!;

        // Reuse existing topic or create new one
        const topic = existing ?? await prisma.topic.create({
          data: {
            title: item.title,
            description: item.description,
            source: item.source,
            sourceUrl: item.sourceUrl,
            categoryId,
            trendingScore: item.trendingScore,
          },
        });

        await prisma.prompt.create({
          data: {
            topicId: topic.id,
            aiVideoPrompt: result.prompt.aiVideoPrompt,
            videoScript: result.prompt.videoScript,
            style: result.prompt.style,
            duration: result.prompt.duration,
            tags: JSON.stringify(result.prompt.tags),
          },
        });

        promptsGenerated++;
      } catch (itemError) {
        const msg = `Failed to process "${item.title}": ${itemError}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    await prisma.cronLog.create({
      data: {
        taskType: "full_pipeline",
        status: errors.length > 0 ? "partial" : "success",
        message: JSON.stringify({
          topicsFetched,
          promptsGenerated,
          errors: errors.slice(0, 5),
          durationMs: Date.now() - startTime,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      topicsFetched,
      promptsGenerated,
      errors: errors.slice(0, 5),
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Cron job failed:", error);

    await prisma.cronLog.create({
      data: {
        taskType: "full_pipeline",
        status: "error",
        message: String(error),
      },
    });

    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
