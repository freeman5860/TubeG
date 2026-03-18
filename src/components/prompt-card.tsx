"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Video, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  id: string;
  aiVideoPrompt: string;
  videoScript: string;
  style: string | null;
  duration: string | null;
  tags: string | null;
  selected?: boolean;
  generatedAt: string;
  topic?: {
    id?: string;
    title: string;
    category?: { name: string } | null;
  };
}

export function PromptCard({
  prompt,
  onToggleSelected,
}: {
  prompt: PromptCardProps;
  onToggleSelected?: (id: string, selected: boolean) => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const tags: string[] = (() => {
    try {
      return prompt.tags ? JSON.parse(prompt.tags) : [];
    } catch {
      return [];
    }
  })();

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 min-w-0">
            {prompt.topic &&
              (prompt.topic.id ? (
                <Link href={`/topics/${prompt.topic.id}`}>
                  <CardDescription className="font-medium text-foreground hover:text-primary transition-colors">
                    {prompt.topic.title}
                  </CardDescription>
                </Link>
              ) : (
                <CardDescription className="font-medium text-foreground">
                  {prompt.topic.title}
                </CardDescription>
              ))}
            <div className="flex flex-wrap items-center gap-2">
              {prompt.style && (
                <Badge variant="secondary">{prompt.style}</Badge>
              )}
              {prompt.duration && (
                <Badge variant="outline">{prompt.duration}</Badge>
              )}
              {prompt.topic?.category && (
                <Badge variant="outline">{prompt.topic.category.name}</Badge>
              )}
            </div>
          </div>
          {onToggleSelected && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onToggleSelected(prompt.id, !prompt.selected)}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  prompt.selected
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="video-prompt" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="video-prompt" className="flex-1 gap-1.5">
              <Video className="h-3.5 w-3.5" />
              AI 视频 Prompt
            </TabsTrigger>
            <TabsTrigger value="script" className="flex-1 gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              视频脚本
            </TabsTrigger>
          </TabsList>
          <TabsContent value="video-prompt" className="mt-4">
            <div className="relative rounded-lg bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap pr-10">
                {prompt.aiVideoPrompt}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() =>
                  copyToClipboard(prompt.aiVideoPrompt, "video-prompt")
                }
              >
                {copiedField === "video-prompt" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="script" className="mt-4">
            <div className="relative rounded-lg bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap pr-10">
                {prompt.videoScript}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => copyToClipboard(prompt.videoScript, "script")}
              >
                {copiedField === "script" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
