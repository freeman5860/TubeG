"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ topicId }: { topicId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (error) {
      console.error("Regenerate failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleRegenerate}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {loading ? "生成中…" : "重新生成 Prompt"}
    </Button>
  );
}
