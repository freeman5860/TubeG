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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

export async function generateVideoPrompts(
  title: string,
  description: string,
  category: string
): Promise<GeneratedPrompt> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a professional video content strategist. Given a trending topic, generate content for video creation.

Topic: ${title}
Description: ${description}
Category: ${category}

Generate a JSON response with these exact fields:
{
  "aiVideoPrompt": "A detailed visual scene description for AI video generation tools (like Sora, Runway, Kling). Include camera angles, lighting, atmosphere, visual style, motion, and mood. Should be 3-5 sentences, highly descriptive and cinematic.",
  "videoScript": "A complete video script with: 1) Hook/Opening (attention-grabbing first 5 seconds), 2) Main Content (key talking points with transitions), 3) Call to Action/Closing. Format with clear sections. Target 60-90 seconds.",
  "style": "The video style (one of: 解说, Vlog, 动画, 新闻播报, 教程, 纪录片风格, 短剧)",
  "duration": "Recommended duration (e.g., 60秒, 90秒, 3分钟)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting or code blocks.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code block wrappers if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(cleaned);
    return {
      aiVideoPrompt: parsed.aiVideoPrompt || "",
      videoScript: parsed.videoScript || "",
      style: parsed.style || "解说",
      duration: parsed.duration || "60秒",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return {
      aiVideoPrompt: `Create a visually compelling video about "${title}". ${description}`,
      videoScript: `Opening: Today we explore ${title}.\n\nMain: ${description}\n\nClosing: Stay tuned for more trending content.`,
      style: "解说",
      duration: "60秒",
      tags: [category],
    };
  }
}
