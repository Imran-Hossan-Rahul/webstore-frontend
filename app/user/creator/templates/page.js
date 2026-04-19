"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { 
  Eye, Trash2, Edit3, BarChart2,
  MessageSquare, ThumbsUp, Globe, Lock,
  Search,
  LayoutGrid, Mail, Send, Clock, BookOpen, Settings, CheckSquare, FileText, Briefcase
} from "lucide-react";
import TemplateAnalyticsModal from "@/components/DashboardComponents/TemplateAnalyticsModal";

export default function CreatorTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'published', 'draft'
  
  // Selection State
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());

  // Analytics State
  const [analyticsTemplate, setAnalyticsTemplate] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Live Update: Poll every 10 seconds
  useEffect(() => {
    fetchUserTemplates();
    const interval = setInterval(fetchUserTemplates, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchUserTemplates = async () => {
    try {
      const res = await api.get("/template/my-templates");
      if (res.success) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await api.delete(`/template/${id}`);
      if (res.success) {
        fetchUserTemplates();
        setSelectedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet; 
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete template");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTemplates.size} templates?`)) return;
    
    const templatesToDelete = templates.filter(t => selectedTemplates.has(t._id));
    
    for (const template of templatesToDelete) {
        try {
            await api.delete(`/template/${template._id}`);
        } catch (err) {
            console.error(`Failed to delete ${template._id}`, err);
        }
    }
    setSelectedTemplates(new Set());
    fetchUserTemplates();
  };

  // Filter Logic
  const filteredTemplates = templates.filter(template => {
    const matchesAuth = activeTab === "all" || 
                        (activeTab === "published" && template.status === "approved") || 
                        (activeTab === "draft" && template.status === "pending");
    const matchesSearch = template.title.toLowerCase().includes(filterText.toLowerCase());
    
    return matchesAuth && matchesSearch;
  });

  // Select All Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredTemplates.map(t => t._id));
      setSelectedTemplates(allIds);
    } else {
      setSelectedTemplates(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedTemplates);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTemplates(newSet);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-gray-600 rounded-full"></div>
      </div>
    );
  }

  const allSelected = filteredTemplates.length > 0 && selectedTemplates.size === filteredTemplates.length;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-gray-300 font-sans">
      {/* Sidebar - Adapted for Dark Mode */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 gap-8 bg-[#1f1f1f] border-r border-[#3e3e3e] z-50">
        <div className="mb-4">
             <div className="w-8 h-8 bg-white rounded-lg transform rotate-45 flex items-center justify-center cursor-pointer" onClick={() => router.push('/user/creator')}>
                 <div className="w-3 h-3 bg-black rounded-full transform -rotate-45"></div>
             </div>
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
           <NavItem icon={<LayoutGrid size={20} />} onClick={() => router.push('/user/creator')} />
           <NavItem icon={<Mail size={20} />} onClick={() => router.push('/messages')} />
           <NavItem icon={<CheckSquare size={20} />} onClick={() => router.push('/tasks')} />
           <NavItem icon={<Send size={20} />} onClick={() => router.push('/user/creator/chat')} />
           <NavItem icon={<Clock size={20} />} onClick={() => router.push('/history')} />
           <NavItem icon={<FileText size={20} />} onClick={() => router.push('/user/creator/posts')} />
           <NavItem icon={<Briefcase size={20} />} onClick={() => router.push('/user/creator/project-posts')} />
           <NavItem icon={<LayoutGrid size={20} />} active onClick={() => {}} />
           <NavItem icon={<BookOpen size={20} />} onClick={() => router.push('/user/creator/blogs')} />
           <NavItem icon={<Settings size={20} />} onClick={() => {}} />
        </nav>
        <div className="mt-auto">
             <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-[#3e3e3e] overflow-hidden cursor-pointer">
                 <img src="https://ui-avatars.com/api/?name=User" alt="User" />
             </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 p-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Templates</h1>
                <p className="text-gray-400">Manage your templates and analytics</p>
            </div>
            {selectedTemplates.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                    <Trash2 size={18} />
                    Delete Selected ({selectedTemplates.size})
                </button>
            )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-[#282828] p-4 rounded-xl border border-[#3e3e3e]">
            {/* Tabs */}
            <div className="flex bg-[#1f1f1f] p-1 rounded-lg border border-[#3e3e3e]">
                {['all', 'published', 'draft'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                            activeTab === tab 
                            ? 'bg-[#3ea6ff] text-[#0f0f0f] shadow-md' 
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {tab}s
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search templates..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full bg-[#1f1f1f] text-gray-200 pl-10 pr-4 py-2 rounded-lg border border-[#3e3e3e] focus:outline-none focus:border-[#3ea6ff] text-sm"
                />
            </div>
        </div>

        {/* Table */}
        <div className="bg-[#282828] rounded-xl border border-[#3e3e3e] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1f1f1f] text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-[#3e3e3e]">
                  <tr>
                    <th className="p-4 w-12 text-center">
                       <input 
                          type="checkbox" 
                          checked={allSelected}
                          onChange={handleSelectAll}
                          className="rounded border-gray-600 bg-[#282828] text-[#3ea6ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                       />
                    </th>
                    <th className="p-4 w-[40%]">Template</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Stats</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e3e3e]">
                  {filteredTemplates.length === 0 ? (
                      <tr>
                          <td colSpan="6" className="p-12 text-center text-gray-500">
                              <div className="flex flex-col items-center gap-3">
                                  <LayoutGrid size={48} className="opacity-20" />
                                  <p className="text-lg">No templates found</p>
                              </div>
                          </td>
                      </tr>
                  ) : (
                      filteredTemplates.map((template) => (
                        <tr 
                          key={template._id} 
                          className={`group transition-all hover:bg-[#323232] ${selectedTemplates.has(template._id) ? 'bg-[#323232]/50' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 text-center">
                             <input 
                                type="checkbox" 
                                checked={selectedTemplates.has(template._id)}
                                onChange={() => handleSelectRow(template._id)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-gray-600 bg-[#282828] text-[#3ea6ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                             />
                          </td>

                          {/* Template Info */}
                          <td className="p-4">
                            <div className="flex gap-4">
                              <div 
                                className="w-24 h-16 bg-[#121212] rounded-md overflow-hidden flex-shrink-0 cursor-pointer border border-[#3e3e3e] group-hover:border-[#555]"
                                onClick={() => router.push(`/template/${template._id}`)}
                              >
                                {template.previewFile ? (
                                  <img src={template.previewFile} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-700 bg-[#1a1a1a]">
                                     <LayoutGrid size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col justify-center min-w-0">
                                <h3 
                                    className="text-sm font-semibold text-gray-200 truncate cursor-pointer hover:text-[#3ea6ff] transition-colors mb-1"
                                    onClick={() => router.push(`/template/${template._id}`)}
                                >
                                    {template.title || "Untitled Template"}
                                </h3>
                                <div className="text-xs text-gray-500 truncate max-w-[250px]">
                                    {template.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            {template.status === "approved" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                    <Globe size={12} /> Approved
                                </span>
                            ) : template.status === "rejected" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    <Lock size={12} /> Rejected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    <Clock size={12} /> Pending
                                </span>
                            )}
                          </td>

                          {/* Stats */}
                          <td className="p-4">
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <div className="flex items-center gap-1.5" title="Views">
                                      <Eye size={14} className="text-[#3ea6ff]" />
                                      <span>{template.viewsCount || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" title="Likes">
                                      <ThumbsUp size={14} className="text-[#00C49F]" />
                                      <span>{template.likeCount || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" title="Downloads">
                                      <MessageSquare size={14} className="text-[#FFBB28]" />
                                      <span>{template.downloadsCount || 0}</span>
                                  </div>
                              </div>
                          </td>

                          {/* Date */}
                          <td className="p-4 text-sm text-gray-400">
                             <div className="flex flex-col">
                                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                                <span className="text-[10px] text-gray-600">
                                    {new Date(template.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setAnalyticsTemplate(template);
                                        setIsAnalyticsOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#3ea6ff] rounded-lg transition-all"
                                    title="Analytics"
                                >
                                    <BarChart2 size={16} />
                                </button>
                                <button 
                                    onClick={() => router.push(`/template/${template._id}`)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-green-500 rounded-lg transition-all"
                                    title="Edit"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(template._id)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer / Pagination */}
            <div className="px-6 py-4 bg-[#1f1f1f] border-t border-[#3e3e3e] flex justify-between items-center text-xs text-gray-500">
               <div>
                   {selectedTemplates.size > 0 ? (
                       <span className="text-[#3ea6ff]">{selectedTemplates.size} selected</span>
                   ) : (
                       <span>Total: {filteredTemplates.length} templates</span>
                   )}
               </div>
               <div className="flex gap-4">
                   <span>Page 1 of 1</span> 
                   {/* Add real pagination if needed later */}
               </div>
            </div>
        </div>
      </main>

      <TemplateAnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
        templateId={analyticsTemplate?._id} 
        title={analyticsTemplate?.title} 
      />
    </div>
  );
}

function NavItem({ icon, active, onClick }) {
  return (
      <div 
          onClick={onClick}
          className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${active ? 'bg-[#3ea6ff] text-black shadow-lg' : 'text-gray-400 hover:bg-[#282828] hover:text-gray-200'}`}
      >
          {icon}
      </div>
  )
}
