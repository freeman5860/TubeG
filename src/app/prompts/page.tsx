"use client";

import { useEffect, useState } from "react";
import { PromptCard } from "@/components/prompt-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface Prompt {
  id: string;
  aiVideoPrompt: string;
  videoScript: string;
  style: string | null;
  duration: string | null;
  tags: string | null;
  generatedAt: string;
  topic?: {
    title: string;
    category?: { name: string } | null;
  };
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/prompts?limit=30")
      .then((r) => r.json())
      .then((data) => {
        setPrompts(data.prompts ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">视频 Prompts</h1>
        <p className="text-muted-foreground mt-1">
          AI 自动生成的视频创作 Prompt 和脚本 · 共 {total} 条
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : prompts.length > 0 ? (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">暂无 Prompt</p>
            <p className="text-sm mt-1">
              等待热门话题抓取后自动生成
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
