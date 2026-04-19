import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text,
  Clock,
  TrendingUp,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Link as LinkIcon,
  List,
  Activity,
  ThumbsUp,
  ThumbsDown,
  BarChart2
} from "lucide-react";

// --- Helper Functions (Pure Logic) ---

// Syllable Counter (Heuristic)
const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

// Flesch-Kincaid Reading Ease
const calculateReadability = (text) => {
  if (!text) return 0;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) return 0;

  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Formula: 206.835 - 1.015(ASL) - 84.6(ASW)
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.min(100, Math.max(0, score)); // Clamp 0-100
};

// Common Stop Words
const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "is", "are", "was", "were", "has"
]);

// Keyword Density Analyzer
const analyzeKeywords = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freqMap = {};
  
  words.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  });

  const sorted = Object.entries(freqMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / words.length) * 100).toFixed(1)
    }));

  return sorted;
};

// Debounce Hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Main Component ---
export default function DocumentQualityMetrics({ editor }) {
  // State
  const [metrics, setMetrics] = useState({
    wordCount: 0,
    readingTime: 0,
    readabilityScore: 0,
    readabilityLabel: "N/A",
    seoScore: 0,
    keywords: [],
    brokenLinks: [],
    seoTips: []
  });

  // Plagiarism State
  const [plagiarismData, setPlagiarismData] = useState(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState(null);

  // Real-time Content Sync (Debounced 1s for heavy analysis)
  // We use HTML for Link checks and Text for others
  const contentHTML = editor ? editor.getHTML() : "";
  const contentText = editor ? editor.getText() : "";
  
  const debouncedHTML = useDebounce(contentHTML, 800);
  const debouncedText = useDebounce(contentText, 800);

  // Analysis Logic
  useEffect(() => {
    if (!editor) return;

    // 1. Basic Stats
    const words = debouncedText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    // Standard reading speed is ~265 WPM (e.g., used by Medium).
    const readingTime = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 265)) : 0;

    // 2. Readability
    const readabilityScore = calculateReadability(debouncedText);
    let readabilityLabel = "Very Confusing";
    if (readabilityScore > 90) readabilityLabel = "Very Easy";
    else if (readabilityScore > 80) readabilityLabel = "Easy";
    else if (readabilityScore > 70) readabilityLabel = "Fairly Easy";
    else if (readabilityScore > 60) readabilityLabel = "Standard";
    else if (readabilityScore > 50) readabilityLabel = "Fairly Difficult";
    else if (readabilityScore > 30) readabilityLabel = "Difficult";

    // 3. Keyword Density
    const keywords = analyzeKeywords(debouncedText);

    // 4. Link Analysis (using HTML)
    const parser = new DOMParser();
    const doc = parser.parseFromString(debouncedHTML, "text/html");
    const links = Array.from(doc.getElementsByTagName("a"));
    const brokenLinks = links.filter(link => {
        const href = link.getAttribute("href");
        return !href || href === "#" || href.trim() === "";
    }).length;
    
    // 5. SEO Score & Tips
    let seoPoints = 0;
    const tips = [];
    
    // Word Count Factor (Max 30)
    if (wordCount >= 600) seoPoints += 30;
    else if (wordCount >= 300) { seoPoints += 20; tips.push("Content is a bit short (<600 words)"); }
    else { seoPoints += 10; tips.push("Content is too short for ranking (<300 words)"); }

    // Heading Structure (Max 20)
    const h1Count = (debouncedHTML.match(/<h1/gi) || []).length;
    if (h1Count === 1) seoPoints += 20;
    else if (h1Count === 0) tips.push("Missing H1 title tag");
    else tips.push("Multiple H1 tags found (use only one)");

    // Link Health (Max 20)
    if (links.length > 0) seoPoints += 10;
    else tips.push("No internal/external links found");
    
    if (brokenLinks === 0) seoPoints += 10;
    else tips.push(`${brokenLinks} potentially broken/empty links found`);

    // Keyword usage (Max 10) - Simple check if content has enough variety
    if (keywords.length >= 3) seoPoints += 10;
    
    // Readability Factor (Max 20)
    if (readabilityScore > 60) seoPoints += 20;
    else if (readabilityScore > 40) { seoPoints += 10; tips.push("Readability is low, simplify text"); }
    else tips.push("Text is very difficult to read (Flesch score < 40)");

    setMetrics({
      wordCount,
      readingTime,
      readabilityScore: Math.round(readabilityScore),
      readabilityLabel,
      seoScore: seoPoints,
      keywords,
      brokenLinks: brokenLinks,
      seoTips: tips
    });
  }, [debouncedText, debouncedHTML, editor]);

  // Handler: Run Real Plagiarism Check
  const handlePlagiarismCheck = async () => {
      setIsCheckingPlagiarism(true);
      setPlagiarismError(null);
      setPlagiarismData(null);

      try {
          const res = await fetch('/api/plagiarism/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: debouncedText })
          });

          const data = await res.json();

          if (!res.ok) {
              if (res.status === 503 || data.error === "Configuration Required") {
                  throw new Error("API Key Missing. Please configure EDENAI_API_KEY.");
              }
              throw new Error(data.message || "Check failed");
          }

          setPlagiarismData(data);
      } catch (err) {
          setPlagiarismError(err.message);
      } finally {
          setIsCheckingPlagiarism(false);
      }
  };

  // Color Helpers
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getProgressColor = (score) => {
      if (score >= 80) return "bg-green-500";
      if (score >= 50) return "bg-yellow-500";
      return "bg-red-500";
  };

  return (
    <div className="space-y-6">
       {/* Section Header */}
       <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-800">Content Analytics</h3>
       </div>

       {/* 1. Overview Grid */}
       <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                <Text className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-gray-900">{metrics.wordCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Words</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-gray-900">{metrics.readingTime}m</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Read Time</div>
            </div>
       </div>

       {/* 2. Scores */}
       <div className="space-y-4">
            {/* SEO Score */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <TrendingUp size={14} /> SEO Score
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(metrics.seoScore)}`}>
                        {metrics.seoScore}/100
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.seoScore)}`} 
                        style={{ width: `${metrics.seoScore}%` }} 
                    />
                </div>
            </div>

            {/* Readability Score */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Info size={14} /> Readability
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(metrics.readabilityScore)}`}>
                        {metrics.readabilityLabel} ({metrics.readabilityScore})
                    </span>
                </div>
                 <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.readabilityScore)}`} 
                        style={{ width: `${metrics.readabilityScore}%` }} 
                    />
                </div>
            </div>
       </div>

       {/* 3. Actionable Tips (If Any) */}
       {metrics.seoTips.length > 0 && (
           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
               <h4 className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-1">
                   <AlertTriangle size={12} /> Improvement Tips
               </h4>
               <ul className="space-y-1">
                   {metrics.seoTips.map((tip, idx) => (
                       <li key={idx} className="text-xs text-yellow-700 flex items-start gap-1">
                           <span className="mt-0.5">•</span> {tip}
                       </li>
                   ))}
               </ul>
           </div>
       )}

       {/* 4. Keyword Density */}
       <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <List size={12} /> Top Keywords
            </h4>
            <div className="space-y-2">
                {metrics.keywords.length > 0 ? (
                    metrics.keywords.map((kw, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 capitalize">{kw.word}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-1.5 rounded-full" 
                                        style={{ width: `${kw.density * 5}%` }} // Scale visualization
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8 text-right">{kw.count}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">Start writing to see keywords...</p>
                )}
            </div>
       </div>
       
       {/* 5. Link Health */}
       {metrics.brokenLinks > 0 ? (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                    <LinkIcon size={14} />
                    <span className="text-sm font-medium">Potential Broken Links</span>
                </div>
                <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {metrics.brokenLinks} Found
                </span>
            </div>
       ) : (
            <div className="flex items-center gap-2 text-green-600 text-xs mt-2 px-1">
                <CheckCircle size={12} />
                <span>Link Check Passed</span>
            </div>
       )}

       {/* 6. Real Plagiarism Check (HIDDEN - To be added later) */}
       {/* 
       <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Search size={12} /> Plagiarism Check
                </h4>
                {plagiarismData && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plagiarismData.score > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {plagiarismData.score}% Match
                    </span>
                )}
            </div>

            {plagiarismError ? (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 mb-2">
                    <div className="font-bold flex items-center gap-1 mb-1">
                        <XCircle size={12} /> Error
                    </div>
                    {plagiarismError}
                </div>
            ) : null}

            {plagiarismData ? (
                 <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100">
                     {plagiarismData.score === 0 ? (
                         <div className="flex items-center gap-2 text-green-600">
                             <CheckCircle size={16} />
                             <span className="font-medium">Content is Unique!</span>
                         </div>
                     ) : (
                         <div className="space-y-1">
                             <div className="flex items-center gap-2 text-red-600 font-medium">
                                 <AlertTriangle size={16} />
                                 <span>Plagiarism Detected!</span>
                             </div>
                             <p className="text-xs text-gray-500">
                                 Found {plagiarismData.matches?.length || 0} potential usage matches.
                             </p>
                         </div>
                     )}
                 </div>
            ) : (
                <button
                    onClick={handlePlagiarismCheck}
                    disabled={isCheckingPlagiarism || metrics.wordCount < 50}
                    className="w-full flex justify-center items-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                    {isCheckingPlagiarism ? (
                        <>
                            <Activity className="animate-spin w-4 h-4" /> Checking...
                        </>
                    ) : (
                        "Run Real Check"
                    )}
                </button>
            )}
            
            {!plagiarismData && !isCheckingPlagiarism && metrics.wordCount < 50 && (
                <p className="text-xs text-center text-gray-400 mt-1">
                    Write at least 50 words to check.
                </p>
            )}
       </div>
       */}
    </div>
  );
}
