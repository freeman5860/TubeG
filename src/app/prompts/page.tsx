"use client";

import { useEffect, useState, useCallback } from "react";
import { PromptCard } from "@/components/prompt-card";
import { CategoryFilter } from "@/components/category-filter";
import { SearchInput } from "@/components/search-input";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const PAGE_SIZE = 12;

interface Category {
  id: string;
  name: string;
  _count?: { topics: number };
}

interface Prompt {
  id: string;
  aiVideoPrompt: string;
  videoScript: string;
  style: string | null;
  duration: string | null;
  tags: string | null;
  selected: boolean;
  generatedAt: string;
  topic?: {
    id: string;
    title: string;
    category?: { name: string } | null;
  };
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSource) params.set("source", selectedSource);
    if (search) params.set("search", search);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String((page - 1) * PAGE_SIZE));

    try {
      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();
      setPrompts(data.prompts ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSource, search, page]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedSource, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const sources = [
    { id: "google_trends", label: "Google" },
    { id: "youtube", label: "YouTube" },
    { id: "reddit", label: "Reddit" },
  ];

  function handleToggleSelected(id: string, selected: boolean) {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected } : p))
    );
    fetch("/api/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, selected }),
    }).catch(() => {
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, selected: !selected } : p))
      );
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">视频 Prompts</h1>
        <p className="text-muted-foreground mt-1">
          AI 自动生成的视频创作 Prompt 和脚本 · 共 {total} 条
        </p>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="搜索 Prompt 内容或话题…"
      />

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
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onToggleSelected={handleToggleSelected}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">暂无 Prompt</p>
            <p className="text-sm mt-1">
              调整筛选条件或等待热门话题抓取后自动生成
            </p>
          </CardContent>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
