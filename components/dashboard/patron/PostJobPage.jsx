"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { useRouter } from "next/navigation";
import { MapPin, Award, ArrowRight, X, Code, Palette, Megaphone, FileText, Headset, Database, Shield, PieChart, PenTool, Layers, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "../../ui/CustomSelect";

const PREDEFINED_SKILLS = [
  "React", "Node.js", "Next.js", "Tailwind CSS", "MongoDB", "Express", 
  "TypeScript", "JavaScript", "Python", "Django", "GraphQL", "Figma", 
  "UI/UX Design", "Docker", "AWS", "Firebase", "PostgreSQL", "Vue.js", "Angular",
  "HTML", "CSS", "Sass", "Java", "C++", "C#", "PHP", "Laravel", "Ruby on Rails",
  "React Native", "Flutter", "Swift", "Kotlin", "Go", "Rust", "SQL", "NoSQL"
];

const JOB_CATEGORIES = [
  { id: "Development", label: "Development", icon: Code },
  { id: "Design", label: "Design & Creative", icon: Palette },
  { id: "Marketing", label: "Marketing", icon: Megaphone },
  { id: "Writing", label: "Writing & Content", icon: FileText },
  { id: "Support", label: "Customer Support", icon: Headset },
  { id: "Data", label: "Data & AI", icon: Database },
  { id: "Admin", label: "Administrative", icon: Shield },
  { id: "Finance", label: "Finance", icon: PieChart },
  { id: "Engineering", label: "Engineering", icon: PenTool },
  { id: "Other", label: "Other", icon: Layers }
];



export default function PostJobPage({ editId }) {
  const { user } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Development",
    customCategory: "",
    budgetMin: "",
    budgetMax: "",
    budgetType: "fixed",
    budgetMode: "fixed", // 'fixed' or 'range'
    level: "Intermediate",
    location: "Remote",
    skills: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchJobToEdit();
    }
  }, [editId]);

  const fetchJobToEdit = async () => {
    try {
      const res = await api.get(`/jobs/${editId}`);
      if (res.success && res.data) {
        const job = res.data;
        setFormData({
          title: job.title || "",
          description: job.description || "",
          category: job.category || "Development",
          customCategory: "",
          budgetMin: job.budget?.min?.toString() || "",
          budgetMax: job.budget?.max?.toString() || "",
          budgetType: job.budget?.type || "fixed",
          budgetMode: job.budget?.min === job.budget?.max ? "fixed" : "range",
          level: job.level || "Intermediate",
          location: job.location || "Remote",
          skills: job.skills || []
        });
      }
    } catch (err) {
      showToast("Failed to load job for editing", "error");
    }
  };

  const handleSkillSelect = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setSkillSearch("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const filteredSkills = PREDEFINED_SKILLS.filter(s => 
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !formData.skills.includes(s)
  );

  // Strict RBAC: Only patrons and admins can post jobs
  if (user && user.role !== "patron" && user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-slate-500">Only patrons can post jobs. Please update your account settings.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category === "Other" ? formData.customCategory : formData.category,
        budget: {
          min: Number(formData.budgetMin),
          max: formData.budgetMode === "fixed" ? Number(formData.budgetMin) : Number(formData.budgetMax),
          type: formData.budgetType,
          currency: "TKNS"
        },
        level: formData.level,
        location: formData.location,
        skills: formData.skills
      };

      // 🔒 SECURITY GATE: Token-Gated Validation
      const requiredTokens = payload.budget.max;
      const userBalance = user?.walletBalance || 0;

      if (requiredTokens > userBalance) {
        showToast(`Insufficient wallet balance. You need ${requiredTokens} TKNS, but only have ${userBalance.toFixed(2)}.`, "error", "Insufficient Funds");
        setIsSubmitting(false);
        return;
      }

      // Existing Frontend Validation
      if (payload.budget.min > 5000 || payload.budget.max > 5000) {
        showToast("Maximum budget limit exceeded (5,000 Tokens)", "error", "Limit Exceeded");
        setIsSubmitting(false);
        return;
      }

      if (editId) {
        const res = await api.put(`/jobs/${editId}`, payload);
        if (res.success) {
          showToast("Job updated successfully!", "success");
          router.push(`/manage-jobs/${editId}`);
        } else {
          showToast(res.message || "Failed to update job", "error");
        }
      } else {
        const res = await api.post("/jobs", payload);
        if (res.success || res.status === 201) {
          showToast("Job posted successfully!", "success");
          router.push("/manage-jobs");
        } else {
          showToast(res.message || "Failed to post job", "error");
        }
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="w-full max-w-7xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {editId ? "Edit Job Posting" : "Post a New Job"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Area */}
          <div className="w-full space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full" />
                      Devlog Essentials
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Job Title</label>
                        <span className={`text-[10px] font-bold ${formData.title.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>{formData.title.length}/100</span>
                      </div>
                      <input 
                        type="text" name="title" required value={formData.title} 
                        maxLength={100}
                        onChange={handleChange}
                        placeholder="e.g. Senior React Developer..."
                        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Detailed Scope</label>
                        <span className={`text-[10px] font-bold ${formData.description.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>{formData.description.length}/2000</span>
                      </div>
                      <textarea 
                        name="description" required value={formData.description} 
                        maxLength={2000}
                        onChange={handleChange}
                        placeholder="Describe the responsibilities..."
                        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white transition-all text-sm font-medium min-h-[160px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full" />
                      Logistics
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <CustomSelect 
                        label="Experience Level"
                        value={formData.level}
                        icon={Award}
                        options={[
                          { value: "Entry", label: "Entry Level" },
                          { value: "Intermediate", label: "Intermediate" },
                          { value: "Expert", label: "Expert" }
                        ]}
                        onChange={(val) => setFormData({ ...formData, level: val })}
                      />
                      <CustomSelect 
                        label="Location"
                        value={formData.location}
                        icon={MapPin}
                        options={[
                          { value: "Remote", label: "Remote" },
                          { value: "On-site", label: "On-site" },
                          { value: "Hybrid", label: "Hybrid" }
                        ]}
                        onChange={(val) => setFormData({ ...formData, location: val })}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Category & Skills */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full" />
                      Category & Expertise
                    </h3>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Field of Work</label>
                      <div className="grid grid-cols-2 gap-3">
                        {JOB_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              formData.category === cat.id
                                ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg"
                                : "border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                            }`}
                          >
                            <cat.icon size={16} className="mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>

                      {formData.category === "Other" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <input 
                            type="text" name="customCategory" required maxLength={30}
                            value={formData.customCategory} onChange={handleChange}
                            placeholder="Specify category..."
                            className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white transition-all text-xs font-medium mt-2"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Required Skills</label>
                      <div className="relative">
                        <input 
                          type="text" value={skillSearch}
                          onChange={(e) => {
                            setSkillSearch(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && skillSearch.trim()) {
                              e.preventDefault();
                              handleSkillSelect(skillSearch.trim());
                            }
                          }}
                          placeholder="Search or press Enter..."
                          className="w-full px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-slate-900 dark:focus:border-white transition-all text-sm font-medium"
                        />
                        
                        <AnimatePresence>
                          {showSuggestions && skillSearch && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-10 w-full mt-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                              {filteredSkills.map(skill => (
                                <button key={skill} type="button" onClick={() => handleSkillSelect(skill)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
                                  {skill}
                                </button>
                              ))}
                              {!PREDEFINED_SKILLS.some(s => s.toLowerCase() === skillSearch.toLowerCase()) && (
                                <button type="button" onClick={() => handleSkillSelect(skillSearch)} className="w-full px-4 py-2 text-left text-sm font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-white/5">
                                  Add "{skillSearch}"
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.skills.map(skill => (
                          <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full uppercase tracking-wider transition-all">
                            {skill}
                            <X size={10} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Budget */}
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <div className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full" />
                  Reward Strategy
                </h3>
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Reward Type</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, budgetType: "fixed" })} className={`text-xs font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${formData.budgetType === "fixed" ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200"}`}>Fixed Price</button>
                        <button type="button" onClick={() => setFormData({ ...formData, budgetType: "hourly" })} className={`text-xs font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${formData.budgetType === "hourly" ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200"}`}>Hourly</button>
                      </div>
                    </div>
                    <div className="space-y-3 md:text-right">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Budget Structure</label>
                      <div className="flex items-center gap-3 justify-start md:justify-end">
                        <button type="button" onClick={() => setFormData({ ...formData, budgetMode: "fixed" })} className={`text-xs font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${formData.budgetMode === "fixed" ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200"}`}>Exact Amount</button>
                        <button type="button" onClick={() => setFormData({ ...formData, budgetMode: "range" })} className={`text-xs font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${formData.budgetMode === "range" ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200"}`}>Range</button>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-2xl">
                    <div className={`grid gap-6 ${formData.budgetMode === "range" ? "grid-cols-2" : "grid-cols-1"}`}>
                      <div className="group relative">
                        <input 
                          type="number" name="budgetMin" required value={formData.budgetMin} 
                          onChange={handleChange} 
                          placeholder={formData.budgetMode === "fixed" ? "0.00" : "Minimum"} 
                          className={`w-full pl-5 pr-16 py-4 bg-slate-50/50 dark:bg-white/[0.02] border rounded-2xl outline-none transition-all text-lg font-medium ${
                            (Number(formData.budgetMin) > (user?.walletBalance || 0)) 
                            ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] text-red-600" 
                            : "border-slate-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white"
                          }`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">TKNS</div>
                        {Number(formData.budgetMin) > (user?.walletBalance || 0) && (
                          <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full shadow-sm animate-pulse">
                            -{ (Number(formData.budgetMin) - (user?.walletBalance || 0)).toFixed(1) }
                          </span>
                        )}
                      </div>
                      {formData.budgetMode === "range" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="group relative">
                          <input 
                            type="number" name="budgetMax" required value={formData.budgetMax} 
                            onChange={handleChange} 
                            placeholder="Maximum" 
                            className={`w-full pl-5 pr-16 py-4 bg-slate-50/50 dark:bg-white/[0.02] border rounded-2xl outline-none transition-all text-lg font-medium ${
                              (Number(formData.budgetMax) > (user?.walletBalance || 0)) 
                              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] text-red-600" 
                              : "border-slate-200 dark:border-white/10 focus:border-slate-900 dark:focus:border-white"
                            }`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">TKNS</div>
                          {Number(formData.budgetMax) > (user?.walletBalance || 0) && (
                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full shadow-sm animate-pulse">
                              -{ (Number(formData.budgetMax) - (user?.walletBalance || 0)).toFixed(1) }
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Validation Feedback */}
                    <AnimatePresence>
                      {(Number(formData.budgetMin) > (user?.walletBalance || 0) || Number(formData.budgetMax) > (user?.walletBalance || 0)) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-3 flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-[0.1em] bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-500/20"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Insufficient wallet balance to publish. Current: {user?.walletBalance?.toFixed(2)} TKNS
                        </motion.div>
                      )}
                      {(Number(formData.budgetMin) > 5000 || Number(formData.budgetMax) > 5000) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-2 flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-[0.1em]"
                        >
                          Maximum devlog budget is 5,000 Tokens.
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!((Number(formData.budgetMin) > (user?.walletBalance || 0) || Number(formData.budgetMax) > (user?.walletBalance || 0))) && (
                       <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                          Your current balance: {user?.walletBalance?.toFixed(2)} TKNS
                       </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="mt-12 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || (Number(formData.budgetMode === 'fixed' ? formData.budgetMin : formData.budgetMax) > (user?.walletBalance || 0))}
                  className="group flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                  {isSubmitting ? "Launching..." : (editId ? "Save Changes" : "Launch Devlog")}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

