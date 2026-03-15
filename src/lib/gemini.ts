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

const SAFETY_RULES = `
=== CRITICAL SAFETY RULES FOR AI VIDEO PROMPT ===
The "aiVideoPrompt" will be sent to AI video generation tools. It MUST strictly follow these rules to avoid content moderation rejection:

FORBIDDEN (will be blocked):
- NO realistic human faces, portraits, or photorealistic people. Use "illustrated character", "cartoon figure", "stylized silhouette", "abstract figure" instead.
- NO real celebrities, politicians, athletes, or any named/recognizable person. Use generic descriptions like "a presenter", "an animated host".
- NO weapons, guns, explosions, blood, combat, violence, zombies. For games, use "colorful game interface", "item showcase", "equipment icon display".
- NO body exposure, swimwear, tight/revealing clothing, sexy, NSFW content. Keep all figures fully clothed in neutral attire.
- NO children, minors, or young-looking characters. Only depict adults or abstract/cartoon characters.
- NO copyrighted IP characters (anime characters, game characters, movie characters). Describe the art style or genre instead.
- NO watermark removal, logo removal, or any copyright-infringing instruction.
- NO political symbols, religious imagery, or culturally sensitive content.

REQUIRED STYLE:
- Use illustration, flat design, motion graphics, 2D/3D animation, infographic, or abstract visual styles.
- Describe scenes using objects, environments, colors, shapes, text overlays, icons, and data visualizations.
- For people, always say "illustrated character", "cartoon-style figure", or "animated presenter" — NEVER "person", "man", "woman", "girl", "boy" without an art style qualifier.
- Focus on: environments, abstract concepts, technology interfaces, nature landscapes, geometric patterns, data flows, product mockups.
===`;

export interface ClassifyAndGenerateResult {
  category: string;
  prompt: GeneratedPrompt;
}

export async function classifyAndGenerate(
  title: string,
  description: string
): Promise<ClassifyAndGenerateResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a professional video content strategist specializing in AI-generated video content that passes strict content moderation.

Given a trending topic:
1. Classify it into exactly ONE category from: 科技, 娱乐, 游戏, 新闻, 生活, 教育, 财经, 体育
2. Generate video creation content that is SAFE for AI video generation

Topic: ${title}
Description: ${description}

${SAFETY_RULES}

Respond with ONLY this JSON (ALL values must be plain strings, NOT nested objects):
{
  "category": "one of the categories above in Chinese",
  "aiVideoPrompt": "A SAFE visual scene description using ONLY illustration/animation/motion-graphics style. Describe environments, abstract visuals, icons, text overlays, color palettes, camera movements on illustrated scenes. 3-5 sentences. NO real humans, NO violence, NO IP characters.",
  "videoScript": "Complete script as a SINGLE STRING with sections separated by newlines. Include: 【开场】Opening hook (5s), 【正文】Main content (key points), 【结尾】Call to action. Target 60-90 seconds. Written in Chinese.",
  "style": "one of: 动画解说, 信息图表, 动态图形, 插画动画, 2D动画, 3D渲染",
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
        style: parsed.style || "动画解说",
        duration: parsed.duration || "60秒",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      },
    };
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return {
      category: "新闻",
      prompt: {
        aiVideoPrompt: `A smooth animated infographic sequence about "${title}". Flat-design icons and illustrated elements float across a gradient background, with bold text overlays highlighting key concepts. Soft ambient lighting, gentle camera pan across a stylized digital landscape.`,
        videoScript: `【开场】\n今天我们来聊聊 ${title}。\n\n【正文】\n${description}\n\n【结尾】\n关注我获取更多热门话题内容。`,
        style: "动画解说",
        duration: "60秒",
        tags: ["热门话题"],
      },
    };
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
