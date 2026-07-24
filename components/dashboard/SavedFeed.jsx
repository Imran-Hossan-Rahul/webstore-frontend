import { useSearchParams } from "next/navigation";
import { Search, Grid2X2, LayoutList, X } from "lucide-react";
import SavedItemCard from "./cards/SavedItemCard";
import EmptyState from "../ui/EmptyState";
import React, { useState, useMemo, useContext } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useDebounce } from "@/hooks/useDebounce";
import CustomSelect from "../ui/CustomSelect";
import { DashboardContext } from "../../app/(dashboard)/layout";
import AuthRequired from "../ui/AuthRequired";

/**
 * 🔖 SAVED FEED COMPONENT
 * 
 * Optimized for performance using Custom Hooks and Debounced Filtering.
 */
export default function SavedFeed() {
  const { items, folders, loading, handleRemove, handleMoveToFolder, handleRemoveFromFolder } = useFavorites();
  const { user } = useContext(DashboardContext) || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms debounce
  
  if (!user) {
    return <AuthRequired />;
  }
  
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");

  // Memoized Filter Logic
  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Folder Filter
    if (activeFolderId) {
        const folder = folders.find(f => f._id === activeFolderId);
        if (folder) {
            const folderItemIds = folder.items?.map(i => i.itemId) || [];
            result = items.filter(item => folderItemIds.includes(item._id || item.id));
        }
    }

    // 2. Category Filter
    if (activeCategory !== "All") {
        result = result.filter(item => {
            const type = item.type?.toLowerCase();
            return type === activeCategory.toLowerCase() || 
                   (activeCategory === "Devlogs" && type === "devlog") || 
                   (activeCategory === "Artifacts" && type === "artifact");
        });
    }

    // 3. Debounced Search Filter
    if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        result = result.filter(item => {
            const title = (item.title || item.displayName || "").toLowerCase();
            const desc = (item.description || item.bio || "").toLowerCase();
            const authorName = (item.author?.name || item.user?.name || "").toLowerCase();
            const authorUsername = (item.author?.username || item.user?.username || "").toLowerCase();
            return title.includes(query) || desc.includes(query) || authorName.includes(query) || authorUsername.includes(query);
        });
    }

    // 4. Sort Logic
    return [...result].sort((a, b) => {
        if (sortBy === "oldest") {
            return new Date(a.createdAt || a.savedAt || 0) - new Date(b.createdAt || b.savedAt || 0);
        }
        if (sortBy === "az") {
            const titleA = (a.title || a.displayName || "").toLowerCase();
            const titleB = (b.title || b.displayName || "").toLowerCase();
            return titleA.localeCompare(titleB);
        }
        if (sortBy === "za") {
            const titleA = (a.title || a.displayName || "").toLowerCase();
            const titleB = (b.title || b.displayName || "").toLowerCase();
            return titleB.localeCompare(titleA);
        }
        // default newest
        return new Date(b.createdAt || b.savedAt || 0) - new Date(a.createdAt || a.savedAt || 0);
    });
  }, [items, activeCategory, debouncedSearch, activeFolderId, folders, sortBy]);

  const categories = ["All", "Devlogs", "Codex", "Artifacts", "Jobs", "Challenges"];

  const getCategoryCount = (cat) => {
    if (!items) return 0;
    if (cat === "All") return items.length;
    return items.filter(item => {
        const type = item.type?.toLowerCase();
        return type === cat.toLowerCase() || 
               (cat === "Devlogs" && type === "devlog") || 
               (cat === "Artifacts" && type === "artifact");
    }).length;
  };

  return (
    <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-2">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Saved Collection
        </h1>
        
        {/* Search (Debounced UI) */}
        <div className="relative w-full md:w-96 group">
            <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-slate-300 dark:focus:border-white/20 rounded-2xl text-[14px] font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={14} strokeWidth={1.5} className="text-slate-400" />
                </button>
            )}
        </div>
      </div>

      {/* Tool Bar */}
      <div className="sticky top-20 z-30 mb-6 bg-white/50 dark:bg-black/20 backdrop-blur-md py-2 -mx-2 px-2 flex items-center justify-between gap-4">
          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
              {categories.map(cat => {
                  const count = getCategoryCount(cat);
                  // Hide category if no items and not "All"
                  if (count === 0 && cat !== "All") return null;
                  
                  return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-colors border whitespace-nowrap flex items-center gap-2 ${
                        activeCategory === cat
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                        : "bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 cursor-pointer"
                    }`}
                  >
                      {cat} 
                      <span className={`text-[10px] ${activeCategory === cat ? 'text-white/70 dark:text-slate-900/60' : 'text-slate-400 dark:text-slate-500'}`}>
                          {count}
                      </span>
                  </button>
              )})}
          </div>

          {/* Sort Dropdown */}
          <div className="flex-shrink-0 w-[130px]">
             <CustomSelect 
                 options={[
                     { value: "newest", label: "Newest" },
                     { value: "oldest", label: "Oldest" },
                     { value: "az", label: "A to Z" },
                     { value: "za", label: "Z to A" }
                 ]}
                 value={sortBy}
                 onChange={(val) => setSortBy(val)}
                 dropdownWidth="w-full right-0"
             />
          </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-[4/3] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
             <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                <Search size={32} strokeWidth={1.5} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching items</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                 We couldn't find anything matching your search. Try using different keywords.
             </p>
             {items.length === 0 && <EmptyState type="saved" />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
             <SavedItemCard 
                key={item._id || item.id} 
                item={item} 
                onRemove={handleRemove}
                folders={folders}
                onMove={handleMoveToFolder}
                onRemoveFromFolder={handleRemoveFromFolder}
                searchQuery={debouncedSearch}
             />
          ))}
        </div>
      )}
    </div>
  );
}


