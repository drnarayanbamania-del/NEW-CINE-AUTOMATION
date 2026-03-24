import React, { useState, useEffect } from "react";
import { Search, Globe, Shield, RefreshCw, BarChart3, Clock, Zap, Youtube, Newspaper, Share2, Activity, Loader2 } from "lucide-react";
import { fetchTrends, fetchLogs, triggerScrape, Trend, ScraperLog } from "../services/scraperService";

export default function ScraperView({ onGenerateFromTrend, apiBaseUrl }: { onGenerateFromTrend: (title: string) => void, apiBaseUrl: string }) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [filter, setFilter] = useState<"all" | "youtube" | "news" | "social">("all");

  const loadScraperData = async () => {
    setIsRefreshing(true);
    try {
      const [trendsData, logsData] = await Promise.all([
        fetchTrends(),
        fetchLogs()
      ]);
      
      setTrends(trendsData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load scraper data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    try {
      const { trends: newTrends, logs: newLogs } = await triggerScrape();
      setTrends(newTrends);
      setLogs(newLogs);
    } catch (err) {
      console.error("Manual trigger failed:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    loadScraperData();
    const interval = setInterval(loadScraperData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const filteredTrends = trends.filter(t => filter === "all" || t.source === filter);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            Signals Engine
          </h1>
          <p className="text-zinc-400 mt-1 text-sm sm:text-base">Autonomous trend discovery & content scraping system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            Next Refresh: 14:22
          </div>
          <button 
            onClick={handleManualTrigger}
            disabled={isTriggering || isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            {isTriggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Trigger Scrape
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Status</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">Active</span>
            <span className="text-xs text-emerald-500 font-medium">98.2% Success</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98.2%]"></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Proxy Health</span>
            <Shield className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">124/128</span>
            <span className="text-xs text-blue-500 font-medium">Rotating</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[96%]"></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Data Sources</span>
            <Search className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">120+</span>
            <span className="text-xs text-amber-500 font-medium">Connected</span>
          </div>
          <div className="flex gap-1">
            <div className="h-1 w-4 bg-amber-500 rounded-full"></div>
            <div className="h-1 w-4 bg-amber-500 rounded-full"></div>
            <div className="h-1 w-4 bg-amber-500 rounded-full"></div>
            <div className="h-1 w-4 bg-zinc-800 rounded-full"></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Signals/Min</span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">842</span>
            <span className="text-xs text-indigo-500 font-medium">+14% vs avg</span>
          </div>
          <div className="flex items-end gap-0.5 h-4">
            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
              <div key={i} className="w-1 bg-indigo-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trends Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Live Trend Signals
              </h2>
              <div className="flex bg-black/50 rounded-lg p-1 border border-zinc-800">
                {(["all", "youtube", "news", "social"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md transition-colors ${
                      filter === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-800/40">
              {filteredTrends.length > 0 ? (
                filteredTrends.map((trend) => (
                  <div key={trend.id} className="p-4 hover:bg-zinc-800/20 transition-colors flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      trend.source === 'youtube' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      trend.source === 'news' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-pink-500/10 border-pink-500/20 text-pink-500'
                    }`}>
                      {trend.source === 'youtube' && <Youtube className="w-5 h-5" />}
                      {trend.source === 'news' && <Newspaper className="w-5 h-5" />}
                      {trend.source === 'social' && <Share2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                        {trend.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{trend.source}</span>
                        <span className="text-[10px] font-mono text-zinc-500">•</span>
                        <span className="text-[10px] font-mono text-zinc-500">{trend.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-400">{trend.growth}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">Velocity</div>
                    </div>
                    <div className="pl-4 border-l border-zinc-800/60 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-xs font-bold text-zinc-300">{trend.relevance}%</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">Rank</div>
                      </div>
                      <button 
                        onClick={() => onGenerateFromTrend(trend.title)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3" />
                        Full Production
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
                  <p>Analyzing global signals...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-zinc-800/60">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-zinc-400" />
                Scraper Logs
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 leading-relaxed">
                  <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                  <span className={log.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-zinc-400 shrink-0">[{log.source}]</span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
