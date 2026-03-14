declare module "google-trends-api" {
  interface TrendsOptions {
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
  }

  const api: {
    dailyTrends(options?: TrendsOptions): Promise<string>;
    realTimeTrends(options?: TrendsOptions): Promise<string>;
    interestOverTime(options?: TrendsOptions & { keyword: string | string[] }): Promise<string>;
  };

  export default api;
}
