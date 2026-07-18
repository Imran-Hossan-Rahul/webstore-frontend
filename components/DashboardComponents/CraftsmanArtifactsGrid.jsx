"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Edit, Trash2, BarChart2, Eye, Download, Heart, Zap, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";

export default function EngineerArtifactsGrid() {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const res = await api.get("/artifact/my-artifacts");
      setArtifacts(res.data || []);
    } catch (error) {
      console.error("Error fetching artifacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this artifact? This action cannot be undone.")) {
        try {
            // await api.delete(`/artifact/${id}`);
            // setArtifacts(prev => prev.filter(t => t._id !== id));
            showToast("Delete functionality is currently in development.", "info", "Feature Coming Soon");
        } catch(err) {
            console.error("Delete failed", err.message);
            showToast(err.message || "Delete operation failed", "error");
        }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-[26px] aspect-[4/3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (artifacts.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart2 className="text-slate-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No artifacts yet</h3>
              <p className="text-slate-500 mb-6">Start monetizing your skills by uploading your first artifact.</p>
              <button 
                onClick={() => router.push('/upload')}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  Create Artifact
              </button>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 pb-20">
      {artifacts.map((artifact) => (
        <EngineerArtifactCard 
            key={artifact._id} 
            artifact={artifact} 
            router={router}
            onDelete={() => handleDelete(artifact._id)}
        />
      ))}
    </div>
  );
}

function EngineerArtifactCard({ artifact, router, onDelete }) {
    // Mock status for now, or use real if available
    const status = artifact.status || "active"; // active, pending, rejected
    const revenue = ((artifact.downloadsCount || 0) * (artifact.price || 0)).toFixed(2);

    return (
        <div className="group bg-white rounded-[26px] p-4 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-[18px] overflow-hidden bg-slate-100 mb-4 cursor-pointer" onClick={() => router.push(`/artifacts/${artifact._id}`)}>
                 {artifact.thumbnailSource ? (
                    <img src={getOptimizedUrl(artifact.thumbnailSource)} alt={artifact.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Image size={40} />
                    </div>
                 )}

                 {/* Status Badge */}
                 <div className="absolute top-3 left-3">
                     <StatusBadge status={status} />
                 </div>

                 {/* Price Badge */}
                 <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10">
                     {artifact.priceType === 'paid' ? `${artifact.price} TKNS` : 'Free'}
                 </div>
                 
                 {/* Hover Actions */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                     <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/artifact/edit/${artifact._id}`); }}
                        className="p-3 bg-white rounded-full hover:bg-slate-50 text-slate-900 shadow-lg transform hover:scale-110 transition-all" title="Edit"
                     >
                         <Edit size={18} />
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); /* Open analytics modal */ }}
                        className="p-3 bg-white rounded-full hover:bg-slate-50 text-blue-600 shadow-lg transform hover:scale-110 transition-all" title="Analytics"
                     >
                         <BarChart2 size={18} />
                     </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-3 bg-white rounded-full hover:bg-slate-50 text-red-600 shadow-lg transform hover:scale-110 transition-all" title="Delete"
                     >
                         <Trash2 size={18} />
                     </button>
                 </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => router.push(`/artifacts/${artifact._id}`)}>
                        {artifact.title}
                    </h3>
                </div>

                {/* detailed Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto bg-slate-50 rounded-xl p-3">
                     <div className="flex flex-col">
                         <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Revenue</span>
                         <span className="text-slate-900 font-bold text-base flex items-center gap-1">
                             {revenue} <span className="text-purple-600 text-[10px]">TKNS</span>
                        </span>
                     </div>
                     <div className="flex flex-col border-l border-slate-200 pl-3">
                          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Downloads</span>
                          <span className="text-slate-900 font-bold text-base">{artifact.downloadsCount || 0}</span>
                     </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
                            <Eye size={14} /> {artifact.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart size={14} /> {artifact.likeCount || 0}
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {new Date(artifact.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const config = {
        active: { color: 'bg-green-500', icon: CheckCircle, text: 'Live' },
        pending: { color: 'bg-yellow-500', icon: Clock, text: 'Review' },
        rejected: { color: 'bg-red-500', icon: AlertCircle, text: 'Rejected' },
    };

    const current = config[status] || config.active;
    const Icon = current.icon;

    return (
        <div className={`${current.color} text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm`}>
            <Icon size={10} strokeWidth={3} />
            {current.text}
        </div>
    )
}

