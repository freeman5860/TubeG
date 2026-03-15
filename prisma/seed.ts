import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "科技", description: "科技、AI、软件、硬件、互联网" },
  { name: "娱乐", description: "影视、音乐、综艺、明星" },
  { name: "游戏", description: "电子游戏、电竞、游戏开发" },
  { name: "新闻", description: "时事新闻、国际、社会" },
  { name: "生活", description: "生活方式、美食、旅行、健康" },
  { name: "教育", description: "学习、教程、知识科普" },
  { name: "财经", description: "金融、股票、加密货币、经济" },
  { name: "体育", description: "体育赛事、健身、户外运动" },
];

async function main() {
  console.log("Seeding categories...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
