"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Video, FileText } from "lucide-react";

interface PromptCardProps {
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

export function PromptCard({ prompt }: { prompt: PromptCardProps }) {
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
        {prompt.topic && (
          <CardDescription className="font-medium text-foreground">
            {prompt.topic.title}
          </CardDescription>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {prompt.style && <Badge variant="secondary">{prompt.style}</Badge>}
          {prompt.duration && <Badge variant="outline">{prompt.duration}</Badge>}
          {prompt.topic?.category && (
            <Badge variant="outline">{prompt.topic.category.name}</Badge>
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
