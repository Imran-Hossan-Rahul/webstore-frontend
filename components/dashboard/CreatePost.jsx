import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Image as ImageIcon, Send, X, Smile, Calendar, MapPin, BarChart2, Link, Plus, FileText } from 'lucide-react';
import { api } from "@/utils/api";
import AIEnhanceButton from '../AIEnhanceButton';

const CreatePost = ({ onPostCreated, forceShow = false, defaultIsDevlogMode = false }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [isDevlogMode, setIsDevlogMode] = useState(defaultIsDevlogMode);
  const [isCraftsman, setIsCraftsman] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is craftsman
    const hasCraftsman = localStorage.getItem("hasCraftsmanAccount") === "true";
    setIsCraftsman(hasCraftsman);
    setCheckingAuth(false);
  }, []);


  const [devlogStats, setDevlogStats] = useState({ 
      tools: "", 
      timeSpent: "", 
      devlogLink: "",
      location: "",
      startDate: "",
      difficulty: "Intermediate",
      livePreviewUrl: "",
      resources: [] // [{ title, url, type }]
  });
  
  const [resourceInput, setResourceInput] = useState({ title: "", url: "" });
  
  // Toggle states for extra inputs
  const [showLocation, setShowLocation] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSelectedFiles(prev => [...prev, file]);
      setPreviews(prev => [...prev, URL.createObjectURL(file)]);
      e.target.value = "";
      setIsFocused(true);
  };

  const removeImage = (index) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviews(prev => {
          const newPreviews = [...prev];
          URL.revokeObjectURL(newPreviews[index]);
          return newPreviews.filter((_, i) => i !== index);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;
    
    // Validation: Devlog MUST have a title
    if (isDevlogMode && !title.trim()) {
        alert("Please provide a title for your devlog.");
        return;
    }

    setLoading(true);
    try {
        // Filter out empty stats
        const relevantStats = {};
        if (devlogStats.tools) relevantStats.tools = devlogStats.tools.split(',').map(t => t.trim()).filter(Boolean);
        if (devlogStats.timeSpent) relevantStats.timeSpent = devlogStats.timeSpent;
        if (devlogStats.devlogLink) relevantStats.devlogLink = devlogStats.devlogLink;
        if (devlogStats.location) relevantStats.location = devlogStats.location;
        if (devlogStats.startDate) relevantStats.startDate = devlogStats.startDate;
        if (devlogStats.difficulty && showDifficulty) relevantStats.difficulty = devlogStats.difficulty;
        
        // Phase 2
        if (devlogStats.livePreviewUrl) relevantStats.livePreviewUrl = devlogStats.livePreviewUrl;
        if (devlogStats.resources && devlogStats.resources.length > 0) relevantStats.resources = devlogStats.resources;

        // Determine postType logic: If any stats are present, treat as devlog, else check user toggle
        const hasStats = Object.keys(relevantStats).length > 0;
        const finalPostType = (isDevlogMode || hasStats) ? 'devlog' : 'thought';

        const payload = {
            title: (isDevlogMode || hasStats) ? title : undefined,
            content,
            images: [],
            postType: finalPostType,
            category: 'Development', 
            devlogStats: hasStats ? relevantStats : undefined
        };

        const postRes = await api.post('/posts/create', payload);
        if (postRes.success) {
            const newPost = postRes.data;
            if (selectedFiles.length > 0) {
                await Promise.all(selectedFiles.map(file => {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('postId', newPost.id || newPost._id);
                    return api.upload('/upload/post-image', formData); 
                }));
            }
            setContent("");
            setTitle("");
            setSelectedFiles([]);
            setPreviews([]);
            setIsFocused(false);
            if (onPostCreated) onPostCreated({ ...newPost, images: previews });
        }
    } catch (err) {
        console.error("Failed to post", err);
    } finally {
        setLoading(false);
    }
  };

  if (!checkingAuth && !isCraftsman && !forceShow) return null;

  return (
    <div className={`group bg-white dark:bg-black/40 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-[2rem] p-4 mb-8 transition-all duration-300 ${isFocused ? 'shadow-xl ring-1 ring-purple-500/20 border-purple-500/30' : 'shadow-sm hover:shadow-md'}`}>
        <div className="flex gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] flex-shrink-0 cursor-pointer hover:-translate-y-0.5 transition-transform">
                 <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800" />
                 </div>
             </div>
             
             <div className="flex-1 pt-1">
                  {isDevlogMode && (
                      <input 
                         type="text"
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         placeholder="Devlog Title (Required for devlogs)"
                         className="w-full bg-transparent border-none focus:ring-0 text-2xl font-bold text-slate-900 dark:text-white placeholder-gray-400 mb-2"
                      />
                  )}
                 <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="What is happening?!"
                    className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-slate-900 dark:text-white placeholder-gray-400 resize-none min-h-[60px]"
                    rows={isFocused ? 4 : 2}
                 />

                 {/* Image Previews */}
                 {previews.length > 0 && (
                     <div className="flex flex-wrap gap-3 mt-4 animate-in fade-in zoom-in-95 duration-200">
                         {previews.map((url, idx) => (
                             <div key={idx} className="relative w-48 h-48 rounded-2xl overflow-hidden group/preview ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                                 <img src={url} alt="To upload" className="w-full h-full object-cover" />
                                 <button 
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover/preview:opacity-100 transition-all hover:bg-red-500 backdrop-blur-sm"
                                 >
                                     <X className="w-4 h-4" />
                                 </button>
                             </div>
                         ))}
                     </div>
                 )}
                 
                    {/* Devlog Mode Inputs */}
                 {(isDevlogMode || showLocation || showDate || showDifficulty) && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 space-y-3 animate-in fade-in slide-in-from-top-4">
                        {/* Always show Tools & Time if Devlog Mode is explicitly ON */}
                        {isDevlogMode && (
                            <>
                                <div className="flex gap-2">
                                     <input 
                                        type="text"
                                        placeholder="Tools used (e.g. Figma, React)"
                                        value={devlogStats.tools}
                                        onChange={(e) => setDevlogStats({...devlogStats, tools: e.target.value})}
                                        className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                     />
                                     <input 
                                        type="text"
                                        placeholder="Time spent"
                                        value={devlogStats.timeSpent}
                                        onChange={(e) => setDevlogStats({...devlogStats, timeSpent: e.target.value})}
                                        className="w-24 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                     />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Devlog/Code Link (Optional)"
                                    value={devlogStats.devlogLink}
                                    onChange={(e) => setDevlogStats({...devlogStats, devlogLink: e.target.value})}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                                 />
                            </>
                        )}
                        
                        {/* Phase 2: Live Preview & Resources (Only in Devlog Mode) */}
                        {isDevlogMode && (
                            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                                {/* Live Preview URL */}
                                <div className="flex items-center gap-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                                     <Link className="w-4 h-4 text-slate-400" />
                                     <input 
                                        type="text"
                                        placeholder="Live Demo URL (https://...)"
                                        value={devlogStats.livePreviewUrl}
                                        onChange={(e) => setDevlogStats({...devlogStats, livePreviewUrl: e.target.value})}
                                        className="w-full bg-transparent border-none text-sm focus:outline-none"
                                     />
                                </div>
                                
                                {/* Resources */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                         <input 
                                            type="text"
                                            placeholder="Resource Title (e.g. GitHub Repo)"
                                            value={resourceInput.title}
                                            onChange={(e) => setResourceInput({...resourceInput, title: e.target.value})}
                                            className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                         />
                                         <input 
                                            type="text"
                                            placeholder="URL"
                                            value={resourceInput.url}
                                            onChange={(e) => setResourceInput({...resourceInput, url: e.target.value})}
                                            className="flex-1 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                         />
                                         <button
                                            onClick={() => {
                                                if(resourceInput.title && resourceInput.url) {
                                                    setDevlogStats(prev => ({
                                                        ...prev,
                                                        resources: [...prev.resources, { ...resourceInput, type: 'link' }]
                                                    }));
                                                    setResourceInput({ title: "", url: "" });
                                                }
                                            }}
                                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                         >
                                             <Plus className="w-5 h-5" />
                                         </button>
                                    </div>
                                    
                                    {/* Resource List */}
                                    {devlogStats.resources.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {devlogStats.resources.map((res, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-medium">
                                                    <FileText className="w-3 h-3" />
                                                    <span>{res.title}</span>
                                                    <button 
                                                        onClick={() => setDevlogStats(prev => ({
                                                            ...prev,
                                                            resources: prev.resources.filter((_, i) => i !== idx)
                                                        }))}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Difficulty Selector */}
                        {showDifficulty && (
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-bold uppercase">Difficulty:</span>
                                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setDevlogStats({...devlogStats, difficulty: level})}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                            devlogStats.difficulty === level 
                                            ? 'bg-purple-100 text-purple-600 border-purple-200' 
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                             </div>
                        )}

                        {/* Location & Date */}
                        <div className="flex gap-2">
                             {showLocation && (
                                 <div className="flex-1 flex items-center gap-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                                     <MapPin className="w-4 h-4 text-slate-400" />
                                     <input 
                                        type="text"
                                        placeholder="Add Location"
                                        value={devlogStats.location}
                                        onChange={(e) => setDevlogStats({...devlogStats, location: e.target.value})}
                                        className="w-full bg-transparent border-none text-sm focus:outline-none"
                                     />
                                 </div>
                             )}
                             {showDate && (
                                 <div className="flex items-center gap-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2">
                                     <Calendar className="w-4 h-4 text-slate-400" />
                                     <input 
                                        type="date"
                                        value={devlogStats.startDate}
                                        onChange={(e) => setDevlogStats({...devlogStats, startDate: e.target.value})}
                                        className="bg-transparent border-none text-sm focus:outline-none text-slate-600 dark:text-gray-300 w-full"
                                     />
                                 </div>
                             )}
                        </div>
                    </div>
                 )}
                 
                 {/* Toolbar */}
                 {isFocused && (
                     <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                         <div className="flex items-center gap-1">
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-all hover:scale-110"
                                title="Media"
                             >
                                 <ImageIcon className="w-5 h-5" />
                             </button>
                             
                             <AIEnhanceButton 
                                text={content} 
                                onUpdate={setContent}
                                className="mr-1"
                             />

                             <div className="relative">
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2.5 rounded-full transition-all hover:scale-110 ${showEmojiPicker ? 'text-yellow-500 bg-yellow-50' : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10'}`}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute top-12 left-0 z-50 animate-in fade-in zoom-in-95 origin-top-left">
                                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="relative z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10">
                                            <EmojiPicker 
                                                onEmojiClick={(emojiData) => {
                                                    setContent(prev => prev + emojiData.emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                theme="auto"
                                                searchDisabled
                                                skinTonesDisabled
                                                previewConfig={{ showPreview: false }}
                                                width={300}
                                                height={400}
                                            />
                                        </div>
                                    </div>
                                )}
                             </div>
                             <button 
                                onClick={() => setShowDifficulty(!showDifficulty)}
                                className={`p-2.5 rounded-full transition-all hover:scale-110 ${showDifficulty ? 'text-purple-600 bg-purple-50' : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10'}`}
                             >
                                 <BarChart2 className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={() => setShowDate(!showDate)}
                                className={`p-2.5 rounded-full transition-all hover:scale-110 ${showDate ? 'text-purple-600 bg-purple-50' : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10'}`}
                             >
                                 <Calendar className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={() => setShowLocation(!showLocation)}
                                className={`p-2.5 rounded-full transition-all hover:scale-110 ${showLocation ? 'text-purple-600 bg-purple-50' : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10'}`}
                             >
                                 <MapPin className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={() => setIsDevlogMode(!isDevlogMode)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-2 border ${isDevlogMode ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-200' : 'text-slate-500 border-slate-200 dark:border-white/10 hover:border-purple-300'}`}
                             >
                                 {isDevlogMode ? 'Devlog Mode On' : '+ Add Context'}
                             </button>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                             />
                         </div>
                         
                         <div className="flex items-center gap-4">
                             {content.length > 0 && (
                                 <div className="w-6 h-6 rounded-full border-2 border-purple-200 dark:border-purple-900 relative flex items-center justify-center">
                                     <div 
                                        className="absolute inset-0 rounded-full border-2 border-purple-500 transition-all duration-300"
                                        style={{ clipPath: `inset(${100 - Math.min(100, (content.length/200)*100)}% 0 0 0)` }} 
                                     />
                                     <span className="text-[8px] font-bold text-purple-500">{content.length}</span>
                                 </div>
                             )}
                             <button 
                                onClick={handleSubmit}
                                disabled={(!content.trim() && selectedFiles.length === 0) || loading}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-bold text-sm shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                             >
                                 {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                 ) : (
                                     <>Post <Send className="w-4 h-4" /></>
                                 )}
                             </button>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    </div>
  );
};

export default CreatePost;


