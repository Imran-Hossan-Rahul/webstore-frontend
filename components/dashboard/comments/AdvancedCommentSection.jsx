"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { api } from "@/utils/api";
import { MessageCircle, Send, CornerDownRight, MoreHorizontal, AlertCircle, Lightbulb, Flame, HelpCircle, Check, X, UserCheck, CheckCircle, Eye, Search, Filter, AlignLeft, Star } from "lucide-react";
import CustomSelect from '../../ui/CustomSelect';

import { useSearchParams } from 'next/navigation';

import AppleSpinner from "@/components/ui/AppleSpinner";

const FEEDBACK_TYPES = [
    { id: 'comment', label: 'Discussion', icon: MessageCircle, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/10' },
    { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-brand-blue dark:text-blue-400', bg: 'bg-brand-sky dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30' },
    { id: 'answer', label: 'Answer', icon: CheckCircle, color: 'text-brand-teal dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30' },
    { id: 'issue', label: 'Issue', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/30' },
    { id: 'suggestion', label: 'Idea', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/30' },
    { id: 'critique', label: 'Critique', icon: Eye, color: 'text-brand-blue dark:text-indigo-400', bg: 'bg-brand-sky dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30' },
    { id: 'kudos', label: 'Kudos', icon: Flame, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/30 border border-pink-100/50 dark:border-pink-900/30' },
];

const CommentNode = ({ comment, depth = 0, onReply, isReplyingToThis, onSubmitReply, onCancelReply, postAuthorId, isLast, searchQuery, onToggleHelpful }) => {
    const isRoot = depth === 0;
    const typeConfig = FEEDBACK_TYPES.find(t => t.id === comment.feedbackType) || FEEDBACK_TYPES[0];
    const Icon = typeConfig.icon;
    const isCraftsman = postAuthorId && comment.user?._id === postAuthorId;
    const userAvatar = comment.user?.profilePicture || comment.user?.avatar || comment.user?.profilePic;

    // Time Ago
    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        return Math.floor(seconds / 60) + "m";
    };

    // Rich Text Parser (Simple) with Highlighting
    const renderRichText = (text) => {
        if (!text) return null;
        
        let content = text;
        
        // Helper to wrap highlighting
        const highlightText = (str) => {
            if (!searchQuery) return str;
            const parts = str.split(new RegExp(`(${searchQuery})`, 'gi'));
            return parts.map((part, i) => 
                part.toLowerCase() === searchQuery.toLowerCase() 
                ? <mark key={i} className="bg-yellow-200 dark:bg-brand-amber/30 text-slate-900 dark:text-white rounded-sm px-0.5">{part}</mark> 
                : part
            );
        };

        const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-pink-500">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                // Highlight inside bold too
                return <strong key={i} className="font-bold text-slate-900 dark:text-white">{highlightText(part.slice(2, -2))}</strong>;
            }
            return <span key={i}>{highlightText(part)}</span>;
        });
    };

    const hasChildren = comment.children && comment.children.length > 0;

    return (
        <div className="relative"> 
            {/* Note: Margins are handled by the wrapper in renderTree now */}

            {/* INCOMING CONNECTOR (Curved L-shape) for Replies */}
            {!isRoot && (
                // Box creating the curve:
                // Starts at left -24px (Rail position)
                // Starts at top -8px (To connect with Sibling Rail/Previous Node)
                // Radius arc to center (20px top)
                // Height = 20px (target center) - (-8px start) = 28px
                <div className="absolute left-[-24px] top-[-8px] w-[24px] h-[28px] border-l-[2px] border-b-[2px] border-slate-200 dark:border-white/10 rounded-bl-xl pointer-events-none"></div>
            )}

            {/* OUTGOING TAIL (Vertical Line from Avatar Bottom to start of children) */}
            {hasChildren && (
                 <div className={`absolute border-l-[2px] border-slate-200 dark:border-white/10 w-[2px] pointer-events-none ${
                     isRoot 
                     ? 'left-[32px] top-[48px] bottom-[-24px]' // Root: Center 32px. Top 48px (Avatar bottom). Extends down to meet children.
                     : 'left-[12px] top-[32px] bottom-[-8px]'  // Nested: Center 12px. Top 32px (Avatar bottom). Extends down.
                 }`}></div>
            )}

            <div className={`group relative transition-all ${
                isRoot 
                ? `bg-white dark:bg-[#111] p-4 rounded-2xl border ${
                    comment.isHelpful ? 'border-amber-400/40 bg-amber-50/20 dark:bg-brand-amber/5 ring-1 ring-amber-400/20' :
                    comment.feedbackType === 'issue' ? 'border-rose-500/20 dark:border-rose-500/10 bg-rose-50/5 dark:bg-rose-950/5' : 
                    comment.feedbackType === 'suggestion' ? 'border-amber-500/20 dark:border-amber-500/10 bg-amber-50/5 dark:bg-amber-950/5' : 
                    comment.feedbackType === 'answer' ? 'border-brand-teal/20 dark:border-brand-teal/10 bg-emerald-50/5 dark:bg-emerald-950/5' :
                    comment.feedbackType === 'critique' ? 'border-brand-blue/20 dark:border-brand-blue/10 bg-brand-sky/5 dark:bg-indigo-950/5' :
                    comment.feedbackType === 'kudos' ? 'border-pink-500/20 dark:border-pink-500/10 bg-pink-50/5 dark:bg-pink-950/5' :
                    'border-slate-200 dark:border-white/5'
                  } z-10`
                : `pl-0 py-2 hover:bg-brand-cloud/50 dark:hover:bg-white/5 rounded-xl ml-0` 
            }`}>
                <div className="flex justify-between items-start gap-3">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0 relative z-10">
                        <div className={`${isRoot ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm mx-auto`}>
                            {userAvatar ? (
                                <Image src={userAvatar} width={32} height={32} className="object-cover w-full h-full" alt="av" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{comment.user?.name?.[0]}</div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={`font-bold ${isRoot ? 'text-sm' : 'text-xs'} text-slate-900 dark:text-white`}>{comment.user?.name}</span>
                            
                            {isCraftsman && (
                                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center gap-1">
                                    <UserCheck size={10} /> OWNER
                                </span>
                            )}

                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${typeConfig.bg} ${typeConfig.color}`}>
                                <Icon size={10} /> {typeConfig.label}
                            </span>
                            
                            {comment.isHelpful && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-amber-100 dark:bg-brand-amber/10 text-amber-600 dark:text-amber-400">
                                    <Star size={10} className="fill-current" /> Helpful
                                </span>
                            )}
                            
                            <span suppressHydrationWarning className="text-slate-400 text-[10px] font-mono font-medium uppercase tracking-tight">{timeAgo(comment.createdAt)}</span>
                        </div>
                        
                        <div className={`${isRoot ? 'text-sm' : 'text-xs text-brand-slate dark:text-slate-300'} leading-relaxed whitespace-pre-wrap break-words`}>
                            {renderRichText(comment.content)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => onReply(comment._id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
                             >
                                 Reply
                             </button>
                             
                             {/* Mark as Helpful - Only visible to post owner */}
                             {isCraftsman && (
                                <button 
                                    onClick={() => onToggleHelpful && onToggleHelpful(comment._id, !comment.isHelpful)}
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                        comment.isHelpful 
                                        ? 'text-brand-amber hover:text-amber-600' 
                                        : 'text-slate-400 hover:text-brand-amber'
                                    }`}
                                >
                                    <Star size={10} className={comment.isHelpful ? 'fill-current' : ''} />
                                    {comment.isHelpful ? 'Helpful' : 'Mark Helpful'}
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nested Reply Input */}
            {isReplyingToThis && (
                <div className="mt-2 ml-8 relative z-20">
                    <AdvancedInput 
                        onSubmit={(text, type) => onSubmitReply(text, type, comment._id)} 
                        onCancel={onCancelReply}
                        placeholder={`Replying to ${comment.user?.name}...`}
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};

// Input Component
const AdvancedInput = ({ onSubmit, onCancel, placeholder, autoFocus = false }) => {
    const [text, setText] = useState("");
    const [selectedType, setSelectedType] = useState('comment');
    const textareaRef = React.useRef(null);

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSubmit(text, selectedType);
        setText("");
        setSelectedType('comment');
        // Reset height
        if (textareaRef.current) textareaRef.current.style.height = '80px';
    };

    const handleKeyDown = (e) => {
        // Ctrl+Enter or Cmd+Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e) => {
        // Auto-resize
        const target = e.target;
        target.style.height = 'auto';
        target.style.height = Math.min(target.scrollHeight, 200) + 'px'; // Cap at 200px
        setText(target.value);
    };

    return (
        <div className="relative bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm focus-within:border-slate-400 dark:focus-within:border-white/30 transition-all overflow-hidden">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "What's on your mind? (Markdown supported: **bold**, `code`)"}
                className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-900 dark:text-white placeholder-gray-400 resize-none min-h-[120px] p-4 pb-14 overflow-y-auto custom-scrollbar"
                autoFocus={autoFocus}
                style={{ height: '120px' }}
            />
            
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none p-2">
                {/* Type Selector */}
                <div className="flex gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-1.5 border border-slate-200/50 dark:border-white/10 pointer-events-auto">
                    {FEEDBACK_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                                selectedType === type.id 
                                ? `${type.bg} ${type.color} ring-1 ring-inset ring-current` 
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                            title={type.label}
                        >
                            <type.icon size={16} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 items-center pointer-events-auto">

                    {onCancel && (
                        <button 
                            onClick={onCancel}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-lg border border-slate-200/50 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={handleSubmit}
                        disabled={!text.trim()}
                        className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Send size={12} /> Post
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdvancedCommentSection = ({ postId, postAuthorId, initialComments = [], onClose, onCommentAdded }) => {
    // Check if initial comments are fully populated objects, not just ID strings
    const isPopulated = initialComments.length > 0 && typeof initialComments[0] === 'object' && initialComments[0] !== null;
    const [comments, setComments] = useState(isPopulated ? initialComments : []); 
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(null); // 'issue', 'idea', etc.
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'liked'

    const searchParams = useSearchParams();
    const externalFilter = searchParams.get('filter');

    // Handle external filtering from URL
    useEffect(() => {
        if (externalFilter) {
            const filterValue = externalFilter === 'all' ? null : externalFilter;
            setActiveFilter(filterValue);
            
            // Smooth scroll to comments if filter is present
            setTimeout(() => {
                const element = document.getElementById('comments');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 800);
        }
    }, [externalFilter]);

    useEffect(() => {
        if (postId && comments.length === 0) fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/comments/${postId}?limit=100`); // Fetch more for threading
            if (res.success) {
                setComments(res.data);
            }
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    // Transform flat list to tree
    const commentTree = useMemo(() => {
        const map = {};
        const roots = [];
        
        // Clone to avoid mutation issues
        const list = comments.map(c => ({ ...c, children: [] }));
        
        // Map ID -> Comment
        list.forEach((c, i) => {
            map[c._id] = i;
        });

        // Build Tree
        list.forEach(c => {
             if (c.parentComment) {
                 const parentIndex = map[c.parentComment];
                 if (list[parentIndex]) {
                     list[parentIndex].children.push(c);
                 } else {
                     roots.push(c); // Orphan or parent not fetched
                 }
             } else {
                 roots.push(c);
             }
        });
        
        return roots;
    }, [comments]);


    // Sort Logic
    const sortNodes = (nodes) => {
        const sorted = [...nodes];
        sorted.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'liked') return (b.likes || 0) - (a.likes || 0);
            return 0; 
        });
        
        // Recursively sort children
        sorted.forEach(node => {
            if (node.children && node.children.length > 0) {
                node.children = sortNodes(node.children);
            }
        });
        return sorted;
    };

    // Filter Logic
    const filteredTree = useMemo(() => {
        let nodes = commentTree;

        // 1. Filter
        if (searchQuery || activeFilter) {
            const filterNodes = (nodes) => {
                return nodes.reduce((acc, node) => {
                    const matchesSearch = !searchQuery || node.content.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = !activeFilter || 
                        (activeFilter === 'helpful' ? node.isHelpful : node.feedbackType === activeFilter);
                    const isMatch = matchesSearch && matchesFilter;
                    
                    const filteredChildren = filterNodes(node.children || []);
                    const hasMatchingChildren = filteredChildren.length > 0;

                    if (isMatch || hasMatchingChildren) {
                        acc.push({ ...node, children: filteredChildren });
                    }
                    return acc;
                }, []);
            };
            nodes = filterNodes(commentTree);
        }

        // 2. Sort
        return sortNodes(nodes);
    }, [commentTree, searchQuery, activeFilter, sortBy]);

    // Calculate Stats for Filter Pills
    const typeCounts = useMemo(() => {
        const counts = {};
        comments.forEach(c => {
            counts[c.feedbackType] = (counts[c.feedbackType] || 0) + 1;
        });
        return counts;
    }, [comments]);


    const handlePostComment = async (text, type, parentId = null) => {
        try {
            // Optimistic Update
            const tempId = Date.now().toString();
            const newComment = {
                _id: tempId,
                content: text,
                feedbackType: type,
                parentComment: parentId,
                user: { name: "You", avatar: null }, // Mock, should take from Auth context
                createdAt: new Date().toISOString(),
                isPending: true
            };
            
            setComments(prev => [newComment, ...prev]);
            setReplyingTo(null);

            const res = await api.post(`/comments/${postId}`, { 
                content: text, 
                feedbackType: type,
                parentComment: parentId 
            });

            if (res.success) {
                // Replace temp with real
                 setComments(prev => prev.map(c => c._id === tempId ? res.data : c));
                 if (onCommentAdded && !parentId) {
                     onCommentAdded();
                 }
            }
        } catch (err) {
            console.error("Failed to post", err);
        }
    };

    const handleToggleHelpful = async (commentId, isHelpful) => {
        try {
            // Optimistic update
            setComments(prev => prev.map(c => 
                c._id === commentId ? { ...c, isHelpful } : c
            ));

            const res = await api.patch(`/comments/${commentId}/helpful`, { isHelpful });

            if (!res.success) {
                // Revert on failure
                setComments(prev => prev.map(c => 
                    c._id === commentId ? { ...c, isHelpful: !isHelpful } : c
                ));
            }
        } catch (err) {
            console.error("Failed to toggle helpful", err);
            // Revert on error
            setComments(prev => prev.map(c => 
                c._id === commentId ? { ...c, isHelpful: !isHelpful } : c
            ));
        }
    };

    // Recursive Renderer
    const renderTree = (nodes, depth = 0) => {
        return nodes.map((node, i) => {
            const isLast = i === nodes.length - 1;
            const hasChildren = node.children && node.children.length > 0;
            const isRoot = depth === 0;

            // Indentation logic
            // Root children need to shift to align with Root Avatar (Center 32px)
            // Nested children shift by 36px (12px center + 24px curve)
            const indentClass = isRoot ? 'ml-[56px]' : 'ml-[36px]';
            
            // Wrapper Margin
            const marginClass = isRoot ? 'mt-6' : 'mt-2';

            return (
            <div key={node._id} className={`relative ${marginClass}`}>
                 {/* 
                    SIBLING RAIL: Connects this node's top to the next node's top
                    Only drawn if this is NOT the last node.
                    Position: -24px left (standard rail track).
                    Top: -8px (to connect with previous).
                    Bottom: 0 (to connect with next).
                 */}
                 {!isRoot && !isLast && (
                     <div className="absolute left-[-24px] top-[-8px] bottom-0 w-[2px] bg-slate-200 dark:bg-white/10"></div>
                 )}

                <CommentNode 
                    comment={node} 
                    depth={depth}
                    onReply={(id) => setReplyingTo(id)}
                    isReplyingToThis={replyingTo === node._id}
                    onSubmitReply={handlePostComment}
                    onCancelReply={() => setReplyingTo(null)}
                    postAuthorId={postAuthorId}
                    isLast={isLast}
                    searchQuery={searchQuery}
                    onToggleHelpful={handleToggleHelpful}
                />
                  
                  {hasChildren && (
                      <div className={indentClass}>
                          {renderTree(node.children, depth + 1)}
                      </div>
                  )}
            </div>
            );
        });
    };
    
    // WAIT: CommentNode was already doing recursion inside. 
    // Let's modify CommentNode to NOT recurse, and let the Parent handle it? 
    // OR just pass the props down.
    // The previous `CommentNode` implementation I wrote above `comment.children.map` 
    // needs to pass `isReplyingToThis` correctly.
    // But `replyingTo` state is in Parent.
    // So the `CommentNode` I wrote above is missing the `onReply` prop drilling.
    
    // Let's fix that by using a render prop or context, or just modifying the recursion in `CommentNode`.
    // Actually, `renderTree` function here is better because it has access to `replyingTo` state in closure.
    // So I will REMOVE the recursion from `CommentNode` JSX and do it here.

    return (
        <div className="bg-transparent pt-4" onClick={e => e.stopPropagation()}>


             {/* Main Input */}
             <div className="mb-6">
                 <AdvancedInput onSubmit={(text, type) => handlePostComment(text, type, null)} />
             </div>

             {/* Smart Filter Bar & Search (Two Lines) */}
             <div className="flex flex-col gap-3 mb-6 sticky top-0 z-30 pt-2 pb-4 -mx-2 px-2 border-b border-slate-200 dark:border-white/5 backdrop-blur-xl">
                {/* Line 1: Search (flex-1) + Sort Dropdown (right) */}
                <div className="flex items-center gap-3">
                    {/* Search - takes remaining space */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search discussion..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-0 outline-none focus:border-slate-400 dark:focus:border-white/20 transition-all placeholder-gray-400"
                        />
                    </div>

                    {/* Sort Dropdown - positioned on the right */}
                    <CustomSelect 
                        options={[
                            { value: 'newest', label: 'Newest' },
                            { value: 'oldest', label: 'Oldest' },
                            { value: 'liked', label: 'Most Liked' }
                        ]}
                        value={sortBy}
                        onChange={setSortBy}
                        dropdownWidth="w-40"
                        icon={AlignLeft}
                    />
                </div>

                {/* Line 2: Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                         onClick={() => setActiveFilter(null)}
                         className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                             !activeFilter 
                             ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black' 
                             : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300'
                         }`}
                    >
                        All <span className="opacity-60 text-[10px] ml-0.5">{comments.length}</span>
                    </button>
                    
                    {FEEDBACK_TYPES.map(type => {
                        const count = typeCounts[type.id] || 0;
                        // Always show Answer and Critique, hide others if count is 0
                        if (count === 0 && type.id !== 'answer' && type.id !== 'critique') return null;
                        
                        const isActive = activeFilter === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setActiveFilter(isActive ? null : type.id)}
                                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                                    isActive 
                                    ? `${type.bg} ${type.color} border-current ring-1 ring-current` 
                                    : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-brand-cloud dark:hover:bg-white/10'
                                }`}
                            >
                                <type.icon size={11} />
                                {type.label}
                                <span className="opacity-60 text-[10px] ml-0.5">{count}</span>
                            </button>
                        );
                    })}

                    {/* Helpful Filter - Always show */}
                    {(() => {
                        const helpfulCount = comments.filter(c => c.isHelpful).length;
                        const isActive = activeFilter === 'helpful';
                        return (
                            <button
                                onClick={() => setActiveFilter(isActive ? null : 'helpful')}
                                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                                    isActive 
                                    ? 'bg-amber-100 dark:bg-brand-amber/10 text-amber-600 dark:text-amber-400 border-amber-500 ring-1 ring-amber-500' 
                                    : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-brand-cloud dark:hover:bg-white/10'
                                }`}
                            >
                                <Star size={11} className="fill-current" />
                                Helpful
                                <span className="opacity-60 text-[10px] ml-0.5">{helpfulCount}</span>
                            </button>
                        );
                    })()}
                </div>
             </div>

             {/* Tree */}
             <div className="space-y-6 min-h-[300px]">
                 {loading ? (
                     <div className="text-center py-12 text-slate-400 animate-pulse flex flex-col items-center gap-3">
                        <AppleSpinner />
                        <span>Loading discussion...</span>
                     </div>
                 ) : filteredTree.length > 0 ? (
                     renderTree(filteredTree)
                 ) : (
                     <div className="py-20 text-center flex flex-col items-center justify-center gap-4 text-slate-400 bg-brand-cloud/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <Search size={24} className="opacity-40" />
                        </div>
                        <div>
                            <p className="font-semibold text-brand-slate dark:text-slate-300">No matches found</p>
                            <p className="text-xs">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                        </div>
                        { (searchQuery || activeFilter) && (
                            <button 
                                onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
                                className="text-xs font-bold text-brand-blue dark:text-indigo-400 hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                     </div>
                 )}
             </div>
        </div>
    );
};

export default AdvancedCommentSection;

