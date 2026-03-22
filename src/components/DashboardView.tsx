import React, { useEffect, useState } from "react";
import { Activity, FileText, Image as ImageIcon, Video, Share2, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardView() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <div className="p-8 text-zinc-400">Loading analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Real-time metrics from your AI content factory.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Workflows" value={stats.activeWorkflows} icon={<Activity className="w-5 h-5 text-indigo-400" />} trend="+2 this week" />
        <StatCard title="Generated Assets" value={stats.generatedContent} icon={<FileText className="w-5 h-5 text-emerald-400" />} trend="+142 today" />
        <StatCard title="Published Posts" value={stats.publishedPosts} icon={<Share2 className="w-5 h-5 text-blue-400" />} trend="+89 today" />
        <StatCard title="Success Rate" value={`${stats.successRate}%`} icon={<TrendingUp className="w-5 h-5 text-amber-400" />} trend="Stable" />
      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-medium">Recent Automation Activity</h2>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {stats.recentActivity.map((activity: any) => (
            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-center gap-4">
                {activity.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-zinc-200">{activity.action}</p>
                  <p className="text-sm text-zinc-500">{activity.topic}</p>
                </div>
              </div>
              <span className="text-sm text-zinc-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-semibold text-zinc-50 mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{trend}</div>
    </div>
  );
}
