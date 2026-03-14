import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllTrending } from "@/lib/sources";
import { classifyTopic, generateVideoPrompts } from "@/lib/gemini";
import type { Category } from "@/generated/prisma/client";

export const maxDuration = 60;

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
    // Step 1: Fetch trending topics from all sources
    const trendingItems = await fetchAllTrending();
    topicsFetched = trendingItems.length;

    // Step 2: For each trending item, classify and store
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c: Category) => [c.name, c.id]));

    for (const item of trendingItems.slice(0, 20)) {
      try {
        // Classify the topic
        const categoryName = await classifyTopic(item.title, item.description);
        const categoryId =
          categoryMap.get(categoryName) ?? categoryMap.get("新闻")!;

        // Check for duplicate topics (same title in last 24h)
        const existing = await prisma.topic.findFirst({
          where: {
            title: item.title,
            fetchedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        if (existing) continue;

        // Store the topic
        const topic = await prisma.topic.create({
          data: {
            title: item.title,
            description: item.description,
            source: item.source,
            sourceUrl: item.sourceUrl,
            categoryId,
            trendingScore: item.trendingScore,
          },
        });

        // Step 3: Generate video prompts
        const generated = await generateVideoPrompts(
          item.title,
          item.description,
          categoryName
        );

        await prisma.prompt.create({
          data: {
            topicId: topic.id,
            aiVideoPrompt: generated.aiVideoPrompt,
            videoScript: generated.videoScript,
            style: generated.style,
            duration: generated.duration,
            tags: JSON.stringify(generated.tags),
          },
        });

        promptsGenerated++;
      } catch (itemError) {
        const msg = `Failed to process "${item.title}": ${itemError}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    // Log the cron run
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
