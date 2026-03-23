import RunwayML from "@runwayml/sdk";

/**
 * Fast generation logic for Runway ML
 * Uses the fastest available models for maximum speed
 */
export async function generateFastVideo(params: {
  prompt: string;
  aspectRatio: "16:9" | "9:16";
  resolution?: "1080p" | "720p";
  apiKey: string;
  imagePrompt?: string;
}) {
  const { prompt, aspectRatio, apiKey, imagePrompt } = params;
  const client = new RunwayML({ apiKey });

  if (imagePrompt) {
    const gen3aRatio: "1280:768" | "768:1280" =
      aspectRatio === "9:16" ? "768:1280" : "1280:768";
    return await client.imageToVideo.create({
      model: "gen3a_turbo",
      promptImage: imagePrompt,
      promptText: prompt,
      ratio: gen3aRatio,
    });
  } else {
    const fastRatio: "1280:720" | "720:1280" =
      aspectRatio === "9:16" ? "720:1280" : "1280:720";
    return await client.textToVideo.create({
      model: "veo3.1_fast",
      promptText: prompt,
      ratio: fastRatio,
    });
  }
}

/**
 * Handles Shorts generation with automated trending topic selection
 */
export async function generateShorts(params: {
  model?: string;
  autoPublish?: boolean;
  apiKey: string;
}) {
  const { model = "Veo", autoPublish = true, apiKey } = params;
  
  // Simulated trending topic selection
  const trends = [
    "AI Video Revolution 2026",
    "Futuristic Cyberpunk Streets",
    "Cinematic Nature in 8K",
    "Digital Humans of the Future"
  ];
  const topic = trends[Math.floor(Math.random() * trends.length)];
  
  console.log(`[FastGen] Generating Shorts on: ${topic} using ${model}`);
  
  // Use the fast video generator
  const task = await generateFastVideo({
    prompt: `A viral high-speed TikTok/Shorts clip style video of ${topic}, hyper-realistic, cinematic lighting, 4k`,
    aspectRatio: "9:16",
    apiKey: apiKey
  });

  return {
    taskId: task.id,
    topic: topic,
    status: "processing",
    message: `Fast Generation Shorts pipeline triggered for ${topic}.`
  };
}
