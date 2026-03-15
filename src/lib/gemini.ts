import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedPrompt } from "@/types";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function classifyTopic(title: string, description: string): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Given the following trending topic, classify it into exactly ONE of these categories:
科技, 娱乐, 游戏, 新闻, 生活, 教育, 财经, 体育

Topic title: ${title}
Topic description: ${description}

Reply with ONLY the category name in Chinese, nothing else.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const validCategories = ["科技", "娱乐", "游戏", "新闻", "生活", "教育", "财经", "体育"];
  return validCategories.includes(text) ? text : "新闻";
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

export async function generateVideoPrompts(
  title: string,
  description: string,
  category: string
): Promise<GeneratedPrompt> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a professional video content strategist. Given a trending topic, generate content for video creation.

Topic: ${title}
Description: ${description}
Category: ${category}

Generate a JSON response with these exact fields. ALL values MUST be plain strings, NOT nested objects:
{
  "aiVideoPrompt": "A detailed visual scene description for AI video generation tools (like Sora, Runway, Kling). Include camera angles, lighting, atmosphere, visual style, motion, and mood. Should be 3-5 sentences, highly descriptive and cinematic.",
  "videoScript": "A SINGLE STRING containing the complete video script. Use newlines within the string for sections: Hook/Opening, Main Content, Call to Action. Target 60-90 seconds. Do NOT use a nested JSON object.",
  "style": "The video style (one of: 解说, Vlog, 动画, 新闻播报, 教程, 纪录片风格, 短剧)",
  "duration": "Recommended duration (e.g., 60秒, 90秒, 3分钟)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

CRITICAL: "videoScript" must be a flat string, NOT a JSON object. Respond with ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(cleaned);
    return {
      aiVideoPrompt: stringifyField(parsed.aiVideoPrompt),
      videoScript: stringifyField(parsed.videoScript),
      style: parsed.style || "解说",
      duration: parsed.duration || "60秒",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return {
      aiVideoPrompt: `Create a visually compelling video about "${title}". ${description}`,
      videoScript: `【开场】\n今天我们来聊聊 ${title}。\n\n【正文】\n${description}\n\n【结尾】\n关注我获取更多热门话题内容。`,
      style: "解说",
      duration: "60秒",
      tags: [category],
    };
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
