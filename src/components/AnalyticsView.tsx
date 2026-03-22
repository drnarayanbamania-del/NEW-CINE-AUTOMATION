import React from "react";
import { BarChart3, TrendingUp, Users, Video, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function AnalyticsView() {
  const stats = [
    { label: "Total Videos Generated", value: "1,248", change: "+12%", icon: Video, color: "text-indigo-400" },
    { label: "Publish Success Rate", value: "98.5%", change: "+2.1%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Active Workflows", value: "12", change: "0%", icon: Activity, color: "text-amber-400" },
    { label: "Total Views (Est)", value: "4.2M", change: "+45%", icon: TrendingUp, color: "text-rose-400" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics Dashboard</h1>
          <p className="text-zinc-400 mt-1">Monitor your AI content factory performance.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-zinc-800/50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-semibold text-zinc-100 mb-1">{stat.value}</h3>
            <p className="text-sm text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-zinc-100 mb-6">Generation Activity (Last 30 Days)</h3>
          <div className="h-64 flex items-end gap-2">
            {/* Mock Bar Chart */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm transition-colors relative group"
                style={{ height: `${Math.max(10, Math.random() * 100)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {Math.floor(Math.random() * 50)} videos
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-zinc-500">
            <span>Mar 1</span>
            <span>Mar 15</span>
            <span>Mar 30</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-zinc-100 mb-6">Recent Jobs</h3>
          <div className="space-y-4">
            {[
              { name: "Tech News Shorts", status: "success", time: "10m ago" },
              { name: "Crypto Recap", status: "failed", time: "1h ago" },
              { name: "Daily Motivation", status: "success", time: "3h ago" },
              { name: "Product Review", status: "processing", time: "Just now" },
              { name: "AI News Update", status: "success", time: "5h ago" },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  {job.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {job.status === 'failed' && <XCircle className="w-4 h-4 text-rose-500" />}
                  {job.status === 'processing' && <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{job.name}</p>
                    <p className="text-xs text-zinc-500">{job.time}</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded ${
                  job.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  job.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
