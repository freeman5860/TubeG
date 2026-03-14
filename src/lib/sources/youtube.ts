import type { TrendingItem } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    categoryId: string;
  };
  statistics?: {
    viewCount: string;
  };
}

export async function fetchYouTubeTrending(): Promise<TrendingItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY not configured, skipping YouTube source");
    return [];
  }

  try {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("chart", "mostPopular");
    url.searchParams.set("regionCode", "US");
    url.searchParams.set("maxResults", "15");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const videos: YouTubeVideo[] = data.items ?? [];

    return videos.map((video) => ({
      title: video.snippet.title,
      description: video.snippet.description.slice(0, 300),
      source: "youtube" as const,
      sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
      trendingScore: parseInt(video.statistics?.viewCount ?? "0") || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch YouTube trending:", error);
    return [];
  }
}
