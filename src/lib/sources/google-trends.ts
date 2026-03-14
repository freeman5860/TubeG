import type { TrendingItem } from "@/types";

export async function fetchGoogleTrends(): Promise<TrendingItem[]> {
  try {
    const googleTrends = await import("google-trends-api");

    const results = await googleTrends.default.dailyTrends({
      geo: "US",
    });

    const parsed = JSON.parse(results);
    const days = parsed.default?.trendingSearchesDays ?? [];

    const items: TrendingItem[] = [];

    for (const day of days.slice(0, 2)) {
      for (const search of day.trendingSearches?.slice(0, 10) ?? []) {
        const title = search.title?.query ?? "";
        const description =
          search.articles?.[0]?.title ?? search.formattedTraffic ?? "";
        const sourceUrl = search.articles?.[0]?.url ?? "";
        const traffic = search.formattedTraffic ?? "0";
        const score = parseInt(traffic.replace(/[^0-9]/g, "")) || 0;

        if (title) {
          items.push({
            title,
            description,
            source: "google_trends",
            sourceUrl,
            trendingScore: score,
          });
        }
      }
    }

    return items;
  } catch (error) {
    console.error("Failed to fetch Google Trends:", error);
    return [];
  }
}
