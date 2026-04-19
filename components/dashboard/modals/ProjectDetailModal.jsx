"use client";
import React, { useEffect } from 'react';
import { X, Calendar, MapPin, BarChart2, ExternalLink, Github, FileText, Download, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const ProjectDetailModal = ({ post, onClose }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = '';
    };
  }, []);

  if (!post) return null;
  const { user, content, images, projectStats, createdAt } = post;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-[#0F0F12] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-white/10">
        
        {/* Header / Close */}
        <div className="absolute top-4 right-4 z-10">
            <button 
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Hero Section */}
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                {images && images.length > 0 && (
                    <Image 
                        src={images[0]} 
                        fill 
                        className="object-cover opacity-60 mix-blend-overlay"
                        alt="Project Cover"
                    />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-12 h-12">
                            {user?.avatar ? (
                                <Image src={user.avatar} fill className="rounded-full border-2 border-white/20" alt={user.name} />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg">
                                    {user?.name?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user?.name}'s Project</h2>
                            <p className="text-gray-300 text-sm">{new Date(createdAt).toDateString()} • {projectStats?.category || 'Development'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 sm:p-10">
                
                {/* Left Column: The Story (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            About the Project
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {content}
                        </div>
                    </section>

                    {/* Milestones / Timeline (If any exists, currently manual but prepared for future) */}
                    {projectStats?.startDate && (
                        <section className="pt-8 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Timeline
                            </h3>
                            <div className="relative pl-8 border-l-2 border-indigo-100 dark:border-indigo-500/20 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-indigo-500 border-4 border-white dark:border-[#0F0F12]" />
                                    <div className="mb-1 text-sm font-bold text-indigo-500">{new Date(projectStats.startDate).toDateString()}</div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Project Started</h4>
                                    <p className="text-gray-500 text-sm mt-1">Initial commit and planning phase.</p>
                                </div>
                                {/* Placeholder for 'Now' */}
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-[#0F0F12]" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Present</h4>
                                    <p className="text-gray-500 text-sm mt-1">Currently in active development.</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: Spec Sheet & Resources (1/3) */}
                <div className="space-y-6">
                    
                    {/* Live Demo Card */}
                    {projectStats?.livePreviewUrl && (
                        <div className="p-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg transform hover:scale-[1.02] transition-transform">
                            <h3 className="font-bold text-lg mb-2">Live Demo Available</h3>
                            <p className="text-white/80 text-sm mb-4">Check out the live version of this project.</p>
                            <a 
                                href={projectStats.livePreviewUrl} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-white text-purple-600 text-center rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Launch Demo 🚀
                            </a>
                        </div>
                    )}

                    {/* Spec Key-Values */}
                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Project Specs</h4>
                        
                        {projectStats?.tools && projectStats.tools.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500 mb-2">Tech Stack</div>
                                <div className="flex flex-wrap gap-2">
                                    {projectStats.tools.map((tool, i) => (
                                        <span key={i} className="px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {projectStats?.timeSpent && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
                                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Time Spent</span>
                                <span className="font-medium text-gray-900 dark:text-white">{projectStats.timeSpent}</span>
                            </div>
                        )}
                        
                        {projectStats?.difficulty && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
                                <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Difficulty</span>
                                <span className="font-medium text-gray-900 dark:text-white">{projectStats.difficulty}</span>
                            </div>
                        )}
                        
                        {projectStats?.location && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</span>
                                <span className="font-medium text-gray-900 dark:text-white">{projectStats.location}</span>
                            </div>
                        )}

                        {projectStats?.projectLink && (
                             <a 
                                href={projectStats.projectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                             >
                                <Github className="w-4 h-4" /> View Source Code
                             </a>
                        )}
                    </div>

                    {/* Resources List */}
                    {projectStats?.resources && projectStats.resources.length > 0 && (
                        <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4">Resources</h4>
                            <div className="space-y-3">
                                {projectStats.resources.map((res, i) => (
                                     <a 
                                        key={i} 
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl hover:border-indigo-500 transition-colors group/res"
                                     >
                                         <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600">
                                             <FileText className="w-4 h-4" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{res.title}</div>
                                             <div className="text-xs text-gray-500 truncate">{res.url}</div>
                                         </div>
                                         <Download className="w-4 h-4 text-gray-400 group-hover/res:text-indigo-500" />
                                     </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
