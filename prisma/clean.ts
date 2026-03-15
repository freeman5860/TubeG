import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Deleting all prompts...");
  const deletedPrompts = await prisma.prompt.deleteMany();
  console.log(`Deleted ${deletedPrompts.count} prompts.`);

  console.log("Deleting all topics...");
  const deletedTopics = await prisma.topic.deleteMany();
  console.log(`Deleted ${deletedTopics.count} topics.`);

  console.log("Deleting all cron logs...");
  const deletedLogs = await prisma.cronLog.deleteMany();
  console.log(`Deleted ${deletedLogs.count} cron logs.`);

  console.log("Done. Database cleaned.");
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
