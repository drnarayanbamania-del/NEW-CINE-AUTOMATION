import React, { useState, useEffect } from "react";
import { Key, Save, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ApiKeysView() {
  const [keys, setKeys] = useState({
    openai: "",
    runway: "",
    sarvam: "",
    elevenlabs: "",
  });

  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { valid: boolean; message: string } | null>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem("ai_studio_api_keys");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setKeys(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved keys", e);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem("ai_studio_api_keys", JSON.stringify(keys));
      setSaveMessage("All changes saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      setSaveMessage("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (provider: string, key: string) => {
    if (!key) return;
    
    setVerifying(prev => ({ ...prev, [provider]: true }));
    setResults(prev => ({ ...prev, [provider]: null }));
    
    try {
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key })
      });
      
      const data = await response.json();
      setResults(prev => ({ ...prev, [provider]: { valid: response.ok, message: data.message } }));
    } catch (e) {
      setResults(prev => ({ ...prev, [provider]: { valid: false, message: "Network error during verification." } }));
    } finally {
      setVerifying(prev => ({ ...prev, [provider]: false }));
    }
  };

  const providers = [
    { id: "openai", label: "OpenAI API Key", description: "Used for Script Gen & Prompt Enhancement" },
    { id: "runway", label: "Runway ML API Secret", description: "Used for high-fidelity Video Gen" },
    { id: "sarvam", label: "Sarvam AI API Key", description: "Used for multi-lingual Voice Gen" },
    { id: "elevenlabs", label: "ElevenLabs API Key", description: "Used for Video & Voice Gen" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API Key Management</h1>
          <p className="text-zinc-400 mt-1">Manage and secure your AI provider API keys.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes("Failed") ? "text-rose-400" : "text-emerald-400"}`}>
              {saveMessage}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-8">
            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2 mb-8">
              <Key className="w-5 h-5 text-emerald-400" />
              AI Provider Keys
            </h2>
            
            <div className="space-y-8">
              {providers.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-300">{p.label}</label>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{p.description}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="password" 
                        value={keys[p.id as keyof typeof keys]}
                        onChange={(e) => setKeys({...keys, [p.id]: e.target.value})}
                        placeholder="sk-••••••••••••••••••••••••"
                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                      {results[p.id] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {results[p.id]?.valid ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleVerify(p.id, keys[p.id as keyof typeof keys])}
                      disabled={verifying[p.id] || !keys[p.id as keyof typeof keys]}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                    >
                      {verifying[p.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                    </button>
                  </div>
                  {results[p.id] && (
                    <p className={`mt-2 text-xs font-medium ${results[p.id]?.valid ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                      {results[p.id]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-rose-400" />
              Security
            </h2>
            <div className="space-y-4">
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
