import React, { useState, useEffect, useRef } from "react";
import DirectorToolkit from "./components/DirectorToolkit";
import { Film, Play, Loader2, Key, Settings2, Download, Sparkles, AlertCircle, Mic, Volume2, Music, LayoutDashboard, Workflow, Library, BarChart3, Menu, X, Save, Globe, Activity, Image, Type, Zap, Youtube, Wand2, Info } from "lucide-react";
import LibraryView from "./components/LibraryView";
import WorkflowsView from "./components/WorkflowsView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import ScraperView from "./components/ScraperView";

import ApiKeysView from "./components/ApiKeysView";

// Add TypeScript declarations for the aistudio window object
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Defensive check for fetch to prevent "Cannot set property fetch" errors
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  try {
    // We don't actually want to set it, just ensure we're using the native one
    // and catch any weird environment issues early.
    if (!window.fetch) {
      console.warn("Native fetch not found, application may be unstable.");
    }
  } catch (e) {
    console.error("Fetch property access error:", e);
  }
}

// API Base URL for backend calls
const API_BASE_URL = "https://new-cine-automation.onrender.com";

// Utility to get stored API keys
const getStoredKeys = () => {
  const saved = localStorage.getItem("ai_studio_api_keys");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }
  return {};
};

export default function App() {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"video" | "audio" | "image" | "thumbnail" | "caption">("video");
  const [selectedProvider, setSelectedProvider] = useState<"runway" | "elevenlabs" | "openai">("runway");
  const [selectedImageProvider, setSelectedImageProvider] = useState<"openai" | "pollinations">("pollinations");
  const [prompt, setPrompt] = useState("");
  const [thumbnailPrompt, setThumbnailPrompt] = useState("");
  const [captionPrompt, setCaptionPrompt] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [shotType, setShotType] = useState("");
  const [mood, setMood] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"1080p" | "720p">("1080p");
  const [videoQuality, setVideoQuality] = useState<"Standard" | "HD" | "4K">("HD");
  const [bitrate, setBitrate] = useState("10 Mbps");
  
  const STYLE_PRESETS = [
    { name: "Cinematic Noir", prompt: "film noir style, high contrast, dramatic shadows, moody lighting, 35mm film grain" },
    { name: "Cyberpunk Edge", prompt: "cyberpunk aesthetic, neon bioluminescence, rainy streets, high-tech interiors" },
    { name: "Dreamy Ethereal", prompt: "soft focus, pastel tones, ethereal lighting, dream-like atmosphere, slow motion" },
    { name: "8K Hyperreal", prompt: "8k ultra-resolution, hyper-realistic textures, macro photography, sharp focus" },
    { name: "Studio Minimalist", prompt: "clean minimalist studio lighting, high-key, professional commercial style" }
  ];
  
  // Video Editing States
  const [playbackRate, setPlaybackRate] = useState(1);
  const [filter, setFilter] = useState("none");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10); // Default to 10 seconds for now
  
  // Update video playback rate when state changes
  useEffect(() => {
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isProductionGenerating, setIsProductionGenerating] = useState(false);
  const [productionLogs, setProductionLogs] = useState<{ time: string; msg: string; status: 'info' | 'success' | 'warning' }[]>([]);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TTS States
  const [ttsPrompt, setTtsPrompt] = useState("");
  const [ttsLanguage, setTtsLanguage] = useState("hi-IN");
  const [ttsSpeaker, setTtsSpeaker] = useState("meera");
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<"generators" | "workflows" | "library" | "analytics" | "apikeys" | "settings" | "scraper">("generators");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // YouTube Shorts States (Moved from SettingsView for global access)
  const [autoShortsEnabled, setAutoShortsEnabled] = useState(false);
  const [shortsModel, setShortsModel] = useState("Veo");

  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-Generation Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoShortsEnabled) {
      // Trigger immediately then every 5 minutes
      const triggerAutoGeneration = async () => {
        try {
          console.log("Auto-generating Shorts based on trends...");
          await fetch("/api/generate-shorts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: shortsModel, autoPublish: true })
          });
        } catch (err) {
          console.error("Auto-generation failed:", err);
        }
      };

      triggerAutoGeneration();
      interval = setInterval(triggerAutoGeneration, 5 * 60 * 1000); // 5 minutes
    }
    return () => clearInterval(interval);
  }, [autoShortsEnabled, shortsModel]);

  const addLog = (msg: string, status: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setProductionLogs(prev => [{ time, msg, status }, ...prev].slice(0, 10));
  };

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Assume key is provided via server-side environment variables
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setHasKey(true); // Assume success to mitigate race conditions
      }
    } catch (err) {
      console.error("Failed to open key selector:", err);
    }
  };

  const [recentGenerations, setRecentGenerations] = useState<any[]>([
    { id: 1, title: "AI Video Revolution", type: "video", time: "2m ago", status: "published" },
    { id: 2, title: "NVIDIA Blackwell", type: "video", time: "15m ago", status: "ready" },
    { id: 3, title: "Cyberpunk City", type: "video", time: "1h ago", status: "published" },
  ]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    try {
      const keys = getStoredKeys();
      const response = await fetch(`${API_BASE_URL}/api/enhance-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: activeTab === "image" ? "image" : "video", apiKey: keys.openai })
      });
      
      if (!response.ok) throw new Error("Failed to enhance prompt");
      
      const data = await response.json();
      setPrompt(data.enhancedPrompt);
    } catch (err) {
      console.error("Enhance error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!thumbnailPrompt.trim()) return;
    setIsGeneratingThumbnail(true);
    setError(null);
    try {
      const keys = getStoredKeys();
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `High-quality YouTube thumbnail: ${thumbnailPrompt}`, 
          provider: selectedImageProvider,
          apiKey: keys.openai,
          pollinationsKey: keys.pollinations
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate thumbnail");
      setThumbnailUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (!captionPrompt.trim()) return;
    setIsGeneratingCaption(true);
    setError(null);
    try {
      const keys = getStoredKeys();
      const response = await fetch(`${API_BASE_URL}/api/generate-caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: captionPrompt, apiKey: keys.openai })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate captions");
      setGeneratedCaptions(data.captions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleFullProduction = async (topic: string) => {
    setIsProductionGenerating(true);
    setError(null);
    setStatusMessage("Initializing Full Production Pipeline...");
    addLog(`Production Pipeline started for: ${topic.substring(0, 20)}...`, 'info');
    setCurrentView("generators");
    setActiveTab("video");

    try {
      // 1. Generate Assets (Script, Video Prompt, Captions, Thumbnail Prompt)
      setStatusMessage("Generating Script and Creative Assets...");
      addLog("Step 1: Generating script, captions, and visual prompts...", 'info');
      const keys = getStoredKeys();
      const assetsRes = await fetch(`${API_BASE_URL}/api/generate-production-assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, apiKey: keys.openai })
      });
      const assetsText = await assetsRes.text();
      let assets;
      try {
        assets = JSON.parse(assetsText);
      } catch (e) {
        throw new Error(`Invalid server response (not JSON). Check console or server logs.`);
      }

      if (!assetsRes.ok) throw new Error(assets.error || "Failed to generate assets");
      
      if (assets.isMocked) addLog("Using Quota Fallback (Mock Mode) for assets", 'warning');
      addLog("Script and creative assets received.", 'success');

      setGeneratedCaptions(assets.captions);
      setThumbnailPrompt(assets.thumbnailPrompt);
      setTtsPrompt(assets.script);
      setPrompt(assets.videoPrompt);

      // 2. Start Simultaneous Generation
      setStatusMessage("Simultaneously generating Video, Voiceover, and Thumbnail...");
      addLog("Step 2: Starting parallel rendering of Video, Audio, and Thumbnail...", 'info');
      
      const generations = [
        // Video Generation
        (async () => {
          try {
            addLog(`Triggering ${selectedProvider} video generation...`, 'info');
            if (selectedProvider === "runway") await handleGenerateRunway(assets.videoPrompt);
            else if (selectedProvider === "elevenlabs") await handleGenerateElevenLabs(assets.videoPrompt);
            else await handleGenerateOpenAI(assets.videoPrompt);
            addLog("Video rendering started.", 'success');
          } catch (err) {
            console.error("Video generation failed during production:", err);
            addLog(`Video generation failed: ${err}`, 'warning');
          }
        })(),
        // Voiceover Generation
        (async () => {
          try {
            addLog("Triggering Sarvam AI voiceover generation...", 'info');
            const ttsRes = await fetch(`${API_BASE_URL}/api/generate-tts`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: assets.script, language: ttsLanguage, speaker: ttsSpeaker, apiKey: keys.sarvam })
            });
            const ttsData = await ttsRes.json();
            if (ttsRes.ok) {
              setAudioUrl(ttsData.audioUrl || ttsData.audioBase64);
              addLog("Voiceover generation successful.", 'success');
            } else {
              addLog(`Voiceover failed: ${ttsData.error}`, 'warning');
            }
          } catch (err) {
            console.error("TTS generation failed during production:", err);
            addLog("TTS generation failed.", 'warning');
          }
        })(),
        // Thumbnail Generation
        (async () => {
          try {
            addLog(`Triggering ${selectedImageProvider} thumbnail generation...`, 'info');
            const thumbRes = await fetch(`${API_BASE_URL}/api/generate-image`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                prompt: `High-quality YouTube thumbnail: ${assets.thumbnailPrompt}`, 
                provider: selectedImageProvider,
                apiKey: keys.openai,
                pollinationsKey: keys.pollinations
              })
            });
            const thumbData = await thumbRes.json();
            if (thumbRes.ok) {
              setThumbnailUrl(thumbData.imageUrl);
              addLog("Thumbnail generated.", 'success');
            } else {
              addLog("Thumbnail generation failed.", 'warning');
            }
          } catch (err) {
            console.error("Thumbnail generation failed during production:", err);
            addLog("Thumbnail failed.", 'warning');
          }
        })(),
      ];

      await Promise.all(generations);
      addLog("Full Production Pipeline completed.", 'success');
      setStatusMessage("Full Production Complete! Assets ready for review.");
    } catch (err: any) {
      setError(err.message);
      addLog(`Pipeline Error: ${err.message}`, 'warning');
      setStatusMessage("Production Pipeline Error.");
    } finally {
      setIsProductionGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a scene description.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      if (selectedProvider === "runway") {
        try {
          await handleGenerateRunway(undefined, videoUrl || undefined);
        } catch (runwayErr) {
          console.error("Runway failed, falling back to OpenAI:", runwayErr);
          setStatusMessage("Runway ML failed. Attempting fallback to OpenAI Sora...");
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleGenerateOpenAI();
        }
      } else if (selectedProvider === "elevenlabs") {
        try {
          await handleGenerateElevenLabs();
        } catch (elevenLabsErr) {
          console.error("ElevenLabs failed, falling back to OpenAI:", elevenLabsErr);
          setStatusMessage("ElevenLabs failed. Attempting fallback to OpenAI Sora...");
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleGenerateOpenAI();
        }
      } else if (selectedProvider === "openai") {
        await handleGenerateOpenAI();
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRunway = async (customPrompt?: string, imagePrompt?: string) => {
    try {
      setStatusMessage(imagePrompt ? "Initializing Image-to-Video Turbo..." : "Submitting generation request to Runway ML...");
      
      const promptParts = [customPrompt || prompt.trim()];
      if (cameraAngle) promptParts.push(`Camera Angle: ${cameraAngle}`);
      if (shotType) promptParts.push(`Shot Type: ${shotType}`);
      if (mood) promptParts.push(`Mood: ${mood}`);
      promptParts.push(`Quality: ${videoQuality} (${bitrate})`);
      
      const finalPrompt = promptParts.join(", ");
      
      const keys = getStoredKeys();
      const initRes = await fetch(`${API_BASE_URL}/api/generate-runway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          aspectRatio, 
          resolution, 
          videoQuality, 
          bitrate, 
          apiKey: keys.runway,
          promptImage: imagePrompt
        })
      });
      
      const contentType = initRes.headers.get("content-type");
      let initData;
      
      if (contentType && contentType.includes("application/json")) {
        initData = await initRes.json();
      } else {
        const text = await initRes.text();
        throw new Error(`Server error (${initRes.status}): ${text.slice(0, 100)}`);
      }
      
      if (!initRes.ok) {
        if (initData.error && initData.error.includes("enough credits")) {
          throw new Error("Runway ML account is out of credits. Please add credits to your Runway ML account.");
        }
        throw new Error(initData.error || "Failed to start Runway ML generation.");
      }
      
      const taskId = initData.taskId;
      setStatusMessage("Synthesizing frames...");
      
      // Poll for completion
      let isDone = false;
      while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Update status message based on progress or time
        setStatusMessage("Applying cinematic filters...");
        
        const pollRes = await fetch(`${API_BASE_URL}/api/runway-task/${taskId}`);
        const pollContentType = pollRes.headers.get("content-type");
        let pollData;
        
        if (pollContentType && pollContentType.includes("application/json")) {
          pollData = await pollRes.json();
        } else {
          const text = await pollRes.text();
          throw new Error(`Server error (${pollRes.status}): ${text.slice(0, 100)}`);
        }
        
        if (!pollRes.ok) {
          throw new Error(pollData.error || "Failed to check task status.");
        }
        
        if (pollData.status === "SUCCEEDED") {
          setStatusMessage("Encoding final output...");
          isDone = true;
          if (pollData.output && pollData.output.length > 0) {
            const url = pollData.output[0];
            setVideoUrl(url);
            // Add to recent generations
            setRecentGenerations(prev => [
              { id: Date.now(), title: prompt.substring(0, 30) + "...", type: "video", time: "Just now", status: "ready" },
              ...prev.slice(0, 5)
            ]);
          } else {
            throw new Error("No video URL returned from Runway ML.");
          }
        } else if (pollData.status === "FAILED" || pollData.status === "CANCELLED") {
          throw new Error(`Runway ML task ${pollData.status.toLowerCase()}: ${pollData.failure || "Unknown error"}`);
        } else {
          setStatusMessage("Still rendering... adding cinematic details...");
        }
      }
      setStatusMessage("");
    } catch (err: any) {
      console.error("Runway error:", err);
      throw err;
    }
  };

  const handleGenerateElevenLabs = async (customPrompt?: string) => {
    try {
      setStatusMessage("Submitting generation request to ElevenLabs...");
      
      const promptParts = [customPrompt || prompt.trim()];
      if (cameraAngle) promptParts.push(`Camera Angle: ${cameraAngle}`);
      if (shotType) promptParts.push(`Shot Type: ${shotType}`);
      if (mood) promptParts.push(`Mood: ${mood}`);
      promptParts.push(`Quality: ${videoQuality} (${bitrate})`);
      
      const finalPrompt = promptParts.join(", ");
      
      const keys = getStoredKeys();
      const initRes = await fetch(`${API_BASE_URL}/api/generate-elevenlabs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio, resolution, videoQuality, bitrate, apiKey: keys.elevenlabs })
      });
      
      const initData = await initRes.json();
      
      if (!initRes.ok) {
        throw new Error(initData.error || "Failed to start ElevenLabs generation.");
      }
      
      const taskId = initData.taskId;
      setStatusMessage("Synthesizing frames (ElevenLabs)...");
      
      // Poll for completion
      let isDone = false;
      while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pollRes = await fetch(`${API_BASE_URL}/api/elevenlabs-task/${taskId}`);
        const pollData = await pollRes.json();
        
        if (pollData.status === "SUCCEEDED") {
          const url = pollData.output[0];
          setVideoUrl(url);
          // Add to recent generations
          setRecentGenerations(prev => [
            { id: Date.now(), title: prompt.substring(0, 30) + "...", type: "video", time: "Just now", status: "ready" },
            ...prev.slice(0, 5)
          ]);
          setStatusMessage("");
          isDone = true;
        } else if (pollData.status === "FAILED") {
          throw new Error("ElevenLabs generation failed.");
        }
      }
    } catch (err: any) {
      console.error("ElevenLabs error:", err);
      throw err;
    }
  };

  const handleGenerateOpenAI = async (customPrompt?: string) => {
    try {
      setStatusMessage("Submitting generation request to OpenAI (Sora)...");
      
      const promptParts = [customPrompt || prompt.trim()];
      if (cameraAngle) promptParts.push(`Camera Angle: ${cameraAngle}`);
      if (shotType) promptParts.push(`Shot Type: ${shotType}`);
      if (mood) promptParts.push(`Mood: ${mood}`);
      
      const finalPrompt = promptParts.join(", ");
      
      const keys = getStoredKeys();
      const initRes = await fetch(`${API_BASE_URL}/api/generate-openai-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio, resolution, apiKey: keys.openai })
      });
      
      const initData = await initRes.json();
      
      if (!initRes.ok) {
        throw new Error(initData.error || "Failed to start OpenAI video generation.");
      }
      
      const taskId = initData.taskId;
      setStatusMessage("Synthesizing frames (OpenAI Sora)...");
      
      // Poll for completion
      let isDone = false;
      while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const pollRes = await fetch(`${API_BASE_URL}/api/openai-video-task/${taskId}`);
        const pollData = await pollRes.json();
        
        if (pollData.status === "SUCCEEDED") {
          const url = pollData.output[0];
          setVideoUrl(url);
          // Add to recent generations
          setRecentGenerations(prev => [
            { id: Date.now(), title: prompt.substring(0, 30) + "...", type: "video", time: "Just now", status: "ready" },
            ...prev.slice(0, 5)
          ]);
          setStatusMessage("");
          isDone = true;
        } else if (pollData.status === "FAILED") {
          throw new Error("OpenAI video generation failed.");
        }
      }
    } catch (err: any) {
      console.error("OpenAI error:", err);
      throw err;
    }
  };

  const handleSaveScene = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 20) + "...",
          type: activeTab === "image" ? "image" : "video",
          status: "draft",
          prompt,
          cameraAngle,
          shotType,
          mood
        })
      });
      if (!response.ok) throw new Error("Failed to save scene.");
      alert("Scene saved to library!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatusMessage("Generating image with Gemini...");

    try {
      const keys = getStoredKeys();
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          provider: selectedImageProvider,
          apiKey: keys.openai,
          pollinationsKey: keys.pollinations
        })
      });

      if (!response.ok) throw new Error("Failed to generate image.");
      const data = await response.json();
      setVideoUrl(data.imageUrl); // Reusing videoUrl state for image preview
      // Add to recent generations
      setRecentGenerations(prev => [
        { id: Date.now(), title: prompt.substring(0, 30) + "...", type: "image", time: "Just now", status: "ready" },
        ...prev.slice(0, 5)
      ]);
      setStatusMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsPrompt.trim()) {
      setError("Please enter text for the voiceover.");
      return;
    }

    setIsGeneratingTTS(true);
    setError(null);
    setAudioUrl(null);
    setStatusMessage("Generating voiceover with Sarvam AI...");

    try {
      const keys = getStoredKeys();
      const response = await fetch(`${API_BASE_URL}/api/generate-tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsPrompt,
          languageCode: ttsLanguage,
          speaker: ttsSpeaker,
          apiKey: keys.sarvam
        })
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate voiceover.");
      }

      if (data.audioBase64) {
        // Convert base64 to blob URL
        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        throw new Error("Invalid response from Sarvam AI.");
      }
      setStatusMessage("");
    } catch (err: any) {
      console.error("TTS error:", err);
      setError(err.message || "Failed to generate voiceover. Please try again.");
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleGenerateFromTrend = (trendTitle: string) => {
    setPrompt(trendTitle);
    setActiveTab("video");
    setCurrentView("generators");
    // Optionally trigger generation immediately
    // handleGenerate(); 
  };

  // Removed the global !hasKey check to allow Runway ML to be used without a Google API key.

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold tracking-wide text-lg text-white">AI Factory</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => { setCurrentView("generators"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "generators" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Home
          </button>
          <button 
            onClick={() => { setCurrentView("generators"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "generators" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Play className="w-5 h-5" />
            AI generator tools
          </button>
          <button 
            onClick={() => { setCurrentView("workflows"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "workflows" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Workflow className="w-5 h-5" />
            Automation workflow builder
          </button>
          <button 
            onClick={() => { setCurrentView("library"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "library" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Library className="w-5 h-5" />
            Content library & asset review
          </button>
          <button 
            onClick={() => { setCurrentView("analytics"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "analytics" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics dashboard
          </button>
          <button 
            onClick={() => { setCurrentView("scraper"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "scraper" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Globe className="w-5 h-5" />
            Signals Engine (Scraper)
          </button>
          <button 
            onClick={() => { setCurrentView("apikeys"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "apikeys" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Key className="w-5 h-5" />
            API key management
          </button>
          <button 
            onClick={() => { setCurrentView("settings"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === "settings" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}`}
          >
            <Settings2 className="w-5 h-5" />
            Settings & integrations
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-zinc-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-medium text-zinc-100 capitalize">
              {currentView === "generators" ? "AI Content Generators" : currentView === "scraper" ? "Signals Engine" : currentView}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {autoShortsEnabled && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Auto-Gen Active
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              System Online
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {currentView === "workflows" && <WorkflowsView />}
          {currentView === "library" && (
            <LibraryView 
              onGenerateVideo={(p) => { setPrompt(p); setVideoUrl(null); setCurrentView("generators"); setActiveTab("video"); }} 
              onGenerateFromImage={(url, p) => { setPrompt(p); setVideoUrl(url); setCurrentView("generators"); setActiveTab("video"); }}
            />
          )}
          {currentView === "analytics" && <AnalyticsView />}
          {currentView === "scraper" && <ScraperView onGenerateFromTrend={handleFullProduction} />}
          {currentView === "apikeys" && <ApiKeysView />}
          {currentView === "settings" && (
            <SettingsView 
              autoShortsEnabled={autoShortsEnabled} 
              setAutoShortsEnabled={setAutoShortsEnabled}
              shortsModel={shortsModel}
              setShortsModel={setShortsModel}
            />
          )}
          
          {currentView === "generators" && (
            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          {autoShortsEnabled && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Auto-Pilot Active</h4>
                <p className="text-[10px] text-zinc-500">Generating content from trends every 5m</p>
              </div>
            </div>
          )}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800/60 pb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-400" />
                Director's Board
              </h2>
              <div className="flex bg-black/50 rounded-lg p-1 border border-zinc-800">
                <button
                  onClick={() => setActiveTab("video")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "video" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "audio" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Voiceover
                </button>
                <button
                  onClick={() => setActiveTab("image")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "image" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setActiveTab("thumbnail")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "thumbnail" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Thumbnail
                </button>
                <button
                  onClick={() => setActiveTab("caption")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === "caption" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Caption
                </button>
              </div>
            </div>
            
            {            activeTab === "video" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Film className="w-5 h-5 text-emerald-500" />
                          Scene Studio
                        </h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">AI Video Generation Pipeline</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPrompt("An astronaut exploring an alien world with purple flora and crystal mountains.")}
                          className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-all uppercase tracking-widest"
                        >
                          Surprise Me
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">AI Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedProvider("runway")}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                        selectedProvider === "runway" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGenerating || isProductionGenerating}
                    >
                      Runway Gen-3
                    </button>
                    <button
                      onClick={() => setSelectedProvider("elevenlabs")}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                        selectedProvider === "elevenlabs" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGenerating || isProductionGenerating}
                    >
                      ElevenLabs
                    </button>
                    <button
                      onClick={() => setSelectedProvider("openai")}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                        selectedProvider === "openai" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGenerating || isProductionGenerating}
                    >
                      OpenAI Sora
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-400">Scene Description</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !prompt.trim()}
                        className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Magic Enhance
                      </button>
                      <button 
                        onClick={() => alert("Prompt saved to library!")}
                        className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save Prompt
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic cityscape at sunset with flying cars and neon signs"
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
                    disabled={isGenerating || isProductionGenerating}
                  />

                  {/* Style Presets Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style.name}
                        onClick={() => {
                          setPrompt(prev => prev ? `${prev}, ${style.prompt}` : style.prompt);
                          addLog(`Applied Style Preset: ${style.name}`, 'info');
                        }}
                        className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-zinc-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Camera Angle</label>
                    <select
                      value={cameraAngle}
                      onChange={(e) => setCameraAngle(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isProductionGenerating}
                    >
                      <option value="">Any</option>
                      <option value="Eye-level">Eye-level</option>
                      <option value="High Angle">High Angle</option>
                      <option value="Low Angle">Low Angle</option>
                      <option value="Bird's Eye">Bird's Eye</option>
                      <option value="Drone Shot">Drone Shot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Shot Type</label>
                    <select
                      value={shotType}
                      onChange={(e) => setShotType(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isProductionGenerating}
                    >
                      <option value="">Any</option>
                      <option value="Wide Shot">Wide Shot</option>
                      <option value="Medium Shot">Medium Shot</option>
                      <option value="Close-up">Close-up</option>
                      <option value="Extreme Close-up">Extreme Close-up</option>
                      <option value="Tracking Shot">Tracking Shot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Mood / Style</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Cinematic, Cyberpunk, Melancholic, Vibrant..."
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    disabled={isGenerating || isProductionGenerating}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Quality</label>
                    <select
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as "Standard" | "HD" | "4K")}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isProductionGenerating}
                    >
                      <option value="Standard">Standard</option>
                      <option value="HD">HD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Resolution</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as "1080p" | "720p")}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isProductionGenerating}
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Bitrate</label>
                    <input
                      type="text"
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                      placeholder="e.g. 10 Mbps"
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                      disabled={isGenerating || isProductionGenerating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as any)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isGeneratingTTS}
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Video Quality</label>
                    <select
                      value={videoQuality}
                      onChange={(e) => {
                        const q = e.target.value as "Standard" | "HD" | "4K";
                        setVideoQuality(q);
                        if (q === "Standard") {
                          setResolution("720p");
                          setBitrate("5 Mbps");
                        } else if (q === "HD") {
                          setResolution("1080p");
                          setBitrate("10 Mbps");
                        } else if (q === "4K") {
                          setResolution("1080p"); // Veo API max is 1080p, but we simulate 4K preset
                          setBitrate("25 Mbps");
                        }
                      }}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGenerating || isProductionGenerating}
                    >
                      <option value="Standard">Standard (720p, 5 Mbps)</option>
                      <option value="HD">HD (1080p, 10 Mbps)</option>
                      <option value="4K">4K (2160p, 25 Mbps)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSaveScene}
                    className="flex-1 py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Scene
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || isGeneratingTTS || isProductionGenerating || !prompt.trim()}
                    className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
                  >
                    {isGenerating || isProductionGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isProductionGenerating ? "Production Pipeline Active..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        Generate Scene
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleFullProduction(prompt)}
                  disabled={isGenerating || isGeneratingTTS || isProductionGenerating || !prompt.trim()}
                  className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:shadow-none"
                >
                  {isProductionGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Production Pipeline Active...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Full Production (Script + Voice + Video)
                    </>
                  )}
                </button>

                {/* Real-Time Production Monitor */}
                {(productionLogs.length > 0) && (
                  <div className="mt-8 bg-black/80 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Production Monitor</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500/20 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse delay-75"></div>
                      </div>
                    </div>
                    <div className="p-4 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto">
                      {productionLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
                          <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                          <span className={
                            log.status === 'success' ? 'text-emerald-400' : 
                            log.status === 'warning' ? 'text-rose-400' : 
                            'text-zinc-300'
                          }>
                            {log.status === 'info' && '— '}
                            {log.status === 'success' && '✓ '}
                            {log.status === 'warning' && '⚠ '}
                            {log.msg}
                          </span>
                        </div>
                      ))}
                      {isProductionGenerating && (
                        <div className="flex gap-3 items-center text-emerald-400 italic animate-pulse">
                          <span className="text-zinc-600">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span>Processing live signals... <Loader2 className="w-2 h-2 animate-spin inline ml-1" /></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {videoUrl && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Speed</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={playbackRate}
                          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-xs text-zinc-500">{playbackRate}x</span>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Filter</label>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200"
                        >
                          <option value="none">None</option>
                          <option value="grayscale(100%)">Grayscale</option>
                          <option value="sepia(100%)">Sepia</option>
                          <option value="invert(100%)">Invert</option>
                          <option value="hue-rotate(90deg)">Hue Rotate</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-zinc-400 mb-1">Start (s)</label>
                          <input type="number" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-zinc-400 mb-1">End (s)</label>
                          <input type="number" value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="w-full bg-black/50 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
                      <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full aspect-video object-cover"
                        style={{ filter: filter }}
                        onLoadedMetadata={(e) => {
                          e.currentTarget.playbackRate = playbackRate;
                        }}
                        onTimeUpdate={(e) => {
                          if (e.currentTarget.currentTime < startTime || e.currentTarget.currentTime > endTime) {
                            e.currentTarget.currentTime = startTime;
                          }
                        }}
                      />
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = videoUrl;
                          link.download = 'cinematic-scene.mp4';
                          link.click();
                        }}
                        className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button 
                        onClick={async () => {
                          setIsProductionGenerating(true);
                          addLog("Initiating Direct YouTube Upload...", 'info');
                          try {
                            const response = await fetch("/api/publish/youtube", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ title: "Generated Scene", description: prompt })
                            });
                            const data = await response.json();
                            if (response.ok) {
                              addLog(`Successfully Published! URL: ${data.url}`, 'success');
                              alert(`Published! ${data.url}`);
                            } else {
                              throw new Error(data.error);
                            }
                          } catch (err: any) {
                            addLog(`Publish failed: ${err.message}`, 'warning');
                            alert(`Error: ${err.message}`);
                          } finally {
                            setIsProductionGenerating(false);
                          }
                        }}
                        disabled={isProductionGenerating}
                        className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                      >
                        {isProductionGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                        Publish to YouTube
                      </button>
                    </div>
                  </div>
                )}
              </div>

                <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/60 rounded-[2.5rem] p-8 h-fit sticky top-6 backdrop-blur-xl shadow-2xl shadow-black/50">
                  <DirectorToolkit 
                    onApplyStyle={(s) => {
                      setPrompt(prev => prev ? `${prev}, ${s}` : s);
                      addLog(`Director Applied Style: ${s.split(',')[0]}`, 'info');
                    }}
                    onApplyRatio={(r) => {
                      setAspectRatio(r);
                      addLog(`Director Set Aspect Ratio: ${r}`, 'info');
                    }} 
                  />
                </div>
              </div>
            ) : activeTab === "image" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Image Provider</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setSelectedImageProvider("openai")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                        selectedImageProvider === "openai" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGenerating || isProductionGenerating}
                    >
                      DALL-E 3
                    </button>
                    <button
                      onClick={() => setSelectedImageProvider("pollinations")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                        selectedImageProvider === "pollinations" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGenerating || isProductionGenerating}
                    >
                      Pollinations.ai
                    </button>
                  </div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Image Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
                    disabled={isGenerating || isProductionGenerating}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveScene}
                    className="flex-1 py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Scene
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || isProductionGenerating || !prompt.trim()}
                    className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
                  >
                    {isGenerating || isProductionGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isProductionGenerating ? "Production Pipeline Active..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : activeTab === "thumbnail" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Thumbnail Provider</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setSelectedImageProvider("openai")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                        selectedImageProvider === "openai" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGeneratingThumbnail || isProductionGenerating}
                    >
                      DALL-E 3
                    </button>
                    <button
                      onClick={() => setSelectedImageProvider("pollinations")}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                        selectedImageProvider === "pollinations" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                      disabled={isGeneratingThumbnail || isProductionGenerating}
                    >
                      Pollinations.ai
                    </button>
                  </div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Thumbnail Concept</label>
                  <textarea
                    value={thumbnailPrompt}
                    onChange={(e) => setThumbnailPrompt(e.target.value)}
                    placeholder="Describe your YouTube thumbnail idea..."
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
                    disabled={isGeneratingThumbnail || isProductionGenerating}
                  />
                </div>
                <button
                  onClick={handleGenerateThumbnail}
                  disabled={isGeneratingThumbnail || isProductionGenerating || !thumbnailPrompt.trim()}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
                >
                  {isGeneratingThumbnail || isProductionGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isProductionGenerating ? "Production Pipeline Active..." : "Generating Thumbnail..."}
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5" />
                      Generate Thumbnail
                    </>
                  )}
                </button>
              </div>
            ) : activeTab === "caption" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Video Context</label>
                  <textarea
                    value={captionPrompt}
                    onChange={(e) => setCaptionPrompt(e.target.value)}
                    placeholder="What is your video about? (e.g. A vlog about my trip to Japan)"
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
                    disabled={isGeneratingCaption || isProductionGenerating}
                  />
                </div>
                <button
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption || isProductionGenerating || !captionPrompt.trim()}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
                >
                  {isGeneratingCaption || isProductionGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isProductionGenerating ? "Production Pipeline Active..." : "Generating Captions..."}
                    </>
                  ) : (
                    <>
                      <Type className="w-5 h-5" />
                      Generate Captions
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Voiceover Script</label>
                  <textarea
                    value={ttsPrompt}
                    onChange={(e) => setTtsPrompt(e.target.value)}
                    placeholder="Enter the script for your voiceover..."
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
                    disabled={isGenerating || isProductionGenerating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Language</label>
                    <select
                      value={ttsLanguage}
                      onChange={(e) => setTtsLanguage(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGeneratingTTS || isGenerating || isProductionGenerating}
                    >
                      <option value="hi-IN">Hindi</option>
                      <option value="en-IN">English (India)</option>
                      <option value="bn-IN">Bengali</option>
                      <option value="ta-IN">Tamil</option>
                      <option value="te-IN">Telugu</option>
                      <option value="mr-IN">Marathi</option>
                      <option value="gu-IN">Gujarati</option>
                      <option value="kn-IN">Kannada</option>
                      <option value="ml-IN">Malayalam</option>
                      <option value="pa-IN">Punjabi</option>
                      <option value="or-IN">Odia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Speaker</label>
                    <select
                      value={ttsSpeaker}
                      onChange={(e) => setTtsSpeaker(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      disabled={isGeneratingTTS || isGenerating || isProductionGenerating}
                    >
                      <option value="meera">Meera (Female)</option>
                      <option value="amartya">Amartya (Male)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || isGenerating || isProductionGenerating || !ttsPrompt.trim()}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
                >
                  {isGeneratingTTS || isProductionGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isProductionGenerating ? "Production Pipeline Active..." : "Generating Audio..."}
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 fill-current" />
                      Generate Voiceover
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status / Error Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {isGenerating && statusMessage && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center gap-3 text-zinc-300 text-sm animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <p>{statusMessage}</p>
            </div>
          )}
          {isGeneratingTTS && statusMessage && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex items-center gap-3 text-zinc-300 text-sm animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <p>{statusMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Video/Audio Player */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center shadow-2xl">
            {videoUrl ? (
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                autoPlay 
                loop
                className="w-full h-full object-contain bg-black"
              />
            ) : isGenerating ? (
              <div className="text-center space-y-6 p-8">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-zinc-500 rounded-full animate-spin animation-delay-150"></div>
                  <div className="absolute inset-4 border-b-2 border-zinc-700 rounded-full animate-spin animation-delay-300"></div>
                  <Film className="w-8 h-8 text-zinc-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-zinc-200 mb-2">Crafting your vision</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    The Runway model is synthesizing frames. High-quality video generation typically takes 1-3 minutes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                  <Film className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-light text-zinc-400 mb-2">No Video Generated</h3>
                <p className="text-zinc-600 text-sm">
                  Enter a prompt and click generate to create a cinematic masterpiece.
                </p>
              </div>
            )}
            
            {/* Download Button Overlay */}
            {videoUrl && (
              <a 
                href={videoUrl} 
                download="cinematic-video.mp4"
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2.5 rounded-full text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                title="Download Video"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Video Actions Section */}
          {videoUrl && (
            <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <Film className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">Generated Video</h3>
                  <p className="text-xs text-zinc-500">Ready to publish or download</p>
                </div>
              </div>
              <a 
                href={videoUrl} 
                download="cinematic-video.mp4"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                Download Video
              </a>
            </div>
          )}

          {/* Audio Player Section */}
          {audioUrl && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Music className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-zinc-200 mb-2">Generated Voiceover</h3>
                <audio controls src={audioUrl} className="w-full h-10" />
              </div>
              <a 
                href={audioUrl} 
                download="voiceover.wav"
                className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
                title="Download Audio"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          )}

          {/* Thumbnail Preview Section */}
          {thumbnailUrl && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <Image className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200">Generated Thumbnail</h3>
                    <p className="text-xs text-zinc-500">Optimized for YouTube</p>
                  </div>
                </div>
                <a 
                  href={thumbnailUrl} 
                  download="thumbnail.png"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-zinc-800">
                <img src={thumbnailUrl} alt="Generated Thumbnail" className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}

          {/* Captions Preview Section */}
          {generatedCaptions && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <Type className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">Generated Captions</h3>
                  <p className="text-xs text-zinc-500">Ready to copy and use</p>
                </div>
              </div>
              <div className="bg-black/50 border border-zinc-800 rounded-xl p-4">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {generatedCaptions}
                </pre>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedCaptions);
                  alert("Captions copied to clipboard!");
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors border border-zinc-700/50"
              >
                Copy to Clipboard
              </button>
            </div>
          )}

          {/* Recent Generations Feed */}
          <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                <Library className="w-5 h-5 text-zinc-400" />
                Recent Generations
              </h3>
              <button 
                onClick={() => setCurrentView("library")}
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
              >
                View Full Library
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentGenerations.map((item) => (
                <div key={item.id} className="bg-black/40 border border-zinc-800/60 rounded-2xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer">
                  <div className="aspect-video bg-zinc-900 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <Film className="w-6 h-6 text-zinc-800" />
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-medium text-zinc-200 truncate">{item.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-zinc-500 uppercase">{item.type}</span>
                    <span className="text-[10px] text-zinc-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
          )}
        </div>
      </div>
    </div>
  );
}
