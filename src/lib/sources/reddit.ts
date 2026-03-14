import type { TrendingItem } from "@/types";

const SUBREDDITS = [
  "technology",
  "worldnews",
  "gaming",
  "science",
  "movies",
  "sports",
  "todayilearned",
];

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    score: number;
    subreddit: string;
  };
}

export async function fetchRedditHot(): Promise<TrendingItem[]> {
  const items: TrendingItem[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`,
        {
          headers: {
            "User-Agent": "TubeG/1.0 (Trending Topic Fetcher)",
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const posts: RedditPost[] = data.data?.children ?? [];

      for (const post of posts) {
        if (post.data.title) {
          items.push({
            title: post.data.title,
            description: post.data.selftext?.slice(0, 300) || "",
            source: "reddit",
            sourceUrl: `https://reddit.com${post.data.permalink}`,
            trendingScore: post.data.score || 0,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch Reddit r/${subreddit}:`, error);
    }
  }

  return items;
}
