import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState } from "react";
import { X, Calendar, Clock, Video } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function MentorshipBookingModal({ isOpen, onClose, mentor }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduledDate: "",
    topic: "",
    notes: "",
  });

  if (!isOpen || !mentor) return null;

  const costTokens = mentor.mentorshipRate || 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheduledDate || !formData.topic) {
      showToast("Please provide a date and topic.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/mentorship/book", {
        mentorId: mentor._id,
        scheduledDate: formData.scheduledDate,
        topic: formData.topic,
        notes: formData.notes
      });

      if (res.success) {
        showToast("Mentorship session booked! Tokens are held in escrow.", "success");
        onClose();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to book session. Check your TKNS balance.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 border border-slate-300 dark:border-white/20">
               {mentor.profilePicture ? <img src={getOptimizedUrl(mentor.profilePicture)} className="w-full h-full object-cover" /> : null}
             </div>
             <div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Book {mentor.name}</h3>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">1-on-1 Mentorship</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
              <div className="flex items-center gap-2">
                 <Video size={18} className="text-indigo-600" />
                 <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">60 Min Video Call</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <span className="text-lg font-black text-indigo-600">{costTokens}</span>
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">TKNS</span>
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <Calendar size={14} /> Desired Date & Time
              </label>
              <input 
                type="datetime-local" 
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Primary Topic</label>
              <input 
                type="text" 
                required
                placeholder="e.g. System Design, Code Review"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Additional Notes (Optional)</label>
              <textarea 
                placeholder="What exactly do you need help with?"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[80px] resize-none"
              />
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full mt-4 py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black font-bold rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
           >
             {loading ? <AppleSpinner className="animate-spin" size={18} /> : null}
             {loading ? "Processing..." : "Confirm & Pay TKNS"}
           </button>
        </form>
      </div>
    </div>
  );
}
