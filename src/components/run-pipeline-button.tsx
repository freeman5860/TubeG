"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PipelineResult {
  success: boolean;
  topicsFetched: number;
  promptsGenerated: number;
  errors: string[];
  durationMs: number;
}

export function RunPipelineButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const router = useRouter();

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
      router.refresh();
    } catch (error) {
      console.error("Pipeline trigger failed:", error);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Button onClick={handleRun} disabled={running} size="sm">
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {running ? "抓取中…" : "手动触发抓取"}
      </Button>
      {running && (
        <span className="text-xs text-muted-foreground">
          预计需要 1 分钟，请耐心等待
        </span>
      )}
      {result && (
        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
          {result.errors.length > 0 ? (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          抓取 {result.topicsFetched} 个话题，生成 {result.promptsGenerated} 个
          Prompt
        </span>
      )}
    </div>
  );
}
