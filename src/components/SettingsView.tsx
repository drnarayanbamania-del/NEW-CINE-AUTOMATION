import React, { useState } from "react";
import { Key, Save, Shield, Database, Cloud, Youtube, Instagram, Twitter, BrainCircuit, Sparkles } from "lucide-react";

export default function SettingsView({ 
  autoShortsEnabled, 
  setAutoShortsEnabled, 
  shortsModel, 
  setShortsModel 
}: { 
  autoShortsEnabled: boolean;
  setAutoShortsEnabled: (val: boolean) => void;
  shortsModel: string;
  setShortsModel: (val: string) => void;
}) {
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [require2FA, setRequire2FA] = useState(true);

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/settings/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: youtubeApiKey, channelId: youtubeChannelId })
      });
      if (!response.ok) throw new Error("Failed to connect YouTube.");
      alert("YouTube connected successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings & Integrations</h1>
          <p className="text-zinc-400 mt-1">Manage integrations, database config, and general settings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-medium transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Integrations */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Models */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2 mb-6">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              AI Model Configuration
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-black/30 border border-zinc-800/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-200">OpenAI API</h3>
                      <p className="text-xs text-zinc-500">Used for AI Script & Prompt Generation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">GPT-4o Enabled</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">OpenAI API Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="sk-..." 
                      className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 pr-10"
                    />
                    <Key className="w-4 h-4 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-500 italic">This key is used by the "AI Script Generator" and "AI Prompt Enhancer" workflows.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2 mb-6">
              <Cloud className="w-5 h-5 text-indigo-400" />
              Social Media Integrations
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-black/30 border border-zinc-800/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                      <Youtube className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-200">YouTube Data API v3</h3>
                      <p className="text-xs text-zinc-500">Automated Shorts publishing</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleConnectYouTube}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isConnecting ? "Connecting..." : "Connect YouTube"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">YouTube API Key</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..." 
                      value={youtubeApiKey}
                      onChange={(e) => setYoutubeApiKey(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">YouTube Channel ID</label>
                    <input 
                      type="text" 
                      placeholder="UC..." 
                      value={youtubeChannelId}
                      onChange={(e) => setYoutubeChannelId(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/30 border border-zinc-800/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-200">YouTube Shorts Publishing</h3>
                      <p className="text-xs text-zinc-500">Automated Shorts generation & publishing</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setAutoShortsEnabled(!autoShortsEnabled)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoShortsEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${autoShortsEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">AI Model for Shorts</label>
                    <select
                      value={shortsModel}
                      onChange={(e) => setShortsModel(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="Veo">Veo</option>
                      <option value="Gemini">Gemini</option>
                    </select>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/generate-shorts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ model: shortsModel, autoPublish: autoShortsEnabled })
                        });
                        const data = await response.json();
                        if (data.success) {
                          alert(data.message);
                        } else {
                          throw new Error(data.error || "Failed to generate shorts.");
                        }
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors border border-zinc-700/50 flex items-center justify-center gap-2"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Generate & Publish Now
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center border border-pink-500/20">
                    <Instagram className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200">Instagram Graph API</h3>
                    <p className="text-xs text-zinc-500">Automated Reels publishing</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors">Connect</button>
              </div>
            </div>
          </div>
        </div>

        {/* System Config */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2 mb-6">
              <Database className="w-5 h-5 text-amber-400" />
              Database & Queue
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">PostgreSQL URI</label>
                <div className="font-mono text-sm text-zinc-300 bg-black/50 p-2 rounded border border-zinc-800 truncate">postgres://user:pass@db.internal:5432/ai_factory</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Redis Queue URL</label>
                <div className="font-mono text-sm text-zinc-300 bg-black/50 p-2 rounded border border-zinc-800 truncate">redis://queue.internal:6379</div>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Queue Status</span>
                  <span className="text-emerald-400 flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Healthy</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-rose-400" />
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Require 2FA for Publishing</span>
                <div 
                  onClick={() => setRequire2FA(!require2FA)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-all hover:scale-105 active:scale-95 ${require2FA ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${require2FA ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Auto-rotate API Keys</span>
                <div 
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-all hover:scale-105 active:scale-95 ${autoRotate ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${autoRotate ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
