"use client";
import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Upload, Image as ImageIcon, FileText, Check, ChevronDown, Zap, ArrowLeft, Github, ExternalLink, ShieldCheck, Layout, ShoppingCart, Smartphone, Box, Monitor, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomSelect from "@/components/ui/CustomSelect";
import { api } from "@/utils/api";

// Tech Stack Constants
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

const categories = [
  { value: "UI Design", label: "UI Design", icon: Layout },
  { value: "Web Applications", label: "Web Applications", icon: Monitor },
  { value: "E-Commerce", label: "E-Commerce", icon: ShoppingCart },
  { value: "Admin & Dashboards", label: "Admin & Dashboards", icon: Box },
  { value: "Mobile Design", label: "Mobile Design", icon: Smartphone },
  { value: "Components & Libraries", label: "Components & Libraries", icon: Box },
];

export default function ArtifactPublishForm({
  mode = "create", // "create", "edit", "upgrade"
  id = null,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  
  // Form State
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      category: "Web Applications",
      priceType: "free",
      price: "",
      discount: "",
      currency: "TKNS",
      liveLink: "",
      githubLink: "",
      tags: "",
      versionName: "",
      changelog: ""
  });

  const [previewFile, setPreviewFile] = useState(null);
  const [devlogFile, setDevlogFile] = useState(null);
  const previewImgRef = useRef(null);

  // Tech Stack State
  const [selectedTechs, setSelectedTechs] = useState(["React"]);
  const [techInput, setTechInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if ((mode === "edit" || mode === "upgrade") && id) {
      fetchArtifactData();
    }
  }, [mode, id]);

  const fetchArtifactData = async () => {
    try {
      setFetching(true);
      const res = await api.get(`/artifact/${id}`);
      const data = res.data || res;
      
      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "Web Applications",
        priceType: data.priceType || "free",
        price: data.price || "",
        discount: data.discount || "",
        currency: data.currency || "TKNS",
        liveLink: data.liveLink || "",
        githubLink: data.githubLink || "",
        tags: data.tags?.join(", ") || "",
        versionName: mode === "upgrade" ? "" : (data.currentVersion || "v1.0.0"),
        changelog: ""
      });
      setSelectedTechs(data.tech || []);
    } catch (err) {
      console.error("Failed to fetch artifact data", err);
      showToast("error", "Failed to load artifact data.");
    } finally {
      setFetching(false);
    }
  };

  const showToast = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // --- Handlers ---

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updatePreviewThumbnail = (file) => {
    if (!file) {
      if (previewImgRef.current) previewImgRef.current.src = "";
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      if (previewImgRef.current) {
        previewImgRef.current.src = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      if (previewImgRef.current) previewImgRef.current.src = "";
    }
  };

  const handlePreviewFileChange = (e) => {
    const file = e.target.files?.[0];
    setPreviewFile(file);
    updatePreviewThumbnail(file);
  };

   const handleDevlogFileChange = (e) => {
    const file = e.target.files?.[0];
    setDevlogFile(file);
  };
  
  const toggleTech = (techName) => {
    setSelectedTechs((prev) => 
      prev.includes(techName)
        ? prev.filter((t) => t !== techName)
        : [...prev, techName]
    );
  };

  const handleTechInputChange = (value) => {
    setTechInput(value);
    if (value.trim()) {
        const filtered = availableTechStack.filter(t => 
            t.toLowerCase().includes(value.toLowerCase()) && !selectedTechs.includes(t)
        ).slice(0, 5);
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
  };

  const addCustomTech = (tech) => {
    const finalTech = tech || techInput.trim();
    if (finalTech && !selectedTechs.includes(finalTech)) {
        setSelectedTechs(prev => [...prev, finalTech]);
    }
    setTechInput("");
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validation
    const isRequiredFilled = formData.title && formData.category;
    const areFilesRequired = mode === "create" || mode === "upgrade";
    const filesProvided = previewFile && devlogFile;

    if (!isRequiredFilled || (areFilesRequired && !filesProvided)) {
        showToast("error", "Please fill required fields and upload files.");
        return;
    }

    if (mode === "upgrade" && !formData.versionName) {
        showToast("error", "Version name is required for upgrade.");
        return;
    }

    setLoading(true);

    try {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) data.append(key, value);
        });
        
        if (previewFile) data.append("previewFile", previewFile);
        if (devlogFile) data.append("devlogFile", devlogFile);
        data.append("tech", selectedTechs.join(",")); // Match backend expectation

        let res;
        if (mode === "create") {
            res = await api.upload("/artifact/upload", data);
        } else if (mode === "edit") {
            res = await api.upload(`/artifact/${id}`, data, "PUT");
        } else if (mode === "upgrade") {
            res = await api.upload(`/artifact/${id}/upgrade`, data, "PUT");
        }
        
        if (res.success) {
            showToast("success", mode === "create" ? "Artifact published!" : (mode === "edit" ? "Changes saved!" : "Upgraded to " + formData.versionName));
            setTimeout(() => router.push(`/artifacts/${id || res.data?._id}`), 1500);
        } else {
            showToast("error", res.message || "Operation failed.");
        }
    } catch (err) {
        showToast("error", "An unexpected error occurred.");
        console.error(err);
    } finally {
        setLoading(false);
    }
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-[var(--font-syne)]">
            {mode === "create" ? "Publish Artifact" : (mode === "edit" ? "Edit Artifact" : `Upgrade Artifact Version`)}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
            {mode === "create" ? "Monetize and showcase your best work" : (mode === "edit" ? `Modifying ${formData.title}` : `Releasing next version of ${formData.title}`)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition uppercase tracking-wider">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || fetching}
            className="btn-primary px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={16} strokeWidth={1.5} />}
            {loading ? "Processing..." : (mode === "create" ? "Publish Artifact" : (mode === "edit" ? "Save Changes" : "Publish Version"))}
          </button>
        </div>
      </div>

      {fetching && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-slate-900 dark:border-t-white rounded-full animate-spin mb-4" />
           <p className="text-[10px] font-bold uppercase tracking-widest">Hydrating artifact data...</p>
        </div>
      )}

      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-12 ${fetching ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Left Column */}
        <div className="space-y-12">
          {/* section: Basic Information */}
          <div className="space-y-8">
            <div className="space-y-6">
                {mode === "upgrade" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="group">
                            <label className="block text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-3">Version Name</label>
                            <input
                                name="versionName"
                                value={formData.versionName}
                                onChange={handleInputChange}
                                placeholder="e.g. v2.0.0"
                                className="w-full bg-white dark:bg-slate-900 border border-indigo-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-bold text-xs"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-3">Changelog</label>
                            <input
                                name="changelog"
                                value={formData.changelog}
                                onChange={handleInputChange}
                                placeholder="e.g. Fixed performance bugs..."
                                className="w-full bg-white dark:bg-slate-900 border border-indigo-500/20 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-bold text-xs"
                            />
                        </div>
                    </div>
                )}
                
                <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Artifact Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Modern Dashboard UI Kit"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-black dark:focus:border-white transition-all font-bold text-sm"
                    />
                </div>

                <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={8}
                        placeholder="Describe your artifact's features, tech stack, and what's included in the bundle..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect 
                        label="Category"
                        options={categories}
                        value={formData.category}
                        onChange={(val) => setFormData(p => ({...p, category: val}))}
                        dropdownWidth="w-full"
                    />
                    <div className="group">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tags (Comma separated)</label>
                        <input
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="ui, kit, react, tailwind"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm"
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* section: External Links */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">External Connectivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Live Demo URL</label>
                    <div className="relative">
                        <ExternalLink size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            name="liveLink"
                            value={formData.liveLink}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-black dark:focus:border-white transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">GitHub Repository</label>
                    <div className="relative">
                        <Github size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            name="githubLink"
                            value={formData.githubLink}
                            onChange={handleInputChange}
                            placeholder="https://github.com/..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-black dark:focus:border-white transition-all"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-12">
          {/* section: Media & Source */}
          <div className="space-y-8">
             <div className="space-y-6">
                <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Preview Asset (Cover)</label>
                    <div className="relative aspect-[16/10] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-black dark:hover:border-white transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                        {previewFile ? (
                            <>
                                <img 
                                    ref={previewImgRef} 
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-150" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <Upload size={24} strokeWidth={1.5} className="text-white" />
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Replace Media</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-8 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Drop Primary Preview</p>
                                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter leading-relaxed">
                                        PNG, JPG or MP4 (Max 10MB)
                                    </p>
                                </div>
                            </div>
                        )}
                        <input type="file" accept="image/*,video/*" onChange={handlePreviewFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Source Bundle (.zip)</label>
                    <div className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 flex items-center gap-4 group hover:border-black dark:hover:border-white transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                            <FileText size={20} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-widest">
                                {devlogFile ? devlogFile.name : "Select source file"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                {devlogFile ? `${(devlogFile.size / (1024*1024)).toFixed(2)} MB` : "Bundle all files into a .zip"}
                            </p>
                        </div>
                        <input type="file" accept=".zip,.rar,.7z" onChange={handleDevlogFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {!devlogFile && (
                            <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Browse
                            </div>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* section: Business Model */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Revenue Configuration</h3>
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8">
                <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-2xl">
                    {['free', 'paid'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, priceType: type}))}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                                formData.priceType === type 
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {formData.priceType === 'paid' && (
                    <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Price (TKNS)</label>
                            <div className="relative">
                                <Zap size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                                <input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-4 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-black dark:focus:border-white transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Discount (%)</label>
                            <input
                                name="discount"
                                type="number"
                                value={formData.discount}
                                onChange={handleInputChange}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-black dark:focus:border-white transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                            <ShieldCheck size={20} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Secured Delivery</h4>
                            <p className="text-[9px] text-slate-400 mt-1 font-bold leading-relaxed uppercase tracking-tighter">
                                Artifacts are encrypted and delivered automatically upon transaction completion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* section: Tech Stack Selection */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Technology Stack</h3>
            <div className="relative group">
                <input 
                    type="text"
                    value={techInput}
                    onChange={(e) => handleTechInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTech(); }}}
                    onFocus={() => { if (techInput.trim()) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search tools (e.g. Next.js)..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-black dark:focus:border-white transition-all text-sm font-bold"
                />
                <button type="button" onClick={() => addCustomTech()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg">
                    <Plus size={16} strokeWidth={1.5} />
                </button>
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-3 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {filteredSuggestions.map((tech, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => addCustomTech(tech)}
                                className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                                <span className="font-black text-[10px] uppercase tracking-widest">{tech}</span>
                                <Plus size={14} strokeWidth={1.5} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedTechs.map((tech) => (
                    <div key={tech} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest animate-in zoom-in duration-200">
                        {tech}
                        <button type="button" onClick={() => toggleTech(tech)} className="hover:text-red-500 transition-colors"><X size={14} strokeWidth={1.5} /></button>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
