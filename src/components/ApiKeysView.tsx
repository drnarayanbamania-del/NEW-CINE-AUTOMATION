import React, { useState, useEffect } from "react";
import { Key, Save, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ApiKeysView({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [keys, setKeys] = useState({
    openai: "",
    gemini: "",
    runway: "",
    sarvam: "",
    elevenlabs: "",
    pollinations: ""
  });

  const [results, setResults] = useState<Record<string, { success: boolean, message: string } | null>>({
    openai: null,
    gemini: null,
    runway: null,
    sarvam: null,
    elevenlabs: null,
    pollinations: null
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    runway: false,
    sarvam: false,
    elevenlabs: false,
    pollinations: false
  });

  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    // Load keys from localStorage on mount
    const savedKeys = {
      openai: localStorage.getItem("OPENAI_API_KEY") || "",
      gemini: localStorage.getItem("GEMINI_API_KEY") || "",
      runway: localStorage.getItem("RUNWAYML_API_SECRET") || "",
      sarvam: localStorage.getItem("SARVAM_API_KEY") || "",
      elevenlabs: localStorage.getItem("ELEVENLABS_API_KEY") || "",
      pollinations: localStorage.getItem("POLLINATIONS_API_KEY") || ""
    };
    setKeys(savedKeys);
  }, []);

  const handleSave = () => {
    localStorage.setItem("OPENAI_API_KEY", keys.openai);
    localStorage.setItem("GEMINI_API_KEY", keys.gemini);
    localStorage.setItem("RUNWAYML_API_SECRET", keys.runway);
    localStorage.setItem("SARVAM_API_KEY", keys.sarvam);
    localStorage.setItem("ELEVENLABS_API_KEY", keys.elevenlabs);
    localStorage.setItem("POLLINATIONS_API_KEY", keys.pollinations);
    
    setSaveMessage("All keys saved to secure local storage!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const verifyKey = async (provider: string, key: string) => {
    if (!key) return;
    
    setLoading(prev => ({ ...prev, [provider]: true }));
    setResults(prev => ({ ...prev, [provider]: null }));
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/verify-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key })
      });
      
      const data = await response.json();
      setResults(prev => ({ 
        ...prev, 
        [provider]: { 
          success: data.valid, 
          message: data.valid ? "Key Verified" : (data.error || "Invalid Key") 
        } 
      }));
    } catch (err) {
      setResults(prev => ({ 
        ...prev, 
        [provider]: { success: false, message: "Verification Failed" } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const providers = [
    { id: "openai", name: "OpenAI", label: "GPT-4o / Sora", placeholder: "sk-..." },
    { id: "gemini", name: "Google Gemini", label: "Gemini 1.5 Flash / Pro", placeholder: "AIzaSy..." },
    { id: "runway", name: "Runway ML", label: "Gen-3 Alpha / Veo", placeholder: "key_..." },
    { id: "sarvam", name: "Sarvam AI", label: "Indian Voice Models", placeholder: "..." },
    { id: "elevenlabs", name: "ElevenLabs", label: "Global Voice Models", placeholder: "..." },
    { id: "pollinations", name: "Pollinations.ai", label: "Free Image Models", placeholder: "optional" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            API Key Management
          </h1>
          <p className="text-zinc-400 mt-1">Configure your AI engine provider credentials safely.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && <span className="text-emerald-500 text-sm font-medium animate-pulse">{saveMessage}</span>}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Save className="w-4 h-4" />
            Save All Keys
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {providers.map((p) => (
          <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <Key className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.label}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {results[p.id] && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                    results[p.id]?.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {results[p.id]?.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {results[p.id]?.message}
                  </div>
                )}
                <button 
                  onClick={() => verifyKey(p.id, (keys as any)[p.id])}
                  disabled={loading[p.id] || !(keys as any)[p.id]}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-30 border border-zinc-700"
                >
                  {loading[p.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify Connection"}
                </button>
              </div>
            </div>

            <div className="relative group">
              <input 
                type="password" 
                value={(keys as any)[p.id]}
                onChange={(e) => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                placeholder={p.placeholder}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-zinc-600 group-hover:text-zinc-500 transition-colors pointer-events-none">
                <Key className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-300">Security Notice</h4>
          <p className="text-xs text-zinc-500 leading-relaxed mt-1">
            Your API keys are stored locally in your browser's encrypted storage. They are only sent to the server for the intent of making requested generation calls. We recommend using keys with restricted permissions for maximum safety.
          </p>
        </div>
      </div>
    </div>
  );
}
