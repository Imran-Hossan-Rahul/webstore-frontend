import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Plus, Calendar, Download, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/utils/api";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    category: "Design",
    tags: [],
    tools: ["React", "Node.js"], // Default 2 tools
    startDate: "",
    endDate: "",
    originalEndDate: "", // Locked after publish
    duration: "",
    difficulty: 2, // 0-4 scale
    timeSpent: "",
    location: "",
    status: "Planning",
    githubUrl: "",
    liveUrl: "",
    documentationUrl: "",
    extensions: [], // Timeline extensions with reasons
    collaborators: [],
    license: "None",
  });
  const [milestones, setMilestones] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [resourceFile, setResourceFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI State
  const [tagInput, setTagInput] = useState("");
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [customToolInput, setCustomToolInput] = useState("");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    date: "",
    status: "planned",
    description: "",
  });

  // Notification State
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ ...notification, show: false }), 4000);
  };

  // Validation
  const validateForm = () => {
    if (!projectData.title.trim()) return { valid: false, message: "Project Title is required" };
    if (!projectData.startDate) return { valid: false, message: "Start Date is required" };
    if (!projectData.endDate) return { valid: false, message: "End Date is required" };
    
    // Check if end date is after start date
    if (new Date(projectData.endDate) < new Date(projectData.startDate)) {
        return { valid: false, message: "End Date cannot be before Start Date" };
    }
    
    return { valid: true };
  };

  // Extension Modal State
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionForm, setExtensionForm] = useState({
    newDate: "",
    reason: "",
  });

  const fileInputRef = useRef(null);
  const resourceInputRef = useRef(null);
  // Rich Text Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        taskList: false,
        taskItem: false,
      }),
      Placeholder.configure({
        placeholder:
          "Tell us the story behind your project, your inspiration, and challenges faced. Share your creative process, the problems you solved, and what you learned along the way.",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[120px] text-sm text-gray-300",
      },
    },
  });
  // Comprehensive Tech Stack List
  const availableTechStack = [
    "React",
    "Node.js",
    "Figma",
    "Adobe XD",
    "Vue.js",
    "Python",
    "MongoDB",
    "TensorFlow",
    "Angular",
    "Next.js",
    "Express",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "TypeScript",
    "JavaScript",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Ionic",
    "Xamarin",
    "Unity",
    "Unreal Engine",
    "Photoshop",
    "Illustrator",
    "Sketch",
    "InVision",
    "Framer",
    "Webflow",
    "GraphQL",
    "REST API",
    "Socket.io",
    "WebRTC",
    "Firebase",
    "Supabase",
    "Tailwind CSS",
    "Bootstrap",
    "Material-UI",
    "Chakra UI",
    "Ant Design",
    "Git",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "Jira",
    "Trello",
    "Notion",
    "Webpack",
    "Vite",
    "Babel",
    "ESLint",
    "Prettier",
    "Jest",
    "Cypress",
    "Stripe",
    "PayPal",
    "Twilio",
    "SendGrid",
    "Cloudinary",
    "Vercel",
    "Netlify",
  ];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const techIcons = [
    { name: "React", color: "from-cyan-400 to-blue-500" },
    { name: "Node.js", color: "from-green-400 to-emerald-600" },
    { name: "Figma", color: "from-purple-400 to-pink-500" },
    { name: "Adobe XD", color: "from-pink-500 to-rose-500" },
    { name: "Vue.js", color: "from-green-300 to-teal-500" },
    { name: "Python", color: "from-blue-400 to-cyan-500" },
    { name: "MongoDB", color: "from-green-500 to-lime-600" },
    { name: "TensorFlow", color: "from-orange-400 to-amber-500" },
  ];
  // Constants
  const difficultyLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
    "Master",
  ];

  // Helper Functions
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    if (weeks > 0) {
      return `${weeks} Week${weeks > 1 ? "s" : ""}${
        days > 0 ? ` ${days} Day${days > 1 ? "s" : ""}` : ""
      }`;
    }
    return `${days} Day${days > 1 ? "s" : ""}`;
  };
  // Calculate timeline segments for multi-phase progress bar
  const calculateTimelineSegments = () => {
    if (!projectData.startDate || !projectData.endDate) return [];

    const segments = [];
    const start = new Date(projectData.startDate);
    const originalEnd = new Date(
      projectData.originalEndDate || projectData.endDate
    );
    const currentEnd = new Date(projectData.endDate);
    const today = new Date();

    // Calculate total timeline duration (including all extensions)
    const totalDuration = currentEnd - start;

    // Original timeline segment
    const originalDuration = originalEnd - start;
    const originalWidth = (originalDuration / totalDuration) * 100;
    const originalProgress =
      today < start
        ? 0
        : today > originalEnd
        ? 100
        : ((today - start) / originalDuration) * 100;

    segments.push({
      type: "original",
      width: originalWidth,
      progress: Math.min(originalProgress, 100),
      color: "from-purple-500 to-pink-500",
      label: "Original Timeline",
    });

    // Extension segments
    if (projectData.extensions && projectData.extensions.length > 0) {
      let previousEnd = originalEnd;

      projectData.extensions.forEach((ext, index) => {
        const extStart = new Date(ext.previousEndDate);
        const extEnd = new Date(ext.newEndDate);
        const extDuration = extEnd - extStart;
        const extWidth = (extDuration / totalDuration) * 100;

        // Calculate progress for this extension
        const extProgress =
          today < extStart
            ? 0
            : today > extEnd
            ? 100
            : ((today - extStart) / extDuration) * 100;

        segments.push({
          type: "extension",
          width: extWidth,
          progress: Math.min(extProgress, 100),
          color:
            index === 0
              ? "from-orange-500 to-orange-600"
              : index === 1
              ? "from-red-500 to-red-600"
              : "from-red-700 to-red-900",
          label: `Extension ${index + 1}`,
          reason: ext.reason,
          duration: calculateDuration(ext.previousEndDate, ext.newEndDate),
        });

        previousEnd = extEnd;
      });
    }

    return segments;
  };
  // Get color for segment based on index
  const getSegmentColor = (index) => {
    const colors = [
      "from-purple-500 to-pink-500", // Original
      "from-orange-500 to-orange-600", // Extension 1
      "from-red-500 to-red-600", // Extension 2
      "from-red-700 to-red-900", // Extension 3+
    ];
    return colors[Math.min(index, colors.length - 1)];
  };
  // Tag Management
  const handleExtensionSubmit = () => {
    if (!extensionForm.newDate || !extensionForm.reason) return;
    
    // Validate new date
    const currentEnd = new Date(projectData.endDate);
    const newEnd = new Date(extensionForm.newDate);
    
    if (newEnd <= currentEnd) {
      alert("New end date must be after the current end date");
      return;
    }
    
    // Create new extension object
    const newExtension = {
      id: Date.now(),
      previousEndDate: projectData.endDate,
      newEndDate: extensionForm.newDate,
      reason: extensionForm.reason,
      extendedOn: new Date().toISOString(),
      duration: calculateDuration(projectData.endDate, extensionForm.newDate)
    };
    
    // Update project data
    setProjectData(prev => ({
      ...prev,
      endDate: extensionForm.newDate,
      extensions: [...(prev.extensions || []), newExtension],
      // If originalEndDate wasn't set (first extension), set it now
      originalEndDate: prev.originalEndDate || prev.endDate
    }));
    
    // Reset and close
    setExtensionForm({ newDate: '', reason: '' });
    setShowExtensionModal(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !projectData.tags.includes(tagInput.trim())) {
      setProjectData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove) => {
    setProjectData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };
  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Collaborator Management
  const addCollaborator = () => {
    if (collaboratorInput.trim() && !projectData.collaborators.includes(collaboratorInput.trim())) {
      setProjectData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, collaboratorInput.trim()],
      }));
      setCollaboratorInput("");
    }
  };
  const removeCollaborator = (name) => {
    setProjectData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((c) => c !== name),
    }));
  };
   const handleCollaboratorKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    }
  };
  // Tech Stack Management
  const toggleTech = (techName) => {
    setProjectData((prev) => ({
      ...prev,
      tools: prev.tools.includes(techName)
        ? prev.tools.filter((t) => t !== techName)
        : [...prev.tools, techName],
    }));
  };
  const handleToolInputChange = (value) => {
    setCustomToolInput(value);

    if (value.trim().length > 0) {
      const filtered = availableTechStack
        .filter(
          (tech) =>
            tech.toLowerCase().includes(value.toLowerCase()) &&
            !projectData.tools.includes(tech)
        )
        .slice(0, 8); // Show max 8 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };
  const addCustomTool = (toolName = null) => {
    const tool = toolName || customToolInput.trim();
    if (tool && !projectData.tools.includes(tool)) {
      setProjectData((prev) => ({
        ...prev,
        tools: [...prev.tools, tool],
      }));
      setCustomToolInput("");
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };
  // Milestone Management
  const addMilestone = () => {
    if (newMilestone.title.trim()) {
      setMilestones((prev) => [
        ...prev,
        {
          ...newMilestone,
          id: Date.now(),
        },
      ]);
      setNewMilestone({
        title: "",
        date: "",
        status: "planned",
        description: "",
      });
      setShowMilestoneForm(false);
    }
  };
  const deleteMilestone = (id) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };
  // Date Management
  const handleDateChange = (field, value) => {
    setProjectData((prev) => {
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
  // File Upload Handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };
  // Resource Upload Handler
  const resourceUploadRef = useRef(null);
  const [resource, setResource] = useState(null); // { tempPath, originalName, size, uploading }

  const handleResourceClick = () => {
    resourceUploadRef.current?.click();
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowedExts = ['.zip', '.pdf', '.rar', '.7z'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExts.includes(ext)) {
        showToast("error", "Invalid file type. Only ZIP, PDF, RAR, 7Z allowed.");
        return;
    }

    setResource({ ...resource, uploading: true, originalName: file.name });

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await api.upload("/upload/resource", formData); 
        if (res.success) {
            setResource({
                tempPath: res.data.tempPath,
                originalName: res.data.originalName,
                size: res.data.size,
                uploading: false
            });
            showToast("success", "Resource uploaded successfully!");
        }
    } catch (err) {
        console.error("Resource upload failed", err);
        showToast("error", "Failed to upload resource. Please try again.");
        setResource(null);
    }
  };
  // Submit Handler
  const handleSubmit = async () => {
    // 1. Validate Form
    const validation = validateForm();
    if (!validation.valid) {
        showToast("error", validation.message);
        return;
    }

    setLoading(true);
    try {
      const content = editor?.getHTML() || "";
      const payload = {
        content,
        postType: "project",
        category: projectData.category,
        tags: projectData.tags,
        projectStats: {
          tools: projectData.tools,
          timeSpent: projectData.timeSpent,
          projectLink: projectData.githubUrl,
          difficulty: difficultyLevels[projectData.difficulty],
          location: projectData.location,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          status: projectData.status,
          livePreviewUrl: projectData.liveUrl,
          documentationUrl: projectData.documentationUrl,
          milestones: milestones.map((m) => ({
            title: m.title,
            date: m.date,
            status: m.status,
            description: m.description,
          })),
          // New Fields
          collaborators: projectData.collaborators,
          license: projectData.license,
          originalEndDate: projectData.originalEndDate || projectData.endDate, // Fallback if not set
          extensions: projectData.extensions.map(ext => ({
              newDate: ext.newDate,
              reason: ext.reason,
              date: ext.date
          })),
          extensions: projectData.extensions.map(ext => ({
              newDate: ext.newDate,
              reason: ext.reason,
              date: ext.date
          })),
          resources: resource && resource.tempPath
            ? [
                {
                  title: resource.originalName,
                  tempPath: resource.tempPath, // Backend will pick this up
                  originalName: resource.originalName,
                  type: "file",
                },
              ]
            : [],
        },
      };

      const postRes = await api.post("/posts/create", payload);
      
      const newPostId = postRes.data._id;
      console.log("Project created with ID:", newPostId);

      // 2. Upload Images (if any)
      if (images.length > 0 && newPostId) {
           // We need to upload images one by one or batch? 
           // The endpoint expects single file 'image' and 'postId'.
           // Let's loop.
           const uploadPromises = images.map(file => {
               const formData = new FormData();
               formData.append("image", file);
               formData.append("postId", newPostId);
               return api.upload("/upload/post-image", formData);
           });

           await Promise.all(uploadPromises);
           console.log("All images queued for upload");
      }

      showToast("success", "Project published successfully!");
      
      // Delay closing to show success message
      setTimeout(() => {
          if (onProjectCreated) onProjectCreated();
          onClose(); 
      }, 1500);

    } catch (error) {
      console.error("Failed to create project:", error);
      const errorMsg = error.response?.data?.message || "Failed to create project. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm lg:pl-[280px] transition-all duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl shadow-purple-500/20 rounded-3xl overflow-hidden ring-1 ring-white/10"
      >
        {/* Toast Notification */}
        {notification.show && (
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
                notification.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
            }`}>
               {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
               <span className="text-sm font-semibold">{notification.message}</span>
            </div>
        )}

        {/* Modal Content */}
        <div className="bg-[#15121e] h-full flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-purple-500/20 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                Create Project Post ✨
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Share your creative journey, process, and final work with the
                community.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 overflow-y-auto custom-scrollbar flex-1">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* 1. PROJECT BASICS */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  1. PROJECT BASICS
                </h3>

                {/* Project Title */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectData.title}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter your project name..."
                    className="w-full px-4 py-3 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  />
                </div>
                {/* Rich Text Editor - Full Featured */}
                <div className="mb-4">
                  <div className="bg-[#2a2438] border border-purple-500/20 rounded-xl overflow-hidden">
                    {/* Toolbar - Comprehensive */}
                    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-purple-500/10 bg-[#221932] flex-wrap">
                      {/* Text Formatting */}
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("bold")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Bold"
                      >
                        <span className="text-sm font-bold">B</span>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("italic")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Italic"
                      >
                        <span className="text-sm italic">I</span>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleUnderline().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("underline")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Underline"
                      >
                        <span className="text-sm underline">U</span>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleStrike().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("strike")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Strikethrough"
                      >
                        <span className="text-sm line-through">S</span>
                      </button>
                      <div className="w-px h-5 bg-purple-500/20 mx-1" />
                      {/* Lists */}
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleBulletList().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("bulletList")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Bullet List"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleOrderedList().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("orderedList")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Numbered List"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleTaskList().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("taskList")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Task List"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="w-px h-5 bg-purple-500/20 mx-1" />
                      {/* Alignment */}
                      <button
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("left").run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive({ textAlign: "left" })
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Align Left"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("center").run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive({ textAlign: "center" })
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Align Center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm-3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().setTextAlign("right").run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive({ textAlign: "right" })
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Align Right"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="w-px h-5 bg-purple-500/20 mx-1" />
                      {/* Insert */}
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleCodeBlock().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("codeBlock")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Code Block"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().toggleBlockquote().run()
                        }
                        className={`p-2 rounded hover:bg-white/10 transition ${
                          editor?.isActive("blockquote")
                            ? "bg-white/10 text-white"
                            : "text-gray-400"
                        }`}
                        title="Quote"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          editor?.chain().focus().setHorizontalRule().run()
                        }
                        className="p-2 rounded hover:bg-white/10 transition text-gray-400"
                        title="Horizontal Rule"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <div className="w-px h-5 bg-purple-500/20 mx-1" />
                      {/* More Options */}
                      <button
                        className="p-2 rounded hover:bg-white/10 transition text-gray-400"
                        title="More Options"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    {/* Editor Content Area */}
                    <div className="px-4 py-3 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
                      <EditorContent
                        editor={editor}
                        className="prose prose-invert prose-sm max-w-none focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tell us the story behind your project, your inspiration, and
                    challenges faced.
                  </p>
                </div>
                {/* Category & Tags */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    value={projectData.category}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none mb-3"
                  >
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Web">Web</option>
                    <option value="Game Dev">Game Dev</option>
                    <option value="Other">Other</option>
                  </select>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add a tag (press Enter)..."
                      className="flex-1 px-4 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projectData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-white transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {projectData.tags.length === 0 && (
                      <span className="text-xs text-gray-500 italic">
                        No tags added yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Collaborators */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Collaborators & Team
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={collaboratorInput}
                      onChange={(e) => setCollaboratorInput(e.target.value)}
                      onKeyPress={handleCollaboratorKeyPress}
                      placeholder="Add team member name..."
                      className="flex-1 px-4 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={addCollaborator}
                      className="px-4 py-2 bg-purple-600/50 hover:bg-purple-500/50 text-white rounded-lg text-sm font-semibold transition border border-purple-500/30"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projectData.collaborators.map((name, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#1f1a2e] border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium flex items-center gap-2"
                      >
                         <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] text-white font-bold">
                             {name.charAt(0).toUpperCase()}
                         </div>
                        {name}
                        <button
                          onClick={() => removeCollaborator(name)}
                          className="hover:text-white transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {projectData.collaborators.length === 0 && (
                      <span className="text-xs text-gray-500 italic">
                        Solo project (Add teammates if any)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* 2. PROJECT MEDIA */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  2. PROJECT MEDIA
                </h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition bg-[#2a2438]/30"
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">
                    Drag and drop images & videos here,
                  </p>
                  <p className="text-gray-500 text-xs mt-1">or browse files</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {imagePreviews.slice(0, 4).map((preview, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-purple-500/20"
                      >
                        <img
                          src={preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {idx === 3 && imagePreviews.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-bold">
                              +{imagePreviews.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* 3. TECH STACK & TOOLS */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  3. TECH STACK & TOOLS
                </h3>

                {/* Search/Add Tool Input - Moved to Top */}
                <div className="mb-3 relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customToolInput}
                      onChange={(e) => handleToolInputChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomTool();
                        }
                      }}
                      onFocus={() => {
                        if (customToolInput.trim()) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="Search tools (e.g., Next.js, Docker, AWS)..."
                      className="flex-1 px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={addCustomTool}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1f1a2e] border border-purple-500/40 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                      <div className="p-2 border-b border-purple-500/20 bg-[#2a2438]">
                        <p className="text-xs text-gray-400">
                          {filteredSuggestions.length} suggestion
                          {filteredSuggestions.length !== 1 ? "s" : ""} found
                        </p>
                      </div>
                      {filteredSuggestions.map((tech, idx) => (
                        <button
                          key={idx}
                          onClick={() => addCustomTool(tech)}
                          className="w-full px-3 py-2 text-left text-sm text-white hover:bg-purple-500/30 transition flex items-center justify-between group border-b border-purple-500/10 last:border-0"
                        >
                          <span className="font-medium">{tech}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition">
                              Click to add
                            </span>
                            <Plus className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Selected Tools Count */}
                <p className="text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-purple-400">
                    {projectData.tools.length}
                  </span>{" "}
                  tool{projectData.tools.length !== 1 ? "s" : ""} selected
                </p>
                {/* Available Tech Icons - Grayed when not selected */}
                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {/* React */}
                  <div
                    onClick={() => toggleTech("React")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("React")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {/* Selected Indicator */}
                    {projectData.tools.includes("React") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-7 h-7 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9.03 4.71c.6 1.29.72 2.32.45 2.59-.27.27-1.25.07-2.49-.64.39-.64.72-1.3 1.02-1.96.34-.01.67-.04 1.02-.09M7.88 7.29c-.6-1.29-.72-2.32-.45-2.59.27-.27 1.25-.07 2.49.64-.39.64-.72 1.3-1.02 1.96-.34.01-.67.04-1.02.09m8.24 9.42c-.39.64-.72 1.3-1.02 1.96-1.24.71-2.22.91-2.49.64-.27-.27-.15-1.3.45-2.59.35.05.68.08 1.02.09.3.66.63 1.32 1.02 1.96z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      React
                    </span>
                  </div>
                  {/* Node.js */}
                  <div
                    onClick={() => toggleTech("Node.js")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("Node.js")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("Node.js") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.47 1.71.47 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22H8.5c-.13 0-.23.1-.23.22v8.47c0 .66-.68 1.31-1.77.76L4.45 16.5a.26.26 0 0 1-.11-.21V7.71c0-.09.04-.17.11-.21l7.44-4.29c.06-.04.16-.04.22 0l7.44 4.29c.07.04.11.12.11.21v8.58c0 .08-.04.16-.11.21l-7.44 4.29c-.06.04-.16.04-.22 0L10 19.65c-.08-.03-.16-.04-.21-.01-.53.3-.63.36-1.12.51-.12.04-.31.11.07.32l2.48 1.47c.24.14.5.21.77.21s.54-.07.78-.21l7.44-4.29c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.77-.2z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      Node.js
                    </span>
                  </div>
                  {/* Figma */}
                  <div
                    onClick={() => toggleTech("Figma")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("Figma")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("Figma") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h3V12H8a3 3 0 0 1 0-6h3V2H8zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                        <circle cx="16" cy="12" r="3" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      Figma
                    </span>
                  </div>
                  {/* Adobe XD */}
                  <div
                    onClick={() => toggleTech("Adobe XD")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("Adobe XD")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("Adobe XD") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <span className="text-white font-bold text-lg">Xd</span>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      Adobe XD
                    </span>
                  </div>
                  {/* Vue.js */}
                  <div
                    onClick={() => toggleTech("Vue.js")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("Vue.js")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("Vue.js") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-teal-500 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M2 3h3.5L12 15l6.5-12H22L12 21L2 3m4.5 0h3L12 7.58L14.5 3h3L12 13.08L6.5 3z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      Vue.js
                    </span>
                  </div>
                  {/* Python */}
                  <div
                    onClick={() => toggleTech("Python")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("Python")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("Python") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9.585 11.692h4.328s2.432.039 2.432-2.35V5.391S16.714 3 11.936 3C7.362 3 7.647 4.983 7.647 4.983l.006 2.055h4.363v.617H5.92s-2.927-.332-2.927 4.282 2.555 4.45 2.555 4.45h1.524v-2.141s-.083-2.554 2.513-2.554zm-.056-5.74a.784.784 0 1 1 0-1.57.784.784 0 1 1 0 1.57z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      Python
                    </span>
                  </div>
                  {/* MongoDB */}
                  <div
                    onClick={() => toggleTech("MongoDB")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("MongoDB")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("MongoDB") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M13.74 4.23c-.84-1-1.57-2-1.71-2.22H12c-.14.21-.87 1.22-1.71 2.22-7.2 9.19 1.14 15.39 1.14 15.39l.07.05c.06.95.22 2.33.22 2.33h.62s.15-1.37.21-2.33l.07-.06s8.32-6.19 1.12-15.38zM12 19.48a3.48 3.48 0 0 1-.48-.48L12 9l.45 10a3.57 3.57 0 0 1-.45.48z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      MongoDB
                    </span>
                  </div>
                  {/* TensorFlow */}
                  <div
                    onClick={() => toggleTech("TensorFlow")}
                    className={`aspect-square bg-[#1f1a2e] border-2 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500/60 transition cursor-pointer group relative ${
                      projectData.tools.includes("TensorFlow")
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 opacity-100"
                        : "border-gray-600/30 opacity-40 hover:opacity-70"
                    }`}
                  >
                    {projectData.tools.includes("TensorFlow") && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg mb-1.5 flex items-center justify-center group-hover:scale-110 transition">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603l-6.168 3.564.015-5.31zm21.43 5.311l-.014-5.31L12.46 0v24l4.095-2.378V14.87l3.092 1.788-.018-4.618-3.074-1.756V7.603l6.168 3.564z" />
                      </svg>
                    </div>
                    <span className="text-[9px] text-gray-300 font-semibold text-center">
                      TensorFlow
                    </span>
                  </div>
                  {/* Display Custom/Selected Tools with Proper Icons */}
                  {projectData.tools
                    .filter(
                      (t) =>
                        ![
                          "React",
                          "Node.js",
                          "Figma",
                          "Adobe XD",
                          "Vue.js",
                          "Python",
                          "MongoDB",
                          "TensorFlow",
                        ].includes(t)
                    )
                    .map((tool, idx) => {
                      // Format tool name for icon URL - handle special cases
                      const getIconUrl = (toolName) => {
                        const formatted = toolName
                          .toLowerCase()
                          .replace(/\s+/g, "")
                          .replace(/\./g, "dot")
                          .replace(/\+/g, "plus")
                          .replace(/#/g, "sharp")
                          .replace(/-/g, "");
                        // Use actual brand colored SVG from Simple Icons
                        return `https://cdn.simpleicons.org/${formatted}`;
                      };
                      return (
                        <div
                          key={idx}
                          className="aspect-square bg-[#1f1a2e] border-2 border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20 rounded-lg flex flex-col items-center justify-center p-2 relative group"
                        >
                          <button
                            onClick={() =>
                              setProjectData((prev) => ({
                                ...prev,
                                tools: prev.tools.filter((t) => t !== tool),
                              }))
                            }
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/10 rounded z-10"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          {/* Checkmark for selected custom tools */}
                          <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {/* Light background with actual brand colored logo */}
                          <div className="w-10 h-10 bg-white/95 rounded-lg mb-1.5 flex items-center justify-center overflow-hidden relative p-2">
                            <img
                              src={getIconUrl(tool)}
                              alt={tool}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback to initials if logo not found
                                e.target.style.display = "none";
                                const parent = e.target.parentElement;
                                parent.classList.remove("bg-white/95");
                                parent.classList.add(
                                  "bg-gradient-to-br",
                                  "from-purple-400",
                                  "to-pink-500"
                                );
                                const fallback =
                                  parent.querySelector(".fallback-initials");
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div className="fallback-initials hidden w-full h-full items-center justify-center absolute inset-0">
                              <span className="text-white font-bold text-sm">
                                {tool.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] text-gray-300 font-semibold text-center truncate w-full px-1">
                            {tool}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* 1. PROJECT TIMELINE */}
              <div className="bg-[#1f1a2e] border border-purple-500/20 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  1. PROJECT TIMELINE
                </h3>

                <div className="space-y-4">
                  {/* Start and End Date - Side by Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={projectData.startDate}
                        onChange={(e) =>
                          handleDateChange("startDate", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={projectData.endDate}
                        onChange={(e) =>
                          handleDateChange("endDate", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Duration and Days Left Display */}
                  {projectData.duration && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Total Duration */}
                      <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 mb-0.5">
                            Duration
                          </span>
                          <span className="text-sm font-semibold text-purple-400">
                            {projectData.duration}
                          </span>
                        </div>
                      </div>
                      {/* Days Left */}
                      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 mb-0.5">
                            Days Left
                          </span>
                          <span className="text-sm font-semibold text-blue-400">
                            {(() => {
                              const end = new Date(projectData.endDate);
                              const today = new Date();

                              if (today > end) return "Completed";

                              const diffTime = end - today;
                              const diffDays = Math.ceil(
                                diffTime / (1000 * 60 * 60 * 24)
                              );

                              return diffDays > 0
                                ? `${diffDays} ${
                                    diffDays === 1 ? "Day" : "Days"
                                  }`
                                : "Today";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Timeline Progress Bar - Multi-Segment with Extensions */}
                  {projectData.startDate && projectData.endDate && (
                    <div className="mt-4">
                      <div className="relative h-2 bg-[#2a2438] rounded-full overflow-hidden">
                        {(() => {
                          const segments = calculateTimelineSegments();
                          let cumulativeWidth = 0;

                          return segments.map((segment, index) => {
                            const segmentStyle = {
                              left: `${cumulativeWidth}%`,
                              width: `${segment.width}%`,
                            };
                            cumulativeWidth += segment.width;

                            return (
                              <div
                                key={index}
                                className={`absolute inset-y-0 bg-gradient-to-r ${segment.color} transition-all duration-500`}
                                style={segmentStyle}
                                title={
                                  segment.reason
                                    ? `${segment.label}: ${segment.reason} (+${segment.duration})`
                                    : segment.label
                                }
                              />
                            );
                          });
                        })()}
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">Start</span>
                        <span className="text-xs text-purple-400 font-semibold">
                          {(() => {
                            const start = new Date(projectData.startDate);
                            const end = new Date(projectData.endDate);
                            const today = new Date();

                            if (today < start) return "Not Started";
                            if (today > end) return "Completed";

                            const totalDuration = end - start;
                            const elapsed = today - start;
                            const percentage = Math.round(
                              (elapsed / totalDuration) * 100
                            );

                            return `${percentage}% Complete`;
                          })()}
                        </span>
                        <span className="text-xs text-gray-500">End</span>
                      </div>

                      {/* Extension Count Badge */}
                      {projectData.extensions &&
                        projectData.extensions.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-orange-400 font-semibold">
                              {projectData.extensions.length} Extension
                              {projectData.extensions.length > 1 ? "s" : ""}
                            </span>
                            <div className="flex gap-1">
                              {projectData.extensions.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    idx === 0
                                      ? "bg-orange-500"
                                      : idx === 1
                                      ? "bg-red-500"
                                      : "bg-red-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                  
                  {/* Extend Timeline Button - Only shows when timeline is active */}
                  {projectData.startDate && projectData.endDate && (
                    <div className="pt-2">
                       <button
                        onClick={() => {
                          setExtensionForm(prev => ({ ...prev, newDate: '' }));
                          setShowExtensionModal(true);
                        }}
                        className="w-full px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition flex items-center justify-center gap-2 text-xs font-semibold group"
                      >
                        <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                        Extend Timeline
                      </button>

                      {/* Extension History */}
                      {projectData.extensions && projectData.extensions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-500/10">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Extension History</h4>
                          <div className="space-y-2">
                            {projectData.extensions.map((ext, idx) => (
                              <div key={idx} className="bg-[#2a2438] rounded-lg p-2 border-l-2" style={{ borderColor: idx === 0 ? '#f97316' : '#ef4444' }}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-xs text-gray-300 font-medium">Extension {idx + 1}</div>
                                    <div className="text-[10px] text-gray-500">{new Date(ext.extendedOn).toLocaleDateString()}</div>
                                  </div>
                                  <div className="text-xs font-bold text-gray-400">+{ext.duration}</div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">"{ext.reason}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* 2. MILESTONES - Exact from image */}
              <div className="bg-[#1f1a2e] border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    2. MILESTONES
                  </h3>
                  <button 
                  onClick={() => setShowMilestoneForm(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    Add Milestone
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Milestones
                  </label>
                </div>
                  {/* Milestone Form */}
                  {showMilestoneForm && (
                     <div className="bg-[#2a2438] rounded-xl p-4 border border-purple-500/30 mb-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <div>
                           <label className="block text-xs font-semibold text-gray-400 mb-1">Title</label>
                           <input
                            type="text"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone(prev => ({...prev, title: e.target.value}))}
                            placeholder="Milestone title..."
                            className="w-full px-3 py-2 bg-[#1f1a2e] border border-purple-500/20 rounded-lg text-white text-xs focus:border-purple-500 focus:outline-none"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Date</label>
                            <input
                             type="date"
                             value={newMilestone.date}
                             onChange={(e) => setNewMilestone(prev => ({...prev, date: e.target.value}))}
                             className="w-full px-3 py-2 bg-[#1f1a2e] border border-purple-500/20 rounded-lg text-white text-xs focus:border-purple-500 focus:outline-none"
                            />
                           </div>
                           <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Status</label>
                            <select
                             value={newMilestone.status}
                             onChange={(e) => setNewMilestone(prev => ({...prev, status: e.target.value}))}
                             className="w-full px-3 py-2 bg-[#1f1a2e] border border-purple-500/20 rounded-lg text-white text-xs focus:border-purple-500 focus:outline-none"
                            >
                              <option value="planned">Planned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                           <textarea
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone(prev => ({...prev, description: e.target.value}))}
                            placeholder="Brief description..."
                            className="w-full px-3 py-2 bg-[#1f1a2e] border border-purple-500/20 rounded-lg text-white text-xs focus:border-purple-500 focus:outline-none resize-none h-16"
                           />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                           <button
                            onClick={() => setShowMilestoneForm(false)}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition"
                           >
                            Cancel
                           </button>
                           <button
                            onClick={addMilestone}
                            disabled={!newMilestone.title}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                           >
                            Add Milestone
                           </button>
                        </div>
                      </div>
                     </div>
                  )}

                  {/* Milestone List */}
                  {milestones.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="bg-[#2a2438] border border-purple-500/20 rounded-xl p-4 group relative hover:border-purple-500/40 transition">
                          <button
                           onClick={() => deleteMilestone(milestone.id)}
                           className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center justify-between">
                                 <div className={`w-8 h-1.5 rounded-full ${
                                   milestone.status === 'completed' ? 'bg-green-500' :
                                   milestone.status === 'in_progress' ? 'bg-yellow-500' : 'bg-blue-500'
                                 }`} />
                                 {milestone.date && (
                                   <span className="text-[10px] text-gray-500 font-mono">{new Date(milestone.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                                 )}
                             </div>
                             <div>
                              <h4 className="text-sm font-bold text-white leading-tight mb-1">{milestone.title}</h4>
                              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{milestone.description}</p>
                             </div>
                             
                             <div className="mt-1 pt-2 border-t border-white/5 flex items-center gap-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                   milestone.status === 'completed' ? 'text-green-400' :
                                   milestone.status === 'in_progress' ? 'text-yellow-400' : 'text-blue-400'
                                }`}>
                                    {milestone.status.replace('_', ' ')}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-purple-500/20 rounded-lg bg-[#2a2438]/30">
                       <p className="text-xs text-gray-500">No milestones yet. Plan your journey!</p>
                    </div>
                  )}
              </div>
              {/* 3. PROJECT METADATA */}
              <div className="bg-[#1f1a2e] border border-purple-500/20 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  3. PROJECT METADATA
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Difficulty Level - Segmented Control */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                       Difficulty Level
                    </label>
                    <div className="flex gap-1 p-1 bg-[#2a2438] rounded-xl border border-purple-500/20">
                      {["Beginner", "Easy", "Medium", "Hard", "Expert"].map((level, idx) => (
                        <button
                          key={level}
                          onClick={() => setProjectData(prev => ({ ...prev, difficulty: idx }))}
                          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                             projectData.difficulty === idx 
                             ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-400/50" 
                             : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Time Spent - Range Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Estimated Time Spent
                    </label>
                    <select
                      value={projectData.timeSpent}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          timeSpent: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select duration...</option>
                      <option value="< 1 Week">Less than 1 Week</option>
                      <option value="1 - 4 Weeks">1 - 4 Weeks</option>
                      <option value="1 - 3 Months">1 - 3 Months</option>
                      <option value="3 - 6 Months">3 - 6 Months</option>
                      <option value="6 Months +">More than 6 Months</option>
                      <option value="Ongoing">Ongoing / Indefinite</option>
                    </select>
                  </div>
                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={projectData.location}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  {/* Project Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                      Project Status
                    </label>
                    <select
                      value={projectData.status}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                 {/* License Selection */}
                 <div className="mt-4 pt-4 border-t border-purple-500/10">
                     <label className="block text-xs font-semibold text-gray-400 mb-2">
                       Project License
                     </label>
                     <select
                       value={projectData.license}
                       onChange={(e) =>
                         setProjectData((prev) => ({
                           ...prev,
                           license: e.target.value,
                         }))
                       }
                       className="w-full px-4 py-2 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                     >
                       <option value="None">No License (Copyrighted)</option>
                       <option value="MIT">MIT License (Open Source)</option>
                       <option value="Apache-2.0">Apache 2.0</option>
                       <option value="GPL-3.0">GPL 3.0</option>
                       <option value="BSD-3-Clause">BSD 3-Clause</option>
                       <option value="CC-BY-4.0">Creative Commons (CC BY 4.0)</option>
                       <option value="Unlicense">The Unlicense (Public Domain)</option>
                     </select>
                 </div>
              </div>
              {/* 4. LINKS & RESOURCES */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  4. LINKS & RESOURCES
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      GitHub Repository URL
                    </label>
                    <input
                      type="text"
                      value={projectData.githubUrl}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          githubUrl: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="text"
                      value={projectData.liveUrl}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          liveUrl: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Documentation Links
                    </label>
                    <input
                      type="text"
                      value={projectData.documentationUrl}
                      onChange={(e) =>
                        setProjectData((prev) => ({
                          ...prev,
                          documentationUrl: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                       Downloadable Resources (ZIP, PDF, RAR - Max 50MB)
                    </label>
                    <input 
                        type="file" 
                        ref={resourceUploadRef}
                        className="hidden"
                        onChange={handleResourceUpload}
                        accept=".zip,.pdf,.rar,.7z"
                    />
                    
                    {!resource ? (
                        <div 
                            onClick={handleResourceClick}
                            className="flex items-center justify-center gap-2 px-4 py-8 bg-[#2a2438] border border-dashed border-purple-500/20 rounded-xl text-gray-400 hover:border-purple-500/50 hover:bg-purple-500/5 transition cursor-pointer group"
                        >
                            <Download className="w-5 h-5 group-hover:text-purple-400 transition" />
                            <span className="text-sm">Click to upload resource</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between px-4 py-3 bg-[#2a2438] border border-purple-500/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <Download className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium truncat max-w-[200px]">{resource.originalName}</p>
                                    <p className="text-[10px] text-gray-400">
                                        {resource.uploading ? "Uploading..." : "Ready to publish"}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setResource(null); }}
                                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="px-8 py-4 border-t border-purple-500/20 bg-[#1a1625] flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Character Count:{" "}
              <span className="text-white font-medium">2345</span> / 5000 |
              Words: <span className="text-white font-medium">490</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-transparent hover:bg-white/5 text-gray-300 rounded-xl font-semibold transition border border-white/20 hover:border-white/30"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                {loading ? "Publishing..." : <>Publish Project 🚀</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Extension Modal Overlay */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1f1a2e] border border-orange-500/30 w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Extend Timeline</h3>
                <p className="text-xs text-gray-400">Add time to your project schedule</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">New End Date</label>
                <input 
                  type="date" 
                  value={extensionForm.newDate}
                  min={projectData.endDate}
                  onChange={(e) => setExtensionForm(prev => ({ ...prev, newDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 justify-between">
                  <div>
                    <span>Current: </span>
                    <span className="text-purple-400 font-medium">{projectData.endDate ? new Date(projectData.endDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  {extensionForm.newDate && projectData.endDate && (
                    <div className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded">
                       +{(() => {
                           const start = new Date(projectData.endDate);
                           const end = new Date(extensionForm.newDate);
                           const diffTime = Math.abs(end - start);
                           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                           return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
                       })()}
                    </div>
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Reason for Extension</label>
                <textarea 
                  value={extensionForm.reason}
                  onChange={(e) => setExtensionForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Why do you need more time? (e.g., Client requested changes, Bug fixes...)"
                  className="w-full px-4 py-3 bg-[#2a2438] border border-purple-500/20 rounded-lg text-white min-h-[100px] focus:border-orange-500 focus:outline-none resize-none transition-colors text-sm"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowExtensionModal(false)}
                  className="flex-1 py-3 bg-[#2a2438] hover:bg-[#342d47] text-white rounded-lg font-semibold transition border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExtensionSubmit}
                  disabled={!extensionForm.newDate || !extensionForm.reason}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Confirm Extension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1625;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
};
export default CreateProjectModal;
