import type { TrendingItem } from "@/types";
import { fetchGoogleTrends } from "./google-trends";
import { fetchYouTubeTrending } from "./youtube";
import { fetchRedditHot } from "./reddit";

export type SourceName = "google_trends" | "youtube" | "reddit";

const sourceFetchers: Record<SourceName, () => Promise<TrendingItem[]>> = {
  google_trends: fetchGoogleTrends,
  youtube: fetchYouTubeTrending,
  reddit: fetchRedditHot,
};

export async function fetchAllTrending(
  sources?: SourceName[]
): Promise<TrendingItem[]> {
  const activeSourceNames = sources ?? (Object.keys(sourceFetchers) as SourceName[]);
  const results = await Promise.allSettled(
    activeSourceNames.map((name) => sourceFetchers[name]())
  );

  const items: TrendingItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error("Source fetch failed:", result.reason);
    }
  }

  // Deduplicate by title similarity (exact match)
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
