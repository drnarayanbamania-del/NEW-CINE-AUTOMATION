import express from "express";
import RunwayML from "@runwayml/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================
const contentLibrary = [
  { id: 1, title: "Cyberpunk Cityscape", type: "video", status: "published", date: "2026-03-15", prompt: "A neon hologram of a cat driving at top speed through a futuristic cyberpunk city...", resolution: "1080p", provider: "Runway ML", duration: "4s" },
  { id: 2, title: "Forest Ambience", type: "audio", status: "ready", date: "2026-03-14", prompt: "Peaceful forest sounds with birds chirping and a gentle stream.", provider: "Sarvam AI", language: "en-IN" },
  { id: 3, title: "Product Commercial", type: "script", status: "draft", date: "2026-03-12", prompt: "A 30-second commercial script for a new smart watch." },
  { id: 4, title: "Smart Watch Commercial", type: "video", status: "ready", date: "2026-03-22", prompt: "Cinematic close-up of a sleek smart watch on a wrist, glowing minimalist interface, smooth hand movement, urban bokeh background.", resolution: "1080p", provider: "OpenAI Sora", duration: "30s" }
];

// Runway ML Video Generation Endpoint
app.post("/api/generate-runway", async (req, res) => {
  try {
    const { prompt, aspectRatio, resolution, promptImage, apiKey: clientKey } = req.body;
    
    const apiKey = clientKey || process.env.RUNWAYML_API_SECRET;
    if (!apiKey || apiKey === "runway-placeholder") {
      return res.status(400).json({ error: "Runway ML API Key is not configured. Please add it in the API Key Management tab." });
    }

    const client = new RunwayML({ apiKey });

    let task;
    if (promptImage) {
      const gen3aRatio: '1280:768' | '768:1280' = aspectRatio === '9:16' ? '768:1280' : '1280:768';
      task = await client.imageToVideo.create({
        model: 'gen3a_turbo',
        promptImage: promptImage,
        promptText: prompt,
        ratio: gen3aRatio,
      });
    } else {
      const gen45Ratio: '1280:720' | '720:1280' = aspectRatio === '9:16' ? '720:1280' : '1280:720';
      task = await client.textToVideo.create({
        model: 'gen4.5',
        promptText: prompt,
        ratio: gen45Ratio,
        duration: 4,
      });
    }

    res.json({ taskId: task.id });
  } catch (error: any) {
    console.error("Runway ML Error:", error);
    res.status(500).json({ error: String(error.message || error) || "Failed to start Runway ML generation." });
  }
});

// Runway ML Task Status Endpoint
app.get("/api/runway-task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.RUNWAYML_API_SECRET;
    if (!apiKey) return res.status(400).json({ error: "RUNWAYML_API_SECRET is not configured." });

    const client = new RunwayML({ apiKey });
    const taskInfo = await client.tasks.retrieve(id);
    res.json(taskInfo);
  } catch (error: any) {
    console.error("Runway ML Task Error:", error);
    res.status(500).json({ error: String(error.message || error) });
  }
});

// ElevenLabs Video Generation Endpoint
app.post("/api/generate-elevenlabs", async (req, res) => {
  try {
    const { prompt, aspectRatio, resolution, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey === "elevenlabs-placeholder") return res.status(400).json({ error: "ElevenLabs API Key is not configured." });

    const response = await fetch("https://api.elevenlabs.io/v1/video-generation", {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({ prompt, aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9', resolution: resolution === '1080p' ? '1080p' : '720p' })
    });

    if (!response.ok) throw new Error(`ElevenLabs API Error: ${response.status}`);
    const data = await response.json();
    res.json({ taskId: data.id || `el-${Date.now()}` });
  } catch (error: any) {
    res.status(500).json({ error: String(error.message || error) });
  }
});

// OpenAI Video Generation Endpoint (Mocking Sora)
app.post("/api/generate-openai-video", async (req, res) => {
  try {
    const { prompt, aspectRatio, resolution, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-placeholder") return res.status(400).json({ error: "OpenAI API Key is not configured." });
    res.json({ taskId: `openai-sora-${Date.now()}` });
  } catch (error: any) {
    res.status(500).json({ error: String(error.message || error) });
  }
});

// OpenAI Prompt Enhancer Endpoint
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt, type = "video", apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-placeholder") return res.status(400).json({ error: "OpenAI API Key is not configured." });

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: `You are a professional AI ${type} prompt engineer.` }, { role: "user", content: `Enhance this prompt: ${prompt}` }],
      temperature: 0.7,
    });
    res.json({ enhancedPrompt: response.choices[0].message.content });
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("quota")) {
      const fbPrompt = req.body.prompt || "your prompt";
      return res.json({ enhancedPrompt: `[MOCK ENHANCED] Cinematic scene for ${String(fbPrompt).substring(0, 50)}...`, isMocked: true });
    }
    res.status(500).json({ error: String(error.message || error) });
  }
});

// Sarvam AI Text-to-Speech Endpoint
app.post("/api/generate-tts", async (req, res) => {
  try {
    const { text, languageCode = "hi-IN", speaker = "meera", apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.SARVAM_API_KEY;
    if (!apiKey || apiKey === "sarvam-placeholder") return res.status(400).json({ error: "Sarvam AI API Key is not configured." });

    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
      body: JSON.stringify({ inputs: [text], target_language_code: languageCode, speaker, model: "bulbul:v1" })
    });
    const data = await response.json();
    res.json({ audioBase64: data.audios?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: String(error.message || error) });
  }
});

// YouTube Publishing & Settings Endpoint
app.post("/api/publish/youtube", (req, res) => {
  res.json({ success: true, url: `https://youtube.com/watch?v=mock-${Date.now()}` });
});

app.post("/api/settings/youtube", (req, res) => {
  console.log("YouTube credentials received:", req.body);
  res.json({ success: true });
});

// Content Library Endpoint
app.get("/api/content", (req, res) => res.json(contentLibrary));

// Analytics & Scraper Endpoints
app.get("/api/analytics", (req, res) => {
  res.json({ activeWorkflows: 12, generatedContent: 1248, publishedPosts: 856, successRate: 98.5 });
});

app.get("/api/scraper/trends", (req, res) => {
  res.json([{ id: "1", title: "AI Video Revolution", source: "youtube", relevance: 98, growth: "+420%", timestamp: "2m ago" }]);
});

app.get("/api/scraper/logs", (req, res) => {
  res.json([{ id: "1", time: "09:35:12", source: "YT_SCRAPER", status: "success", message: "Parsed 42 trending topics" }]);
});

// Image Generation Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({ model: "dall-e-3", prompt, n: 1, size: "1024x1024" });
    res.json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("quota")) {
      return res.json({ imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1080", isMocked: true });
    }
    res.status(500).json({ error: String(error.message || error) });
  }
});

// Full Production Assets Generation Endpoint
app.post("/api/generate-production-assets", async (req, res) => {
  try {
    const { topic, platform = "youtube", tone = "engaging", apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Generate JSON with 'script' and 'videoPrompt' keys." }, { role: "user", content: `Topic: ${topic}.` }],
      response_format: { type: "json_object" }
    });
    const { script, videoPrompt } = JSON.parse(scriptResponse.choices[0].message.content || "{}");
    
    res.json({ script, videoPrompt, topic, captions: "Mock captions", thumbnailPrompt: "Mock thumb prompt" });
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("quota")) {
      const fbTopic = req.body.topic || "the topic";
      return res.json({ script: `Mock script for ${fbTopic}`, videoPrompt: "Mock prompt", topic: fbTopic, isMocked: true });
    }
    res.status(500).json({ error: String(error.message || error) });
  }
});

// Local development server (vite proxy)
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV === undefined) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  const PORT = 3000;
  app.listen(PORT, () => console.log(`Dev server running on http://localhost:${PORT}`));
}

// Export for Vercel
export default app;
