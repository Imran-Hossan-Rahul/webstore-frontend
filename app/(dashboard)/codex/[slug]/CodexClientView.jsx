"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { api } from "@/utils/api";
import { 
    ArrowLeft, Layers, MessageCircle, Clock, Calendar, Eye, Share2, Bookmark
} from 'lucide-react';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import { motion, AnimatePresence } from 'framer-motion';
import JsonLd, { buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import SaveNoteModal from '@/components/dashboard/modals/SaveNoteModal';
import { BookmarkPlus } from 'lucide-react';


// Syntax Highlighting
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

const ReadingProgressBar = () => {
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            setReadingProgress(progress);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-[64px] left-0 right-0 z-[60] pointer-events-none flex justify-center">
            <div className="w-full max-w-[1800px] h-[2px]">
                <motion.div 
                    className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
    </div>
    );
};

export default function CodexClientView({ initialCodex, slug }) {
    const router = useRouter();
    
    const [codex, setCodex] = useState(initialCodex || null);
    const [loading, setLoading] = useState(!initialCodex);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [tooltipPosition, setTooltipPosition] = useState(null);

    const hasHighlighted = useRef(false);
    const searchParams = useSearchParams();
    const targetNoteId = searchParams?.get('noteId');

    // Calculate reading time
    const readingTime = useMemo(() => {
        if (!codex?.content) return 0;
        const wordsPerMinute = 200;
        const noOfWords = codex.content.split(/\s+/g).length;
        return Math.ceil(noOfWords / wordsPerMinute);
    }, [codex?.content]);

    useEffect(() => {
        if (!initialCodex && slug) fetchCodex();
        else if (initialCodex && slug) {
            // Background view update
            api.post(`/codex/${slug}/view`).catch(() => {});
        }
    }, [slug, initialCodex]);

    // Highlight text algorithm
    const highlightAndScrollToText = (textToFind, noteId) => {
        if (!textToFind) return;
        const container = document.querySelector('.codex-prose');
        if (!container) return;

        // Clear existing temporary highlights
        document.querySelectorAll('mark.temp-highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });

        // Find and highlight text
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let found = false;

        while ((node = walker.nextNode())) {
            const textContent = node.nodeValue;
            const index = textContent.indexOf(textToFind);

            if (index !== -1) {
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + textToFind.length);

                const mark = document.createElement('mark');
                mark.className = 'temp-highlight bg-amber-400/50 dark:bg-amber-500/50 text-inherit rounded px-1 transition-all duration-1000';
                mark.id = `highlight-${noteId}`;
                range.surroundContents(mark);
                
                // Scroll into view
                setTimeout(() => {
                    mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a pulse effect class after scrolling
                    mark.classList.add('animate-pulse');
                    setTimeout(() => mark.classList.remove('animate-pulse'), 3000);
                }, 100);

                found = true;
                break; // Stop after first match for this specific note
            }
        }
        
        if (!found) {
            console.warn("Could not find text to highlight:", textToFind);
        }
    };

    // Listen for custom event from Sidebar
    useEffect(() => {
        const handleCustomScroll = (e) => {
             const note = e.detail;
             highlightAndScrollToText(note.highlightedText, note._id);
        };
        window.addEventListener('scroll-to-highlight', handleCustomScroll);
        return () => window.removeEventListener('scroll-to-highlight', handleCustomScroll);
    }, []);

    // Auto-scroll if URL has noteId
    useEffect(() => {
        if (targetNoteId && codex?._id) {
            // We need to fetch this specific note if arriving directly via URL
            const fetchAndScroll = async () => {
                try {
                    let allNotes = [];
                    // 1. Fetch public notes
                    try {
                        const publicRes = await api.get(`/notes/codex/${codex._id}/public`);
                        if (publicRes.success) allNotes = [...allNotes, ...publicRes.data];
                    } catch(e) { console.error(e); }

                    // 2. Fetch user's private/public notes (fails silently if guest)
                    try {
                        const privateRes = await api.get(`/notes?codexId=${codex._id}`);
                        if (privateRes.success) {
                            // avoid duplicates if note is already in publicNotes
                            const newNotes = privateRes.data.filter(pn => !allNotes.some(an => an._id === pn._id));
                            allNotes = [...allNotes, ...newNotes];
                        }
                    } catch(e) { /* Ignore auth error if guest */ }

                    const note = allNotes.find(n => n._id === targetNoteId);
                    if (note) {
                        setTimeout(() => {
                            highlightAndScrollToText(note.highlightedText, note._id);
                        }, 500);
                    } else {
                        console.warn("Target note not found in public or user's private notes");
                    }
                } catch(e) {
                    console.error("Failed to fetch note for auto-scroll", e);
                }
            };
            fetchAndScroll();
        }
    }, [targetNoteId, codex?._id]);

    // Handle text selection for notes
    useEffect(() => {
        const handleSelection = () => {
            if (isNoteModalOpen) return;
            
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            if (text.length > 0 && selection.rangeCount > 0) {
                let node = selection.anchorNode;
                let isInsideCodex = false;
                while (node) {
                    if (node.classList && node.classList.contains('codex-prose')) {
                        isInsideCodex = true;
                        break;
                    }
                    node = node.parentNode;
                }

                if (isInsideCodex) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setTooltipPosition({
                        top: rect.top + window.scrollY - 40,
                        left: rect.left + window.scrollX + (rect.width / 2),
                    });
                    setSelectedText(text);
                    return;
                }
            }
            
            setTooltipPosition(null);
        };

        const handleScrollOrClickOutside = (e) => {
            if (!e.target?.closest || !e.target.closest('.highlight-tooltip-btn')) {
                const selection = window.getSelection();
                if (!selection?.toString().trim()) {
                    setTooltipPosition(null);
                }
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);
        document.addEventListener('mousedown', handleScrollOrClickOutside);
        window.addEventListener('scroll', handleScrollOrClickOutside, { passive: true });

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
            document.removeEventListener('mousedown', handleScrollOrClickOutside);
            window.removeEventListener('scroll', handleScrollOrClickOutside);
        };
    }, [isNoteModalOpen]);

    useEffect(() => {
        if (!codex?.content) return;

        const highlightCode = () => {
            const codeBlocks = document.querySelectorAll('.codex-prose pre code');
            if (codeBlocks.length === 0) return false;

            codeBlocks.forEach((block) => {
                if (block.dataset.highlighted === 'true') return;

                const preElement = block.parentElement;
                if (!preElement || preElement.tagName !== 'PRE') return;

                const rawText = block.innerText || block.textContent || '';
                
                // The exact language list from the editor's CodeBlockComponent
                const editorLanguages = [
                    { value: 'javascript', label: 'JS' },
                    { value: 'python', label: 'PYTHON' },
                    { value: 'html', label: 'HTML' },
                    { value: 'css', label: 'CSS' },
                    { value: 'json', label: 'JSON' },
                    { value: 'typescript', label: 'TS' },
                    { value: 'bash', label: 'BASH' },
                    { value: 'sql', label: 'SQL' },
                    { value: 'java', label: 'JAVA' },
                    { value: 'cpp', label: 'C++' },
                    { value: 'csharp', label: 'C#' },
                    { value: 'php', label: 'PHP' },
                    { value: 'ruby', label: 'RUBY' },
                    { value: 'go', label: 'GO' },
                    { value: 'rust', label: 'RUST' },
                ];

                const validSubset = editorLanguages.map(l => l.value);

                // 1. Try to get from editor attributes first
                let language = block.getAttribute('data-language') || 
                               preElement.getAttribute('data-language') ||
                               block.className.match(/language-([a-zA-Z0-9+#-]+)/)?.[1] ||
                               preElement.className.match(/language-([a-zA-Z0-9+#-]+)/)?.[1];
                
                if (language) language = language.toLowerCase();

                // 2. Detection logic
                try {
                    if (!language || !validSubset.includes(language) || language === 'null' || language === 'code') {
                        const result = hljs.highlightAuto(rawText, validSubset);
                        language = result.language || 'code';
                        block.innerHTML = result.value;
                    } else {
                        const result = hljs.highlight(rawText, { language });
                        block.innerHTML = result.value;
                    }
                } catch (err) {
                    console.warn('Highlight specific language error, falling back to auto:', err);
                    try {
                        const result = hljs.highlightAuto(rawText, validSubset);
                        language = result.language || 'code';
                        block.innerHTML = result.value;
                    } catch (e) {
                        console.error('Auto highlight error fallback:', e);
                        block.textContent = rawText;
                        language = language || 'code';
                    }
                }
                
                block.dataset.highlighted = 'true';
                
                // Final Cleanup & Mapping for Display
                let finalLabel = (language || 'code').toLowerCase();
                
                // Standardize for CSS Branding (data-lang)
                if (finalLabel === 'js') finalLabel = 'javascript';
                if (finalLabel === 'ts') finalLabel = 'typescript';
                if (finalLabel === 'py') finalLabel = 'python';
                if (finalLabel === 'jsx' || finalLabel === 'tsx') finalLabel = 'react';
                if (finalLabel === 'xml') finalLabel = 'html';

                preElement.setAttribute('data-lang', finalLabel);
                preElement.setAttribute('data-language', finalLabel.toUpperCase());

                // Inject Copy Button
                if (!preElement.querySelector('.copy-code-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'copy-code-btn';
                    btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy</span>
                    `;
                    btn.onclick = () => {
                        navigator.clipboard.writeText(rawText);
                        const span = btn.querySelector('span');
                        if (span) span.innerText = 'Copied!';
                        btn.classList.add('copied');
                        setTimeout(() => {
                            if (span) span.innerText = 'Copy';
                            btn.classList.remove('copied');
                        }, 2000);
                    };
                    preElement.appendChild(btn);
                }
            });
            return true;
        };

        // MutationObserver to catch code blocks added after initial render or during React hydration
        const observer = new MutationObserver(() => {
            highlightCode();
        });
        
        const contentContainer = document.querySelector('.codex-prose');
        if (contentContainer) {
            observer.observe(contentContainer, { childList: true, subtree: true });
        }

        // Run immediately and then on a short interval to catch late renders
        highlightCode();
        const interval = setInterval(() => {
            highlightCode(); // Keep trying just in case
        }, 300);

        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [codex?.content]);

    const fetchCodex = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/codex/${slug}`);
            if (res) {
                setCodex(res);
                // Background view update
                api.post(`/codex/${slug}/view`).catch(() => {});
            }
        } catch (err) {
            console.error("Failed to load codex", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-20 animate-pulse">
                {/* Back button / Breadcrumb placeholder */}
                <div className="h-4 w-24 bg-slate-200/50 dark:bg-zinc-800/45 rounded-full mb-12"></div>
                
                {/* Title block placeholders */}
                <div className="h-12 w-full bg-slate-200/50 dark:bg-zinc-800/45 rounded-2xl mb-6"></div>
                <div className="h-12 w-3/4 bg-slate-200/50 dark:bg-zinc-800/45 rounded-2xl mb-12"></div>
                
                {/* Cover Image placeholder with 21/9 aspect ratio */}
                <div className="w-full aspect-[21/9] bg-slate-200/50 dark:bg-zinc-800/45 rounded-[2rem] mb-16"></div>
                
                {/* Rich content prose paragraphs placeholders */}
                <div className="space-y-6">
                    <div className="h-4 w-full bg-slate-200/50 dark:bg-zinc-800/45 rounded-full"></div>
                    <div className="h-4 w-full bg-slate-200/50 dark:bg-zinc-800/45 rounded-full"></div>
                    <div className="h-4 w-5/6 bg-slate-200/50 dark:bg-zinc-800/45 rounded-full"></div>
                    <div className="h-4 w-4/5 bg-slate-200/50 dark:bg-zinc-800/45 rounded-full"></div>
                    <div className="h-4 w-full bg-slate-200/50 dark:bg-zinc-800/45 rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!codex) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <Layers className="w-20 h-20 text-slate-200 dark:text-slate-800 mb-8" />
                </motion.div>
                <h1 className="text-2xl font-medium mb-4 tracking-tight font-sans">Codex not found</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm text-base font-normal leading-relaxed font-sans">The codex you are looking for has either moved to a new galaxy or never existed.</p>
                <button 
                    onClick={() => router.push('/codexs')} 
                    className="px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-black font-semibold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    const { 
        title, content, coverImage, author, createdAt, views
    } = codex;

    const renderedCodexContent = useMemo(() => {
        if (!content) return null;
        return (
            <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="codex-prose"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }, [content]);

    return (
        <div className="w-full min-h-screen selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:bg-indigo-500/40 dark:selection:text-indigo-100">
            <ReadingProgressBar />

            {/* JSON-LD Structured Data — Article + Breadcrumb */}
            <JsonLd data={buildArticleSchema({
                title: codex.seoTitle || codex.title,
                description: codex.seoDescription || codex.excerpt || codex.content?.replace(/<[^>]+>/g, '').substring(0, 150),
                author: codex.author?.name,
                publishedAt: codex.createdAt,
                updatedAt: codex.updatedAt,
                image: codex.coverImage,
                url: `https://codalina-frontend-fawn.vercel.app/codex/${slug}`,
                keywords: codex.focusKeywords?.length > 0 ? codex.focusKeywords : codex.tags
            })} />
            <JsonLd data={buildBreadcrumbSchema([
                { name: 'Home', url: 'https://codalina-frontend-fawn.vercel.app' },
                { name: 'Codex', url: 'https://codalina-frontend-fawn.vercel.app/codex' },
                { name: codex.title, url: `https://codalina-frontend-fawn.vercel.app/codex/${slug}` }
            ])} />
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-32"
            >
                {/* Top Navigation & Meta */}
                <header className="mb-8">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-between mb-6"
                    >
                        <button 
                            onClick={() => router.back()}
                            className="group flex items-center gap-3 text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                        >
                            <span className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                <ArrowLeft size={14} />
                            </span>
                            Back to feed
                        </button>

                        <div className="flex items-center gap-4">
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="w-full"
                    >

                        <h1 className="codex-main-title text-4xl sm:text-5xl lg:text-[3rem] font-medium tracking-tight mb-4 leading-[1.1] text-slate-900 dark:text-white">
                            {title}
                        </h1>

                    </motion.div>
                </header>

                {/* Cover Image */}
                {coverImage && (
                    <motion.div 
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="mb-20"
                    >
                        <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0f172a] shadow-2xl group">
                            <Image 
                                src={coverImage} 
                                alt={title} 
                                fill 
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                )}

                {/* Codex Content */}
                <div className="flex flex-col gap-16">
                    <codex className="flex-1">
                        {renderedCodexContent}
                    </codex>
                </div>

                <motion.section 
                    id="comments"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 scroll-mt-24"
                >
                    <div className="w-full">
                        <h2 className="text-xl font-medium tracking-tight mb-12 text-slate-900 dark:text-white font-sans">
                            Codex Discussion
                        </h2>
                        <AdvancedCommentSection 
                            postId={codex._id} 
                            postAuthorId={codex.author?._id} 
                            initialComments={codex.comments || []} 
                        />
                    </div>
                </motion.section>
            </motion.div>

            {/* Highlight Tooltip */}
            <AnimatePresence>
                {tooltipPosition && selectedText && !isNoteModalOpen && (
                    <motion.button
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="highlight-tooltip-btn absolute z-50 flex items-center gap-2 px-3 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-lg shadow-xl hover:scale-105 transition-transform"
                        style={{ 
                            top: tooltipPosition.top, 
                            left: tooltipPosition.left, 
                            transform: 'translateX(-50%)' 
                        }}
                        onClick={() => {
                            setIsNoteModalOpen(true);
                            setTooltipPosition(null);
                        }}
                    >
                        <BookmarkPlus size={14} />
                        Save Highlight
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Save Note Modal */}
            <SaveNoteModal 
                isOpen={isNoteModalOpen} 
                onClose={() => {
                    setIsNoteModalOpen(false);
                    window.getSelection()?.removeAllRanges();
                    setSelectedText("");
                }} 
                selectedText={selectedText} 
                codexId={codex?._id}
                url={`/codex/${slug}`}
            />
        </div>
    );
}
