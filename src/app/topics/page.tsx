"use client";

import { useEffect, useState, useCallback } from "react";
import { TopicCard } from "@/components/topic-card";
import { CategoryFilter } from "@/components/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface Category {
  id: string;
  name: string;
  _count?: { topics: number };
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  source: string;
  sourceUrl: string | null;
  category: { name: string } | null;
  trendingScore: number;
  fetchedAt: string;
  _count?: { prompts: number };
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSource) params.set("source", selectedSource);

    const res = await fetch(`/api/topics?${params}`);
    const data = await res.json();
    setTopics(data.topics ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [selectedCategory, selectedSource]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const sources = [
    { id: "google_trends", label: "Google" },
    { id: "youtube", label: "YouTube" },
    { id: "reddit", label: "Reddit" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">热门话题</h1>
        <p className="text-muted-foreground mt-1">
          来自多个平台的实时热门话题 · 共 {total} 条
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">题材分类</p>
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">数据来源</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedSource(null)}>
              <Badge
                variant={selectedSource === null ? "default" : "outline"}
                className="cursor-pointer"
              >
                全部
              </Badge>
            </button>
            {sources.map((s) => (
              <button key={s.id} onClick={() => setSelectedSource(s.id)}>
                <Badge
                  variant={selectedSource === s.id ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {s.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : topics.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Flame className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">暂无话题</p>
            <p className="text-sm mt-1">
              调整筛选条件或等待下次数据抓取
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
