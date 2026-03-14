import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicCard } from "@/components/topic-card";
import { PromptCard } from "@/components/prompt-card";
import { Flame, Sparkles, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [topicCount, promptCount, latestTopics, latestPrompts, lastCron] =
    await Promise.all([
      prisma.topic.count(),
      prisma.prompt.count(),
      prisma.topic.findMany({
        take: 6,
        orderBy: { fetchedAt: "desc" },
        include: {
          category: true,
          _count: { select: { prompts: true } },
        },
      }),
      prisma.prompt.findMany({
        take: 3,
        orderBy: { generatedAt: "desc" },
        include: {
          topic: { include: { category: true } },
        },
      }),
      prisma.cronLog.findFirst({
        orderBy: { runAt: "desc" },
      }),
    ]);

  return { topicCount, promptCount, latestTopics, latestPrompts, lastCron };
}

export default async function DashboardPage() {
  const { topicCount, promptCount, latestTopics, latestPrompts, lastCron } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground mt-1">
          网络热门话题追踪与视频 Prompt 自动生成
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">热门话题总数</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">生成 Prompt</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promptCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">数据来源</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Google Trends / YouTube / Reddit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">最近运行</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastCron
                ? new Date(lastCron.runAt).toLocaleDateString("zh-CN")
                : "未运行"}
            </div>
            {lastCron && (
              <p className="text-xs text-muted-foreground">
                状态: {lastCron.status}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新热门话题</h2>
          <Link
            href="/topics"
            className="text-sm text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>
        {latestTopics.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestTopics.map((topic: typeof latestTopics[number]) => (
              <TopicCard
                key={topic.id}
                topic={{
                  ...topic,
                  fetchedAt: topic.fetchedAt.toISOString(),
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Flame className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">暂无话题数据</p>
              <p className="text-sm mt-1">
                等待定时任务运行，或手动触发抓取
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Latest Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新生成 Prompt</h2>
          <Link
            href="/prompts"
            className="text-sm text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>
        {latestPrompts.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-1">
            {latestPrompts.map((prompt: typeof latestPrompts[number]) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  generatedAt: prompt.generatedAt.toISOString(),
                  topic: prompt.topic
                    ? {
                        title: prompt.topic.title,
                        category: prompt.topic.category,
                      }
                    : undefined,
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">暂无 Prompt</p>
              <p className="text-sm mt-1">
                话题抓取后将自动生成视频 Prompt
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
