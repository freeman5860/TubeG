# TubeG - 热门话题视频 Prompt 自动生成平台

自动追踪网络热门话题（Google Trends / YouTube / Reddit），使用 Google Gemini AI 分析并生成 AI 视频 Prompt 和视频脚本，供创作者一键复制使用。

## 功能特性

- **多平台热门话题抓取** — Google Trends、YouTube Trending、Reddit Hot
- **AI 智能分析** — Google Gemini 自动分类话题并生成视频创作内容
- **双重 Prompt 输出** — AI 视频生成 Prompt（适用于 Sora/Runway/Kling）+ 视频脚本/文案
- **定时自动运行** — Vercel Cron Jobs 每日自动抓取分析
- **题材分类筛选** — 支持按科技、娱乐、游戏、新闻等分类浏览
- **一键复制** — Prompt 和脚本一键复制到剪贴板
- **免费部署** — 全部使用 Vercel 免费服务

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui
- **数据库**: Prisma v7 + Vercel Postgres (Neon)
- **AI**: Google Gemini 1.5 Flash
- **部署**: Vercel Hobby Plan (免费)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 API Keys：

```bash
cp .env.example .env
```

需要的 API Keys：

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | Vercel Dashboard → Storage → Postgres |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `YOUTUBE_API_KEY` | YouTube Data API Key | [Google Cloud Console](https://console.cloud.google.com/) |
| `CRON_SECRET` | Cron 端点保护密钥 | 自行生成任意随机字符串 |

### 3. 初始化数据库

```bash
npx prisma db push
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 手动触发数据抓取（测试用）

```bash
curl http://localhost:3000/api/cron/run
```

## 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 导入 Git 仓库
2. 创建 Vercel Postgres 数据库（Dashboard → Storage → Create → Postgres）
3. 将数据库连接字符串和 API Keys 添加到 Vercel 环境变量
4. 部署完成后，Cron Job 将每天 UTC 08:00 自动运行

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面和 API
│   ├── api/                # API 路由
│   │   ├── categories/     # 题材分类 API
│   │   ├── topics/         # 话题 API
│   │   ├── prompts/        # Prompt API
│   │   └── cron/run/       # 定时任务入口
│   ├── topics/             # 话题列表和详情页
│   ├── prompts/            # Prompt 浏览页
│   └── page.tsx            # 仪表盘首页
├── components/             # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── navbar.tsx          # 导航栏
│   ├── topic-card.tsx      # 话题卡片
│   ├── prompt-card.tsx     # Prompt 卡片（含一键复制）
│   ├── category-filter.tsx # 题材筛选器
│   └── source-badge.tsx    # 数据来源标签
├── lib/                    # 核心逻辑
│   ├── db.ts               # Prisma 数据库客户端
│   ├── gemini.ts           # Gemini AI 集成
│   └── sources/            # 热门话题数据源
│       ├── google-trends.ts
│       ├── youtube.ts
│       ├── reddit.ts
│       └── index.ts
└── types/                  # TypeScript 类型定义
```

## 免费额度

| 服务 | 免费额度 |
|------|---------|
| Vercel Hobby | 无限项目，100GB 带宽/月 |
| Vercel Postgres | 256MB 存储 |
| Gemini API | 15 RPM，100万 tokens/天 |
| YouTube Data API | 10,000 单位/天 |
| Reddit JSON API | 无需认证 |

## License

[Apache License 2.0](LICENSE)
