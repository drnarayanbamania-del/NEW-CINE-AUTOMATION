import React from 'react';
import { Wand2, Zap, Layout, Play, Camera, Film } from 'lucide-react';

interface TooltipProps {
  onApplyStyle: (style: string) => void;
  onApplyRatio: (ratio: string) => void;
}

export default function DirectorToolkit({ onApplyStyle, onApplyRatio }: TooltipProps) {
  const visualTechniques = [
    { title: "Deep Depth of Field", desc: "Sharply defined foreground/background", prompt: "f/1.8 deep depth of field, sharp focus, cinematic blur background" },
    { title: "Dutch Angle", desc: "Tilted horizon for tension", prompt: "dutch angle shot, canted frame, high tension" },
    { title: "Golden Hour", desc: "Warm, long shadows", prompt: "golden hour lighting, warm atmosphere, long shadows, lens flare" },
    { title: "Tracking Shot", desc: "Dynamic following motion", prompt: "slow tracking shot, smooth gimbal movement, cinematic following" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 text-emerald-400">
        <Wand2 className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Director's AI Toolkit</h3>
      </div>

      {/* Visual Techniques */}
      <div className="space-y-3">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Visual Techniques</p>
        <div className="grid grid-cols-1 gap-2">
          {visualTechniques.map((tech) => (
            <button
              key={tech.title}
              onClick={() => onApplyStyle(tech.prompt)}
              className="group p-3 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 rounded-xl text-left transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{tech.title}</span>
                <Zap className="w-3 h-3 text-zinc-600 group-hover:text-emerald-500" />
              </div>
              <p className="text-[10px] text-zinc-600 leading-tight">{tech.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cinematic Ratios */}
      <div className="space-y-3">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Master Ratios</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "CinemaScope (2.39:1)", value: "16:9" }, // Will map to widest in generator
            { label: "IMAX (1.43:1)", value: "4:3" },
            { label: "Vertical (9:16)", value: "9:16" },
            { label: "Square (1:1)", value: "1:1" }
          ].map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => onApplyRatio(ratio.value)}
              className="p-2 border border-zinc-800 bg-black/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 rounded-lg text-center transition-all"
            >
              <div className="text-[10px] font-bold text-zinc-500">{ratio.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Camera className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase">Pro Tip</span>
        </div>
        <p className="text-[10px] text-emerald-500/70 leading-relaxed italic">
            Combine "Dutch Angle" with "Cinematic Noir" for a stunning psychological thriller aesthetic.
        </p>
      </div>
    </div>
  );
}
