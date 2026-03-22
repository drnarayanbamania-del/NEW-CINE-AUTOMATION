import React from "react";
import { Workflow, Activity, Search, Globe, BrainCircuit, FileText, Image as ImageIcon, Mic, Film, Layers, Server } from "lucide-react";

export default function WorkflowsView() {
  const steps = [
    { id: 1, title: "Trending Topic Collector", icon: Search },
    { id: 2, title: "Web Scraper", icon: Globe },
    { id: 3, title: "Topic Analyzer", icon: BrainCircuit },
    { id: 4, title: "AI Script Generator", icon: FileText },
    { id: 5, title: "AI Image Generator", icon: ImageIcon },
    { id: 6, title: "AI Voice Generator", icon: Mic },
    { id: 7, title: "AI Video Generator", icon: Film },
    { id: 8, title: "Content Composer", icon: Layers },
  ];

  const monitorStages = [
    { id: 1, title: "Trending Topic Collector" },
    { id: 2, title: "Web Scraper" },
    { id: 3, title: "Topic Analyzer" },
    { id: 4, title: "AI Script Generator" },
    { id: 5, title: "AI Image Generator" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">End-to-end AI production flow</h1>
          <p className="text-zinc-400 mt-2 text-base sm:text-lg">Automated pipeline for continuous content generation.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Workflow className="w-4 h-4" />
          View Workflow Builder
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-zinc-800"></div>

          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-6 group">
                  {/* Step Number / Icon Container */}
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-zinc-950 border-2 border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {step.id}
                    </div>
                    <Icon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-6 transition-all group-hover:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-medium text-zinc-100">{step.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                          <Activity className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                    </div>
                    
                    {step.id === 2 ? (
                      <div className="space-y-3">
                        <p className="text-zinc-400 text-sm font-medium">Signals engine for trend discovery</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Capabilities</div>
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Infrastructure</div>
                          <ul className="text-xs text-zinc-400 space-y-1">
                            <li>• Trending YouTube topics</li>
                            <li>• Top news articles</li>
                            <li>• Viral social media content</li>
                          </ul>
                          <ul className="text-xs text-zinc-400 space-y-1">
                            <li>• Proxy rotation & anti-bot</li>
                            <li>• Data cleaning & normalization</li>
                            <li>• Topic ranking algorithm</li>
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-emerald-400/70 font-mono">
                          <span>Data refresh: every 15 min</span>
                          <span>Sources: 120+</span>
                          <span>Success rate: 98.2%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">
                        Autonomous step with observability & fallback logic.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                Live Automation Monitor
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse">
                Active
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {monitorStages.map((stage) => (
                <div key={stage.id} className="bg-black/40 border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200">{stage.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Pipeline stage {stage.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-400">Running</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-xs text-emerald-400/80 font-mono flex items-center justify-center text-center">
              Queue: 1,248 jobs &middot; GPU utilization: 78% &middot; ETA: 9 min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
