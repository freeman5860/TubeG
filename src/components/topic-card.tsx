import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "./source-badge";
import { ExternalLink, Sparkles } from "lucide-react";

interface TopicCardProps {
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

export function TopicCard({ topic }: { topic: TopicCardProps }) {
  const timeAgo = getTimeAgo(new Date(topic.fetchedAt));

  return (
    <Link href={`/topics/${topic.id}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {topic.title}
            </CardTitle>
            {topic.sourceUrl && (
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SourceBadge source={topic.source} />
            {topic.category && (
              <Badge variant="outline">{topic.category.name}</Badge>
            )}
            {(topic._count?.prompts ?? 0) > 0 && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {topic._count?.prompts} prompt
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {topic.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {topic.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {topic.trendingScore > 0 && (
              <span className="font-medium">
                {formatScore(topic.trendingScore)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

function formatScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return String(score);
}
