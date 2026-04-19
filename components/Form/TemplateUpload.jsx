"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_SHAPES } from "@/constants/cardShapes";
import { Plus, X, Upload, Image as ImageIcon, FileText, Check, ChevronDown, DollarSign } from "lucide-react";

// Tech Stack Constants (copied from CreateProjectModal)
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
    "Stripe", "PayPal", "Twilio", "SendGrid", "Cloudinary", "Vercel", "Netlify",
  ];

// Inline SVG Icon Data (Reusing the premium icons from CreateProjectModal)
const techIcons = [
    { 
        name: "React", 
        color: "from-cyan-400 to-blue-500", 
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9.03 4.71c.6 1.29.72 2.32.45 2.59-.27.27-1.25.07-2.49-.64.39-.64.72-1.3 1.02-1.96.34-.01.67-.04 1.02-.09M7.88 7.29c-.6-1.29-.72-2.32-.45-2.59.27-.27 1.25-.07 2.49.64-.39.64-.72 1.3-1.02 1.96-.34.01-.67.04-1.02.09m8.24 9.42c-.39.64-.72 1.3-1.02 1.96-1.24.71-2.22.91-2.49.64-.27-.27-.15-1.3.45-2.59.35.05.68.08 1.02.09.3.66.63 1.32 1.02 1.96z" />
            </svg>
        )
    },
    { 
        name: "Node.js", 
        color: "from-green-400 to-emerald-600",
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.47 1.71.47 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22H8.5c-.13 0-.23.1-.23.22v8.47c0 .66-.68 1.31-1.77.76L4.45 16.5a.26.26 0 0 1-.11-.21V7.71c0-.09.04-.17.11-.21l7.44-4.29c.06-.04.16-.04.22 0l7.44 4.29c.07.04.11.12.11.21v8.58c0 .08-.04.16-.11.21l-7.44 4.29c-.06.04-.16.04-.22 0L10 19.65c-.08-.03-.16-.04-.21-.01-.53.3-.63.36-1.12.51-.12.04-.31.11.07.32l2.48 1.47c.24.14.5.21.77.21s.54-.07.78-.21l7.44-4.29c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.77-.2z" />
            </svg>
        )
    },
    { 
        name: "Figma", 
        color: "from-purple-400 to-pink-500",
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h3V12H8a3 3 0 0 1 0-6h3V2H8zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                <circle cx="16" cy="12" r="3" />
            </svg>
        ) 
    },
    { 
        name: "Adobe XD", 
        color: "from-pink-500 to-rose-500",
        icon: <span className="text-white font-bold text-lg">Xd</span>
    },
    { 
        name: "Vue.js", 
        color: "from-green-300 to-teal-500",
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 3h3.5L12 15l6.5-12H22L12 21L2 3m4.5 0h3L12 7.58L14.5 3h3L12 13.08L6.5 3z" />
            </svg>
        )
    },
    { 
        name: "Python", 
        color: "from-blue-400 to-cyan-500",
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.585 11.692h4.328s2.432.039 2.432-2.35V5.391S16.714 3 11.936 3C7.362 3 7.647 4.983 7.647 4.983l.006 2.055h4.363v.617H5.92s-2.927-.332-2.927 4.282 2.555 4.45 2.555 4.45h1.524v-2.141s-.083-2.554 2.513-2.554zm-.056-5.74a.784.784 0 1 1 0-1.57.784.784 0 1 1 0 1.57z" />
            </svg>
        )
    },
    { 
        name: "MongoDB", 
        color: "from-green-500 to-lime-600",
        icon: (
             <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M13.74 4.23c-.84-1-1.57-2-1.71-2.22H12c-.14.21-.87 1.22-1.71 2.22-7.2 9.19 1.14 15.39 1.14 15.39l.07.05c.06.95.22 2.33.22 2.33h.62s.15-1.37.21-2.33l.07-.06s8.32-6.19 1.12-15.38zM12 19.48a3.48 3.48 0 0 1-.48-.48L12 9l.45 10a3.57 3.57 0 0 1-.45.48z" />
             </svg>
        )
    },
    { 
        name: "TensorFlow", 
        color: "from-orange-400 to-amber-500",
        icon: (
             <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603l-6.168 3.564.015-5.31zm21.43 5.311l-.014-5.31L12.46 0v24l4.095-2.378V14.87l3.092 1.788-.018-4.618-3.074-1.756V7.603l6.168 3.564z" />
             </svg>
        )
    },
  ];


export default function TemplateUploadFullDebug({
  endpoint = `${process.env.NEXT_PUBLIC_API_URL}/template/upload`,
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      category: "",
      priceType: "free",
      price: "",
      discount: "",
      currency: "USD",
      liveLink: "",
      tags: "",
      cardShape: "square-medium" // Default value, hidden from UI
  });

  const [previewFile, setPreviewFile] = useState(null);
  const [projectFile, setProjectFile] = useState(null);
  const previewImgRef = useRef(null);

  // Tech Stack State
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [techInput, setTechInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

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

   const handleProjectFileChange = (e) => {
    const file = e.target.files?.[0];
    setProjectFile(file);
  };
  
  // Tech Stack Handlers
  const toggleTech = (techName) => {
    setSelectedTechs((prev) => 
      prev.includes(techName)
        ? prev.filter((t) => t !== techName)
        : [...prev, techName]
    );
  };

  const handleTechInputChange = (value) => {
    setTechInput(value);
    if (value.trim().length > 0) {
      const filtered = availableTechStack
        .filter(
          (tech) =>
            tech.toLowerCase().includes(value.toLowerCase()) &&
            !selectedTechs.includes(tech)
        )
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const addCustomTech = (techName = null) => {
    const tech = techName || techInput.trim();
    if (tech && !selectedTechs.includes(tech)) {
      setSelectedTechs((prev) => [...prev, tech]);
      setTechInput("");
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // --- Validation & Submit ---
  const validatePreviewFile = (file) => {
    if (!file) return "Preview file is required";
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const sizeMB = file.size / (1024 * 1024);

    if (!isImage && !isVideo) return "Preview must be image or video";
    if (isImage && sizeMB > 2) return "Image must be ≤ 2MB";
    if (isVideo && sizeMB > 10) return "Video must be ≤ 10MB";
    return true;
  };

  const validateProjectFile = (file) => {
    if (!file) return "Project file is required";
    const allowed = [
      "application/zip", "application/x-zip-compressed", "application/json",
      "text/javascript", "application/javascript", "text/css", "text/html", "application/octet-stream",
    ];
    // Simple extension check if type is generic
    if (!allowed.includes(file.type) && !file.name.match(/\.(zip|json|html|js|css)$/i)) {
      return "Project file must be zip/json/html/js/css";
    }
    if (file.size > 50 * 1024 * 1024) return "Project file must be ≤ 50MB";
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setDebug(null);

    // Required checks
    if (!formData.title.trim()) return setMessage("Title is required");
    if (!formData.description.trim()) return setMessage("Description is required");
    if (!formData.category) return setMessage("Category is required");
    if (!formData.priceType) return setMessage("Price type is required");
    
    if (formData.priceType === "paid") {
      const p = Number(formData.price);
      if (!formData.price) return setMessage("Price is required for paid templates");
      if (isNaN(p) || p <= 0) return setMessage("Price must be > 0");
    }

    const pv = validatePreviewFile(previewFile);
    if (pv !== true) return setMessage(pv);

    const pj = validateProjectFile(projectFile);
    if (pj !== true) return setMessage(pj);

    // Build FormData
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("tags", formData.tags);
    fd.append("category", formData.category);
    fd.append("priceType", formData.priceType);
    fd.append("price", formData.priceType === "paid" ? Number(formData.price) : 0);
    fd.append("discount", Number(formData.discount || 0));
    fd.append("currency", formData.currency);
    fd.append("liveLink", formData.liveLink);
    fd.append("cardShape", formData.cardShape); // Hidden default

    fd.append("previewFile", previewFile);
    fd.append("projectFile", projectFile);

    // Tech Stack
    if (selectedTechs.length > 0) {
        selectedTechs.forEach(t => fd.append("tech", t));
    }

    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const raw = await res.text();
      let parsed;
      try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = { raw }; }

      if (!res.ok) {
        let userMessage = "Upload failed";
        if (parsed) {
          if (parsed.errors && Array.isArray(parsed.errors)) userMessage = parsed.errors.join(" | ");
          else if (parsed.message) userMessage = parsed.message;
          else if (parsed.raw) userMessage = parsed.raw;
        }
        setMessage("❌ " + userMessage);
        return;
      }

      setMessage("✔ Template uploaded successfully!");
      // Reset
      e.target.reset();
      setFormData({ ...formData, title: "", description: "", price: "", tags: "", liveLink: "" });
      setSelectedTechs([]);
      setPreviewFile(null);
      setProjectFile(null);
      updatePreviewThumbnail(null);
      
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ " + (err.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight mb-4">
                Share Your Masterpiece
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Upload your template, connect with developers, and showcase your best work to the world.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Info Card */}
                    <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                           <FileText className="w-5 h-5 text-purple-400" /> Project Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Template Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Modern SaaS Dashboard"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Describe your template? What makes it special?"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                                    <div className="relative">
                                        <select 
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="UI">UI Design</option>
                                            <option value="Site Templates">Site Templates</option>
                                            <option value="eCommerce">eCommerce</option>
                                            <option value="Admin Dashboard">Admin Dashboard</option>
                                            <option value="Mobile Ui">Mobile UI</option>
                                            <option value="Components">Components</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Live Preview URL</label>
                                    <input
                                        name="liveLink"
                                        type="url"
                                        value={formData.liveLink}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tech Stack Card - THE NEW PREMIUM UI */}
                    <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                           3. TECH STACK & TOOLS
                        </h2>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text"
                                        value={techInput}
                                        onChange={(e) => handleTechInputChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomTech();
                                            }
                                        }}
                                        onFocus={() => { if (techInput.trim()) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Search tools (e.g., Next.js, Docker, AWS)..."
                                        className="w-full bg-[#1f1a2e] border border-gray-700/50 rounded-lg pl-4 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                                    />
                                    {/* <Plus className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" /> */}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addCustomTech()}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                            
                            {/* Suggestions Dropdown */}
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 bg-[#1f1a2e] border border-gray-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                                    {filteredSuggestions.map((tech, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => addCustomTech(tech)}
                                            className="w-full px-4 py-3 text-left hover:bg-white/5 text-gray-200 transition-colors flex items-center justify-between group border-b border-white/5 last:border-0"
                                        >
                                            <span className="font-medium">{tech}</span>
                                            <Plus className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                         <p className="text-sm text-gray-400">
                             <span className="text-purple-400 font-bold">{selectedTechs.length}</span> tools selected
                        </p>

                        {/* Unified Tech Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             {/* 1. Predefined Popular Icons */}
                            {techIcons.map((tech) => (
                                <div
                                    key={tech.name}
                                    onClick={() => toggleTech(tech.name)}
                                    className={`aspect-square relative cursor-pointer rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200 group border-2 ${
                                        selectedTechs.includes(tech.name)
                                            ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 opacity-100" 
                                            : "bg-[#1f1a2e] border-gray-700/30 opacity-60 hover:opacity-100 hover:border-purple-500/50"
                                    }`}
                                >
                                    {/* Selected Checkmark */}
                                    {selectedTechs.includes(tech.name) && (
                                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-sm z-10">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Icon Container with Gradient */}
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-inner mb-2 transform group-hover:scale-110 transition-transform duration-300`}>
                                        {tech.icon}
                                    </div>
                                    
                                    {/* Label */}
                                    <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${
                                        selectedTechs.includes(tech.name) ? "text-white" : "text-gray-400"
                                    }`}>
                                        {tech.name}
                                    </span>
                                </div>
                            ))}

                            {/* 2. Custom Selected Icons (Appended) */}
                            {selectedTechs
                                .filter(t => !techIcons.some(icon => icon.name === t))
                                .map((tech, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square relative cursor-pointer rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-200 group border-2 bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 opacity-100"
                                    >
                                        
                                        {/* Remove Button for Custom Tech (Instead of Toggle, maybe clearer to have explicit remove? Or just toggle logic) */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTech(tech);
                                            }}
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/10 rounded-full z-20"
                                        >
                                            <X className="w-3.5 h-3.5 text-white" />
                                        </button>

                                        {/* Selected Checkmark (Persistent) */}
                                         <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-sm z-10 group-hover:opacity-0 transition-opacity">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </div>

                                        {/* Icon Container (White/Fallback) */}
                                        <div className="w-10 h-10 bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden relative p-2 shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                                            <img
                                                src={`https://cdn.simpleicons.org/${tech.toLowerCase().replace(/\s+/g, "").replace(/\./g, "dot").replace(/\+/g, "plus")}`}
                                                alt={tech}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    // Show fallback text
                                                    e.target.nextSibling.style.display = "flex";
                                                }}
                                            />
                                            {/* Text Fallback */}
                                            <div className="hidden absolute inset-0 text-black font-bold text-xs items-center justify-center">
                                                {tech.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        {/* Label */}
                                        <span className="text-[10px] font-bold text-center leading-tight text-white truncate w-full px-1">
                                            {tech}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </section>

                </div>

                {/* Right Column: Pricing & Files */}
                <div className="space-y-6">
                    
                    {/* Pricing Card (Temporarily Disabled - All Free)
                     <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-400" /> Pricing
                        </h2>
                        
                        <div className="p-1 bg-black/40 rounded-xl flex">
                            {['free', 'paid'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({...prev, priceType: type}))}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                                        formData.priceType === type 
                                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {formData.priceType === 'paid' && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Price ($)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500/50 focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Discount (%)</label>
                                    <input
                                        name="discount"
                                        type="number"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500/50 focus:outline-none"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        )}
                     </section>
                     */}

                     {/* Uploads Card */}
                     <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-400" /> Files
                        </h2>

                        {/* Preview File */}
                        <div className="group relative">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Preview Image/Video</label>
                            <div className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/20 hover:bg-black/40 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                {previewFile ? (
                                    <>
                                        {/* Use img tag for preview ref */}
                                        <img 
                                            ref={previewImgRef} 
                                            className="absolute inset-0 w-full h-full object-cover" 
                                            alt="" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium">Click to change</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Drop image or video here</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*,video/*"
                                    onChange={handlePreviewFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>
                        </div>

                         {/* Project File */}
                         <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Project Source (.zip)</label>
                            <div className="relative w-full rounded-xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
                                <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {projectFile ? projectFile.name : "No file selected"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {projectFile ? `${(projectFile.size / (1024*1024)).toFixed(2)} MB` : "Max 50MB"}
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    onChange={handleProjectFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                                { !projectFile && <span className="text-xs font-bold text-blue-400 px-3 py-1 bg-blue-500/10 rounded-lg">Browse</span> }
                            </div>
                        </div>
                     </section>

                     {/* Submit Button */}
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-xl shadow-purple-500/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </span>
                        ) : (
                            "Publish Template"
                        )}
                     </button>
                     
                     {message && (
                         <div className={`p-4 rounded-xl text-center text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
                             message.includes('✔') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                         }`}>
                             {message}
                         </div>
                     )}

                </div>
            </div>
            
        </form>
      </div>
    </div>
  );
}
