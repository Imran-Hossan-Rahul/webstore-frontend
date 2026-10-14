"use client";
import React, { useEffect, useState } from 'react';
import { User, Sparkles, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import CreatorProfileModal from '../modals/CreatorProfileModal';

const ProjectRightSidebar = ({ author, category, currentPostId }) => {
  const router = useRouter();
  const [moreFromAuthor, setMoreFromAuthor] = useState([]);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        // Fetch more from author (blogs)
        if (author && author._id) {
          try {
             // Will modify backend to accept author param. For now, fetch all and filter or wait for backend fix.
             const authorRes = await api.get(`/blog?author=${author._id}&limit=5`);
             if (authorRes && authorRes.blogs) {
                 const filtered = authorRes.blogs.filter(b => b._id !== currentPostId).slice(0, 3);
                 setMoreFromAuthor(filtered);
             }
          } catch(e) { console.error(e); }
        }

        // Fetch similar (based on category or just recent feed)
        try {
           const similarRes = await api.get(`/blog?limit=5`); 
           if (similarRes && similarRes.blogs) {
               // Filter out current and author's ones to show variety
               const filtered = similarRes.blogs.filter(b => b._id !== currentPostId && b.author?._id !== author?._id).slice(0, 3);
               setSimilarProjects(filtered);
           }
        } catch(e) { console.error(e); }

      } catch (err) {
         console.error("Sidebar fetch error", err);
      } finally {
         setLoading(false);
      }
    };

    fetchSidebarData();
  }, [author, currentPostId]);

  const authorImage = author?.profilePicture || author?.avatar;
  const authorUsername = author?.username || (author?.email ? author.email.split('@')[0] : 'user');

  return (
    <div className="space-y-6">
      {/* 1. Author Profile Snippet */}
      {author && (
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Creator</h3>
            <div className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsCreatorModalOpen(true)}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden">
                     {authorImage ? (
                         <Image src={authorImage} width={48} height={48} className="object-cover w-full h-full" alt={author.name || 'Author'} />
                     ) : (
                         <User size={20} className="text-emerald-500" />
                     )}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{author.name}</h4>
                    <p className="text-xs text-gray-500">@{authorUsername}</p>
                </div>
            </div>
            <button 
                onClick={() => setIsCreatorModalOpen(true)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"
            >
                Visit Profile
            </button>
        </div>
      )}

      {/* 2. More from Author */}
      {moreFromAuthor.length > 0 && (
          <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">More by Creator</h3>
                  <ArrowRight size={14} className="text-gray-400 cursor-pointer hover:text-white" />
              </div>
              <div className="space-y-3">
                  {moreFromAuthor.map(p => (
                      <div key={p._id || p.slug} onClick={() => router.push(`/blogs/${p.slug}`)} className="group flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <Sparkles size={12} className="text-gray-400 group-hover:text-emerald-500" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors line-clamp-2">
                                  {p.title}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 3. Similar Projects */}
      {similarProjects.length > 0 && (
          <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">You might also like</h3>
              <div className="space-y-4">
                   {similarProjects.map(p => {
                       const authorName = p.author?.name || 'Anonymous';
                       return (
                          <div key={p._id || p.slug} onClick={() => router.push(`/blogs/${p.slug}`)} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{p.title}</h4>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>by {authorName}</span>
                                  <div className="flex items-center gap-1">
                                      <Star size={10} className="fill-current text-yellow-500" />
                                      {p.likesCount || 0}
                                  </div>
                              </div>
                          </div>
                       )
                   })}
              </div>
          </div>
      )}

      {/* Profile Modal */}
      <CreatorProfileModal 
          isOpen={isCreatorModalOpen} 
          onClose={() => setIsCreatorModalOpen(false)} 
          userId={author?._id} 
      />
    </div>
  );
};

export default ProjectRightSidebar;
