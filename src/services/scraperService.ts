// src/services/scraperService.ts

export interface Trend {
  id: string;
  title: string;
  source: "youtube" | "news" | "social";
  relevance: number;
  growth: string;
  timestamp: string;
}

export interface ScraperLog {
  id: string;
  time: string;
  source: string;
  status: "success" | "error";
  message: string;
}

// In a production environment, these functions would call real scraping APIs
// (e.g., Bright Data, Apify, or custom Puppeteer/Playwright services)
export const fetchTrends = async (): Promise<Trend[]> => {
  // Mocking the API call. Replace with real API call in production.
  console.log("Fetching trends from external scraper service...");
  return [
    { id: "1", title: "AI Video Revolution: Veo vs Sora", source: "youtube", relevance: 98, growth: "+420%", timestamp: "2m ago" },
    { id: "2", title: "NVIDIA Blackwell GPU Benchmarks Leaked", source: "news", relevance: 95, growth: "+215%", timestamp: "12m ago" },
    { id: "3", title: "The Rise of Autonomous AI Agents in DevOps", source: "news", relevance: 92, growth: "+180%", timestamp: "24m ago" },
    { id: "4", title: "New Sarvam AI Voice Models for Indian Languages", source: "social", relevance: 89, growth: "+310%", timestamp: "45m ago" },
    { id: "5", title: "How to Build a Cinematic Studio with React", source: "youtube", relevance: 85, growth: "+95%", timestamp: "1h ago" },
    { id: "6", title: "OpenAI GPT-5 Release Date Rumors", source: "social", relevance: 82, growth: "+540%", timestamp: "2h ago" },
    { id: "7", title: "Quantum Computing Breakthrough in Material Science", source: "news", relevance: 78, growth: "+45%", timestamp: "3h ago" },
  ];
};

export const fetchLogs = async (): Promise<ScraperLog[]> => {
  // Mocking the API call. Replace with real API call in production.
  console.log("Fetching logs from external scraper service...");
  return [
    { id: "1", time: "09:35:12", source: "YT_SCRAPER", status: "success", message: "Parsed 42 trending topics from YouTube India" },
    { id: "2", time: "09:34:45", source: "NEWS_BOT", status: "success", message: "Successfully scraped TechCrunch and Wired" },
    { id: "3", time: "09:34:10", source: "PROXY_MGR", status: "success", message: "Rotated 12 proxy nodes due to latency" },
    { id: "4", time: "09:33:55", source: "SOCIAL_LISTENER", status: "error", message: "Rate limit hit on Twitter API v2. Switching to backup scraper." },
    { id: "5", time: "09:33:20", source: "CLEANER", status: "success", message: "Normalized 1,240 data points. Removed 12 duplicates." },
    { id: "6", time: "09:32:45", source: "RANKER", status: "success", message: "Recalculated velocity scores for 450 active signals" },
    { id: "7", time: "09:32:10", source: "YT_SCRAPER", status: "success", message: "Connection established with proxy node 124.8.2.1" },
  ];
};

export const triggerScrape = async (): Promise<{ trends: Trend[], logs: ScraperLog[] }> => {
  console.log("Triggering manual scrape...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const trends = await fetchTrends();
  const logs = [
    { 
      id: Date.now().toString(), 
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }), 
      source: "MANUAL_TRIGGER", 
      status: "success" as const, 
      message: "Manual scrape triggered by user. Refreshing all 120+ data sources." 
    },
    ...(await fetchLogs())
  ];
  
  return { trends, logs };
};
