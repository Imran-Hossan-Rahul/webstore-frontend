"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle, CheckCircle, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { useUser } from "@/context/UserContext";

// Sub-components
import BasicsSection from "./Devlog/BasicsSection";
import TimelineSection from "./Devlog/TimelineSection";
import MilestonesSection from "./Devlog/MilestonesSection";
import MetadataSection from "./Devlog/MetadataSection";
import CustomSelect from "@/components/ui/CustomSelect";


const availableTechStack = [
  "React", "Node.js", "Figma", "Adobe XD", "Vue.js", "Python", "MongoDB", "TensorFlow",
  "Angular", "Next.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
  "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "TypeScript", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
  "Flutter", "React Native", "Ionic", "Xamarin", "Unity", "Unreal Engine",
  "Photoshop", "Illustrator", "Sketch", "InVision", "Framer", "Webflow",
  "GraphQL", "REST API", "Socket.io", "WebRTC", "Firebase", "Supabase",
  "Tailwind CSS", "Bootstrap", "Material-UI", "Chakra UI", "Ant Design",
  "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Trello", "Notion",
  "Webpack", "Vite", "Babel", "ESLint", "Prettier", "Jest", "Cypress",
  "Twilio", "SendGrid", "Cloudinary", "Vercel", "Netlify",
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert", "Master"];

export default function CreateDevlog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  const [devlogData, setDevlogData] = useState({
    title: "",
    category: "Development",
    tags: [],
    tools: ["React"],
    startDate: "",
    endDate: "",
    originalEndDate: "",
    duration: "",
    difficulty: 1,
    timeSpent: "",
    location: "",
    status: "Planning",
    githubUrl: "",
    liveUrl: "",
    documentationUrl: "",
    extensions: [],
    collaborators: [],
    license: "MIT",
    description: "",
    updateReason: "",
    seoTitle: "",
    seoDescription: "",
    focusKeywords: "",
  });

  const [milestones, setMilestones] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [resource, setResource] = useState(null);
  
  // UI States
  const [tagInput, setTagInput] = useState("");
  const [customToolInput, setCustomToolInput] = useState("");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", date: "", status: "planned", description: "" });
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionForm, setExtensionForm] = useState({ newDate: "", reason: "" });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const resourceInputRef = useRef(null);


  const showToast = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // Logic Handlers
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / 7);
    const days = diff % 7;
    return weeks > 0 ? `${weeks}w ${days}d` : `${days}d`;
  };

  const handleDateChange = (field, value) => {
    setDevlogData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "startDate" || field === "endDate") {
        updated.duration = calculateDuration(
          field === "startDate" ? value : prev.startDate,
          field === "endDate" ? value : prev.endDate
        );
      }
      return updated;
    });
  };

  const handleExtensionSubmit = () => {
    if (!extensionForm.newDate || !extensionForm.reason) return;
    const newExt = {
      newDate: extensionForm.newDate,
      reason: extensionForm.reason,
      duration: calculateDuration(devlogData.endDate, extensionForm.newDate)
    };
    setDevlogData(prev => ({
      ...prev,
      endDate: extensionForm.newDate,
      extensions: [...prev.extensions, newExt],
      originalEndDate: prev.originalEndDate || prev.endDate
    }));
    setShowExtensionModal(false);
    setExtensionForm({ newDate: "", reason: "" });
  };

  const searchUsers = async (query) => {
    if (!query) return;
    setIsSearchingUsers(true);
    try {
      const res = await api.get(`/search?q=${query}`);
      if (res.success) setUserSearchResults(res.data.users);
    } catch (e) { console.error(e); }
    finally { setIsSearchingUsers(false); }
  };

  useEffect(() => {
    if (editId) {
      fetchDevlogForEdit();
    }
  }, [editId]);

  const fetchDevlogForEdit = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${editId}`);
      if (res && res.data) {
        const post = res.data;
        const stats = post.devlogStats || {};
        
        // Consolidate all updates into one object to avoid race conditions
        const updatedData = {
          title: post.title || "",
          category: post.category || "Development",
          tags: post.tags || [],
          tools: stats.tools || [],
          startDate: stats.startDate ? stats.startDate.split('T')[0] : "",
          endDate: stats.endDate ? stats.endDate.split('T')[0] : "",
          originalEndDate: stats.originalEndDate ? stats.originalEndDate.split('T')[0] : "",
          duration: stats.duration || "",
          difficulty: stats.difficulty || 1,
          timeSpent: stats.timeSpent || "",
          location: stats.location || "",
          status: stats.status || "Planning",
          githubUrl: stats.githubUrl || "",
          liveUrl: stats.liveUrl || "",
          documentationUrl: stats.documentationUrl || "",
          extensions: stats.extensions || [],
          collaborators: stats.collaborators || [],
          license: stats.license || "MIT",
          description: post.content || "",
          updateReason: "",
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          focusKeywords: post.focusKeywords ? post.focusKeywords.join(", ") : "",
        };

        setDevlogData(updatedData);

        if (stats.milestones) setMilestones(stats.milestones);
        if (post.images) {
           setImagePreviews(post.images);
        }
        if (stats.resources && stats.resources.length > 0) {
           setResource(stats.resources[0]);
        }
      }
    } catch (e) {
      showToast("error", "Failed to load devlog for editing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchTerm.length > 2) searchUsers(userSearchTerm);
      else setUserSearchResults([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.upload("/upload/resource", formData);
      if (res.success) setResource({ ...res.data, originalName: file.name });
    } catch (e) { showToast("error", "Resource upload failed"); }
  };

  const handleSubmit = async () => {
    if (!devlogData.title || !devlogData.startDate || !devlogData.endDate) {
      showToast("error", "Please fill required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: devlogData.title,
        content: devlogData.description || "",
        postType: "devlog",
        category: devlogData.category,
        tags: devlogData.tags,
        seoTitle: devlogData.seoTitle,
        seoDescription: devlogData.seoDescription,
        focusKeywords: devlogData.focusKeywords ? devlogData.focusKeywords.split(',').map(k => k.trim()).filter(k=>k) : undefined,
        images: imagePreviews.filter(p => typeof p === 'string' && p.startsWith('http')),
        ...(editId && devlogData.updateReason ? { updateReason: devlogData.updateReason } : {}),
        devlogStats: {
          ...devlogData,
          milestones: milestones.map(m => ({ title: m.title, date: m.date, status: m.status, description: m.description })),
          resources: resource ? [{ title: resource.originalName, tempPath: resource.tempPath, originalName: resource.originalName, type: "file" }] : []
        }
      };

      let res;
      if (editId) {
        res = await api.put(`/posts/${editId}`, payload);
      } else {
        res = await api.post("/posts/create", payload);
      }
      if (res.success && images.length > 0) {
        await Promise.all(images.map(img => {
          const fd = new FormData();
          fd.append("image", img);
          fd.append("postId", res.data._id);
          return api.upload("/upload/post-image", fd);
        }));
      }
      showToast("success", editId ? "Devlog updated!" : "Devlog published!");
      setTimeout(() => router.push("/devlog"), 1500);
    } catch (e) {
      console.error("Submission error details:", e.response?.data || e.message);
      showToast("error", e.response?.data?.message || "Submission failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      {/* Toast */}
      {notification.show && (
        <div className={`fixed top-32 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={16} strokeWidth={1.5} /> : <CheckCircle size={16} strokeWidth={1.5} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Local Page Header - Minimalist */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {editId ? "Edit Devlog" : "Create Devlog"}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
            {editId ? `Updating: ${devlogData.title}` : "Showcase your creative journey"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition uppercase tracking-wider">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="btn-primary px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> : (editId ? "Update Devlog" : "Publish Devlog")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-12">
          <BasicsSection 
            devlogData={devlogData} setDevlogData={setDevlogData}
            tagInput={tagInput} setTagInput={setTagInput}
            addTag={() => { if(tagInput && !devlogData.tags.includes(tagInput)) setDevlogData(p => ({...p, tags: [...p.tags, tagInput]})); setTagInput(""); }}
            removeTag={(t) => setDevlogData(p => ({...p, tags: p.tags.filter(tg => tg !== t)}))}
            userSearchTerm={userSearchTerm} setUserSearchTerm={setUserSearchTerm}
            isSearchingUsers={isSearchingUsers} userSearchResults={userSearchResults}
            handleSelectCollaborator={(u) => { setDevlogData(p => ({...p, collaborators: [...p.collaborators, `@${u.username}`]})); setUserSearchTerm(""); }}
            removeCollaborator={(c) => setDevlogData(p => ({...p, collaborators: p.collaborators.filter(cl => cl !== c)}))}
          />

          {editId && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Reason for Update
              </h3>
              <textarea
                value={devlogData.updateReason}
                onChange={(e) => setDevlogData(prev => ({ ...prev, updateReason: e.target.value }))}
                placeholder="Briefly explain what changed in this version..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:outline-none transition resize-none text-sm h-24"
              />
            </div>
          )}
          
          <TimelineSection 
            devlogData={devlogData} 
            handleDateChange={handleDateChange} 
            setShowExtensionModal={setShowExtensionModal}
            isEdit={!!editId}
          />
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              7. EXTERNAL LINKS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">GitHub URL (Optional)</label>
                <input
                  type="text"
                  value={devlogData.githubUrl}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">Live Preview (Optional)</label>
                <input
                  type="text"
                  value={devlogData.liveUrl}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">Documentation (Optional)</label>
                <input
                  type="text"
                  value={devlogData.documentationUrl}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                  placeholder="https://docs..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
            <AlertCircle size={16} strokeWidth={1.5} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              Your devlog will be public and shared with the community. Ensure you have the rights to share all uploaded content and media.
            </p>
          </div>
        </div>
        
        <div className="space-y-12">
          <MetadataSection 
            devlogData={devlogData}
            toggleTech={(t) => setDevlogData(p => ({...p, tools: p.tools.includes(t) ? p.tools.filter(tool => tool !== t) : [...p.tools, t]}))}
            customToolInput={customToolInput} handleToolInputChange={(v) => { setCustomToolInput(v); if(v.length > 0) { setFilteredSuggestions(availableTechStack.filter(s => s.toLowerCase().includes(v.toLowerCase())).slice(0, 5)); setShowSuggestions(true); } else setShowSuggestions(false); }}
            addCustomTool={(t) => { const tool = t || customToolInput; if(tool && !devlogData.tools.includes(tool)) setDevlogData(p => ({...p, tools: [...p.tools, tool]})); setCustomToolInput(""); setShowSuggestions(false); }}
            showSuggestions={showSuggestions} filteredSuggestions={filteredSuggestions}
            imagePreviews={imagePreviews} handleImageUpload={handleImageUpload} removeImage={(i) => { setImagePreviews(p => p.filter((_, idx) => idx !== i)); setImages(p => p.filter((_, idx) => idx !== i)); }}
            resource={resource} handleResourceClick={() => resourceInputRef.current?.click()} resourceInputRef={resourceInputRef} handleResourceUpload={handleResourceUpload}
          />

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                8. PROJECT STATUS & DIFFICULTY
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">Project Status</label>
                   <div className="flex flex-wrap gap-2">
                     {["Planning", "In Progress", "Paused", "Completed"].map(status => (
                       <button
                         key={status}
                         onClick={() => setDevlogData(prev => ({ ...prev, status }))}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                           devlogData.status === status 
                             ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" 
                             : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                         }`}
                       >
                         {status}
                       </button>
                     ))}
                   </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">
                    Difficulty: {difficultyLevels[devlogData.difficulty]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={devlogData.difficulty}
                    onChange={(e) => setDevlogData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <CustomSelect 
                label="License"
                options={["None", "MIT", "GPL-3.0", "Apache-2.0", "CC-BY-4.0", "Private"]}
                value={devlogData.license}
                onChange={(val) => setDevlogData(prev => ({ ...prev, license: val }))}
                icon={Shield}
              />
            </div>
          </div>

          <MilestonesSection 
            milestones={milestones} showMilestoneForm={showMilestoneForm} setShowMilestoneForm={setShowMilestoneForm}
            newMilestone={newMilestone} setNewMilestone={setNewMilestone}
            addMilestone={() => { if(newMilestone.title) setMilestones(p => [...p, {...newMilestone, id: Date.now()}]); setNewMilestone({title:"", date:"", status:"planned"}); setShowMilestoneForm(false); }}
            deleteMilestone={(id) => setMilestones(p => p.filter(m => m.id !== id))}
          />

          {/* SEO Section */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              9. SEO SETTINGS
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">SEO Title <span className="opacity-50 font-normal lowercase">(Optional, Max 60 chars)</span></label>
                <input
                  type="text"
                  maxLength={60}
                  value={devlogData.seoTitle || ""}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="Optimized title for search engines..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">Meta Description <span className="opacity-50 font-normal lowercase">(Max 160 chars)</span></label>
                <textarea
                  maxLength={160}
                  value={devlogData.seoDescription || ""}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="A compelling description for search engine results..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none resize-none h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">Focus Keywords <span className="opacity-50 font-normal lowercase">(Comma separated)</span></label>
                <input
                  type="text"
                  value={devlogData.focusKeywords || ""}
                  onChange={(e) => setDevlogData(prev => ({ ...prev, focusKeywords: e.target.value }))}
                  placeholder="e.g. react js, portfolio, tutorial"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-3xl p-8 border border-slate-200 dark:border-[#262626] animate-in zoom-in-95">
            <h2 className="text-xl font-black">EXTEND TIMELINE</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Adjust your project scope</p>
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">New End Date</label>
                <input type="date" value={extensionForm.newDate} onChange={e => setExtensionForm(p => ({...p, newDate: e.target.value}))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-black dark:focus:border-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Reason for Extension</label>
                <textarea value={extensionForm.reason} onChange={e => setExtensionForm(p => ({...p, reason: e.target.value}))} placeholder="Why is more time needed?" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24 resize-none focus:border-black dark:focus:border-white focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowExtensionModal(false)} className="flex-1 py-3 text-xs font-bold text-slate-500 border border-slate-200 dark:border-[#262626] rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-[#171717]">CANCEL</button>
              <button onClick={handleExtensionSubmit} className="btn-primary flex-1 py-3 text-xs font-black rounded-xl">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
