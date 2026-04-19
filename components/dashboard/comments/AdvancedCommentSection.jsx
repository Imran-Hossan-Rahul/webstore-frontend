"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { api } from "@/utils/api";
import { 
    MessageCircle, Send, CornerDownRight, MoreHorizontal, 
    AlertCircle, Lightbulb, Flame, HelpCircle, Check, X, Sparkles, CheckCircle, Eye, Search, Filter, ChevronDown, AlignLeft, Star
} from 'lucide-react';

const FEEDBACK_TYPES = [
    { id: 'comment', label: 'Comment', icon: MessageCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-white/10' },
    { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'answer', label: 'Answer', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'issue', label: 'Issue', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'suggestion', label: 'Idea', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'critique', label: 'Critique', icon: Eye, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'kudos', label: 'Kudos', icon: Flame, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

const CommentNode = ({ comment, depth = 0, onReply, isReplyingToThis, onSubmitReply, onCancelReply, postAuthorId, isLast, searchQuery, onToggleHelpful }) => {
    const isRoot = depth === 0;
    const typeConfig = FEEDBACK_TYPES.find(t => t.id === comment.feedbackType) || FEEDBACK_TYPES[0];
    const Icon = typeConfig.icon;
    const isCreator = postAuthorId && comment.user?._id === postAuthorId;

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
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-gray-900 dark:text-white rounded-sm px-0.5">{part}</mark> 
                : part
            );
        };

        const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-pink-500">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('**') && part.endsWith('**')) {
                // Highlight inside bold too
                return <strong key={i} className="font-bold text-gray-900 dark:text-white">{highlightText(part.slice(2, -2))}</strong>;
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
                <div className="absolute left-[-24px] top-[-8px] w-[24px] h-[28px] border-l-[2px] border-b-[2px] border-gray-200 dark:border-white/10 rounded-bl-xl pointer-events-none"></div>
            )}

            {/* OUTGOING TAIL (Vertical Line from Avatar Bottom to start of children) */}
            {hasChildren && (
                 <div className={`absolute border-l-[2px] border-gray-200 dark:border-white/10 w-[2px] pointer-events-none ${
                     isRoot 
                     ? 'left-[32px] top-[48px] bottom-[-24px]' // Root: Center 32px. Top 48px (Avatar bottom). Extends down to meet children.
                     : 'left-[12px] top-[32px] bottom-[-8px]'  // Nested: Center 12px. Top 32px (Avatar bottom). Extends down.
                 }`}></div>
            )}

            <div className={`group relative transition-all ${
                isRoot 
                ? `bg-white dark:bg-[#111] p-4 rounded-2xl border ${
                    comment.isHelpful ? 'border-amber-400/40 bg-amber-50/20 dark:bg-amber-500/5 ring-1 ring-amber-400/20' :
                    comment.feedbackType === 'issue' ? 'border-red-500/20' : 
                    comment.feedbackType === 'suggestion' ? 'border-amber-500/20' : 
                    comment.feedbackType === 'answer' ? 'border-green-500/20' :
                    comment.feedbackType === 'critique' ? 'border-indigo-500/20' :
                    isCreator ? 'border-purple-500/30 ring-1 ring-purple-500/10' :
                    'border-gray-200 dark:border-white/5'
                  } z-10`
                : `pl-0 py-2 hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-xl ml-0` 
            }`}>
                <div className="flex justify-between items-start gap-3">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0 relative z-10">
                        <div className={`${isRoot ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 overflow-hidden ${isCreator ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-black' : ''} shadow-sm mx-auto`}>
                            {comment.user?.avatar ? (
                                <Image src={comment.user.avatar} width={32} height={32} className="object-cover" alt="av" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{comment.user?.name?.[0]}</div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={`font-bold ${isRoot ? 'text-sm' : 'text-xs'} text-gray-900 dark:text-white`}>{comment.user?.name}</span>
                            
                            {isCreator && (
                                <span className="bg-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-purple-500/20">
                                    <Sparkles size={8} /> OWNER
                                </span>
                            )}

                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${typeConfig.bg} ${typeConfig.color}`}>
                                <Icon size={10} /> {typeConfig.label}
                            </span>
                            
                            {comment.isHelpful && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Star size={10} className="fill-current" /> Helpful
                                </span>
                            )}
                            
                            <span className="text-gray-400 text-[10px]">• {timeAgo(comment.createdAt)}</span>
                        </div>
                        
                        <div className={`${isRoot ? 'text-sm' : 'text-xs text-gray-600 dark:text-gray-300'} leading-relaxed whitespace-pre-wrap`}>
                            {renderRichText(comment.content)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => onReply(comment._id)}
                                className="text-[10px] font-bold text-gray-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
                             >
                                 Reply
                             </button>
                             
                             {/* Mark as Helpful - Only visible to post owner */}
                             {isCreator && (
                                <button 
                                    onClick={() => onToggleHelpful && onToggleHelpful(comment._id, !comment.isHelpful)}
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                        comment.isHelpful 
                                        ? 'text-amber-500 hover:text-amber-600' 
                                        : 'text-gray-400 hover:text-amber-500'
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
        <div className="bg-gray-50/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/50 transition-all">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "What's on your mind? (Markdown supported: **bold**, `code`)"}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none min-h-[80px] overflow-y-auto custom-scrollbar"
                autoFocus={autoFocus}
                style={{ height: '80px' }}
            />
            
            <div className="flex justify-between items-center mt-2 border-t border-gray-100 dark:border-white/5 pt-2">
                {/* Type Selector */}
                <div className="flex gap-1">
                    {FEEDBACK_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                                selectedType === type.id 
                                ? `${type.bg} ${type.color} ring-1 ring-inset ring-current` 
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                            title={type.label}
                        >
                            <type.icon size={16} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 items-center">
                    <span className="hidden sm:inline text-[10px] text-gray-400 mr-2">
                        ⌘ + Enter
                    </span>
                    {onCancel && (
                        <button 
                            onClick={onCancel}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={handleSubmit}
                        disabled={!text.trim()}
                        className="px-4 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                        <Send size={12} /> Post
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdvancedCommentSection = ({ postId, postAuthorId, initialComments = [], onClose, onCommentAdded }) => {
    const [comments, setComments] = useState(initialComments); // Flat list initially
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(null); // 'issue', 'idea', etc.
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'liked'

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
                     <div className="absolute left-[-24px] top-[-8px] bottom-0 w-[2px] bg-gray-200 dark:bg-white/10"></div>
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
        <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/10 p-4 sm:p-6" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <MessageCircle size={18} /> Discussion ({comments.length})
                 </h3>
                 <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full">
                     <X size={16} />
                 </button>
             </div>

             {/* Main Input */}
             <div className="mb-6">
                 <AdvancedInput onSubmit={(text, type) => handlePostComment(text, type, null)} />
             </div>

             {/* Smart Filter Bar & Search (Two Lines) */}
             <div className="flex flex-col gap-3 mb-6 sticky top-0 bg-gray-50 dark:bg-[#111] z-30 pt-2 pb-4 -mx-2 px-2 border-b border-gray-200 dark:border-white/5 backdrop-blur-xl bg-opacity-90">
                {/* Line 1: Search (flex-1) + Sort Dropdown (right) */}
                <div className="flex items-center gap-3">
                    {/* Search - takes remaining space */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search discussion..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-gray-400"
                        />
                    </div>

                    {/* Sort Dropdown - positioned on the right */}
                    <div className="relative group flex-shrink-0">
                        <button className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                            <AlignLeft size={14} /> 
                            {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Top'}
                            <ChevronDown size={12} className="opacity-50" />
                        </button>
                        
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-1 z-50 hidden group-hover:block">
                            {['newest', 'oldest', 'liked'].map(sort => (
                                <button
                                    key={sort}
                                    onClick={() => setSortBy(sort)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        sortBy === sort 
                                        ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300' 
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {sort === 'newest' ? 'Newest' : sort === 'oldest' ? 'Oldest' : 'Most Liked'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Line 2: Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                         onClick={() => setActiveFilter(null)}
                         className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                             !activeFilter 
                             ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black' 
                             : 'bg-white dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-300'
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
                                    : 'bg-white dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
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
                                    ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500 ring-1 ring-amber-500' 
                                    : 'bg-white dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
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
             <div className="space-y-6">
                 {loading ? (
                     <div className="text-center py-8 text-gray-400">Loading discussion...</div>
                 ) : (
                     renderTree(filteredTree)
                 )}
             </div>
        </div>
    );
};

export default AdvancedCommentSection;
