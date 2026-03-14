import { Badge } from "@/components/ui/badge";

const sourceConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  google_trends: { label: "Google", variant: "default" },
  youtube: { label: "YouTube", variant: "destructive" },
  reddit: { label: "Reddit", variant: "secondary" },
};

export function SourceBadge({ source }: { source: string }) {
  const config = sourceConfig[source] ?? { label: source, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
