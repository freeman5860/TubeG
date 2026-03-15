import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedPrompt } from "@/types";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

function stringifyField(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, val]) => `【${key}】\n${val}`)
      .join("\n\n");
  }
  return String(value);
}

export interface ClassifyAndGenerateResult {
  category: string;
  prompt: GeneratedPrompt;
}

/**
 * Single API call that both classifies a topic AND generates video prompts,
 * minimizing API usage for free tier rate limits.
 */
export async function classifyAndGenerate(
  title: string,
  description: string
): Promise<ClassifyAndGenerateResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a professional video content strategist. Given a trending topic:

1. Classify it into exactly ONE category from: 科技, 娱乐, 游戏, 新闻, 生活, 教育, 财经, 体育
2. Generate video creation content

Topic: ${title}
Description: ${description}

Respond with ONLY this JSON (ALL values must be plain strings, NOT nested objects):
{
  "category": "one of the categories above in Chinese",
  "aiVideoPrompt": "Detailed visual scene description for AI video tools (Sora/Runway/Kling). 3-5 cinematic sentences with camera angles, lighting, mood.",
  "videoScript": "Complete script as a SINGLE STRING with sections separated by newlines. Include: Opening hook (5s), Main content (key points), Closing (call to action). Target 60-90 seconds.",
  "style": "one of: 解说, Vlog, 动画, 新闻播报, 教程, 纪录片风格, 短剧",
  "duration": "e.g. 60秒, 90秒, 3分钟",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const validCategories = ["科技", "娱乐", "游戏", "新闻", "生活", "教育", "财经", "体育"];

  try {
    const parsed = JSON.parse(cleaned);
    const category = validCategories.includes(parsed.category) ? parsed.category : "新闻";
    return {
      category,
      prompt: {
        aiVideoPrompt: stringifyField(parsed.aiVideoPrompt),
        videoScript: stringifyField(parsed.videoScript),
        style: parsed.style || "解说",
        duration: parsed.duration || "60秒",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      },
    };
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return {
      category: "新闻",
      prompt: {
        aiVideoPrompt: `Create a visually compelling video about "${title}". ${description}`,
        videoScript: `【开场】\n今天我们来聊聊 ${title}。\n\n【正文】\n${description}\n\n【结尾】\n关注我获取更多热门话题内容。`,
        style: "解说",
        duration: "60秒",
        tags: ["热门话题"],
      },
    };
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
