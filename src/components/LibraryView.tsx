import React, { useEffect, useState } from "react";
import { Search, Filter, Video, FileText, Image as ImageIcon, MoreVertical, Download, X, Play, Clock, Info, Youtube, Loader2 } from "lucide-react";

export default function LibraryView({ 
  onGenerateVideo, 
  onGenerateFromImage 
}: { 
  onGenerateVideo: (prompt: string) => void,
  onGenerateFromImage: (imageUrl: string, prompt: string) => void
}) {
  const [content, setContent] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async (item: any) => {
    setIsPublishing(true);
    try {
      const response = await fetch("/api/publish/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: item.id, title: item.title, description: item.prompt })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Successfully published to YouTube! View here: ${data.url}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    // Fallback mock data in case the API doesn't exist
    const mockData = [
      { id: 1, title: "Cyberpunk Cityscape", type: "video", status: "published", date: "2026-03-15", prompt: "A neon hologram of a cat driving at top speed through a futuristic cyberpunk city...", resolution: "1080p", provider: "Google Veo", duration: "4s" },
      { id: 2, title: "Forest Ambience", type: "audio", status: "ready", date: "2026-03-14", prompt: "Peaceful forest sounds with birds chirping and a gentle stream.", provider: "Sarvam AI", language: "en-IN" },
      { id: 3, title: "Product Commercial", type: "script", status: "draft", date: "2026-03-12", prompt: "A 30-second commercial script for a new smart watch." },
      { id: 4, title: "Smart Watch Commercial", type: "video", status: "ready", date: "2026-03-22", prompt: "Cinematic close-up of a sleek smart watch on a wrist, glowing minimalist interface, smooth hand movement, urban bokeh background.", resolution: "1080p", provider: "OpenAI Sora", duration: "30s" }
    ];

    fetch("/api/content")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => setContent(data))
      .catch(() => setContent(mockData));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-indigo-400" />;
      case "script": return <FileText className="w-4 h-4 text-emerald-400" />;
      case "image": return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case "audio": return <Play className="w-4 h-4 text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle more options logic here
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Content Library</h1>
          <p className="text-zinc-400 mt-1">All generated assets and published media.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search content..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleItemClick(item)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-zinc-700 transition-colors cursor-pointer"
          >
            {/* Preview Area (Mock) */}
            <div className="h-40 bg-zinc-950 flex items-center justify-center border-b border-zinc-800 relative">
              {getIcon(item.type)}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider border ${
                  item.status === 'published' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  item.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-zinc-200 truncate">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{item.date} • {item.type.toUpperCase()}</p>
                </div>
                <button 
                  onClick={handleMoreClick}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                {getIcon(selectedItem.type)}
                {selectedItem.title}
              </h2>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Preview Section */}
              <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                {selectedItem.type === 'video' ? (
                  <div className="text-center">
                    <Video className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Video Preview</p>
                  </div>
                ) : selectedItem.type === 'audio' ? (
                  <div className="text-center">
                    <Play className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Audio Preview</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">Document Preview</p>
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Status</h4>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider border ${
                      selectedItem.status === 'published' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      selectedItem.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created Date
                    </h4>
                    <p className="text-sm text-zinc-300">{selectedItem.date}</p>
                  </div>

                  {selectedItem.provider && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Provider
                      </h4>
                      <p className="text-sm text-zinc-300">{selectedItem.provider}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedItem.resolution && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Resolution</h4>
                      <p className="text-sm text-zinc-300">{selectedItem.resolution}</p>
                    </div>
                  )}
                  {selectedItem.duration && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Duration</h4>
                      <p className="text-sm text-zinc-300">{selectedItem.duration}</p>
                    </div>
                  )}
                  {selectedItem.language && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Language</h4>
                      <p className="text-sm text-zinc-300">{selectedItem.language}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt/Description */}
              {selectedItem.prompt && (
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Generation Prompt</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{selectedItem.prompt}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Close
              </button>
              
              {selectedItem.type === 'script' ? (
                 <button 
                  onClick={() => { onGenerateVideo(selectedItem.prompt); setSelectedItem(null); }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Convert to Video
                </button>
              ) : selectedItem.type === 'image' ? (
                <button 
                 onClick={() => { onGenerateFromImage(selectedItem.url || "", selectedItem.prompt); setSelectedItem(null); }}
                 className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
               >
                 <Video className="w-4 h-4" />
                 Convert to Video (Turbo)
               </button>
              ) : (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {selectedItem.type === 'video' && (
                    <button 
                      onClick={() => handlePublish(selectedItem)}
                      disabled={isPublishing}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                      Publish to YouTube
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
