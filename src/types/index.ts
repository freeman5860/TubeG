export interface TrendingItem {
  title: string;
  description: string;
  source: "google_trends" | "youtube" | "reddit";
  sourceUrl?: string;
  category?: string;
  trendingScore: number;
}

export interface GeneratedPrompt {
  aiVideoPrompt: string;
  videoScript: string;
  style: string;
  duration: string;
  tags: string[];
}

export interface CronRunResult {
  topicsFetched: number;
  promptsGenerated: number;
  errors: string[];
}
