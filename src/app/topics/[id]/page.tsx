import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "@/components/source-badge";
import { PromptCard } from "@/components/prompt-card";
import { RegenerateButton } from "@/components/regenerate-button";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      category: true,
      prompts: {
        orderBy: { generatedAt: "desc" },
      },
    },
  });

  if (!topic) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回话题列表
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SourceBadge source={topic.source} />
          {topic.category && (
            <Badge variant="outline">{topic.category.name}</Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {new Date(topic.fetchedAt).toLocaleString("zh-CN")}
          </span>
        </div>
        {topic.description && (
          <p className="text-muted-foreground mt-4 max-w-3xl">
            {topic.description}
          </p>
        )}
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
          >
            查看原文
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            视频 Prompt ({topic.prompts.length})
          </h2>
          <RegenerateButton topicId={topic.id} />
        </div>
        {topic.prompts.length > 0 ? (
          <div className="space-y-4">
            {topic.prompts.map((prompt: typeof topic.prompts[number]) => (
              <PromptCard
                key={prompt.id}
                prompt={{
                  ...prompt,
                  generatedAt: prompt.generatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">暂无 Prompt</p>
              <p className="text-sm mt-1">等待 AI 生成中...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
