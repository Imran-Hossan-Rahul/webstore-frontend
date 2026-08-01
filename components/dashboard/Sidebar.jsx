"use client";
import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { api } from '@/utils/api';
import { DashboardContext } from "../../app/(dashboard)/layout";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Settings, 
  MessageCircle, 
  Box, 
  ChevronRight,
  Smartphone,
  Shirt,
  Home,
  Monitor,
  Watch,
  Headphones,
  ShoppingBag,
  Dumbbell,
  Book,
  Car,
  Coffee,
  Heart,
  Music,
  Gamepad,
  Camera,
  Gift
} from "lucide-react";
import FeedbackModal from "./FeedbackModal";

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Box;
  const name = categoryName.toLowerCase();
  
  // Custom downloaded icons
  if (name.includes('charger') || name.includes('adapter')) return '/icons/categories/charger.png';
  if (name.includes('power') && name.includes('bank')) return '/icons/categories/power-bank.png';
  if (name.includes('cable') || name.includes('usb')) return '/icons/categories/usb-cable.png';
  if (name.includes('watch')) return '/icons/categories/smart-watch.png';
  if (name.includes('smart') || name.includes('bluetooth') || name.includes('speaker')) return '/icons/categories/smart.png';
  if (name.includes('neckband')) return '/icons/categories/neckband.png';
  if (name.includes('music') || name.includes('audio') || name.includes('headphone') || name.includes('earphone') || name.includes('earbud') || name.includes('tws')) return '/icons/categories/music.png';

  // Fallbacks
  if (name.includes('phone') || name.includes('mobile')) return Smartphone;
  if (name.includes('fashion') || name.includes('cloth') || name.includes('shirt') || name.includes('apparel') || name.includes("men's") || name.includes("women's")) return Shirt;
  if (name.includes('home') || name.includes('furniture') || name.includes('decor')) return Home;
  if (name.includes('electronic') || name.includes('computer') || name.includes('pc') || name.includes('laptop')) return Monitor;
  if (name.includes('bag') || name.includes('luggage')) return ShoppingBag;
  if (name.includes('sport') || name.includes('fitness') || name.includes('outdoor')) return Dumbbell;
  if (name.includes('book') || name.includes('stationery')) return Book;
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
  if (name.includes('food') || name.includes('grocery') || name.includes('drink') || name.includes('kitchen')) return Coffee;
  if (name.includes('health') || name.includes('beauty') || name.includes('care') || name.includes('makeup')) return Heart;
  if (name.includes('game') || name.includes('toy')) return Gamepad;
  if (name.includes('camera') || name.includes('photo')) return Camera;
  if (name.includes('gift') || name.includes('party')) return Gift;
  return Box;
};

const SidebarItem = React.memo(({ icon: Icon, label, href, active, count, isCollapsed, onClick }) => (
  <Link
    href={href || "#"}
    onClick={onClick}
    className={`group relative flex items-center px-[12px] py-[10px] mb-[2px] rounded-apple-sm transition-all duration-200 ${
      active
        ? "bg-[#e5e5ea] text-apple-ink dark:bg-[#2c2c2e] dark:text-white"
        : "text-apple-ink dark:text-white hover:bg-[#f2f2f7] dark:hover:bg-[#1c1c1e]"
    }`}
  >
    <div className="relative z-10 flex items-center gap-3 w-full">
      {Icon && (
        <div className="flex items-center justify-center shrink-0 transition-all duration-300 group-hover:animate-jelly origin-center">
          <Icon
            className={`w-[18px] h-[18px] transform transition-transform duration-300 origin-center ${isCollapsed ? 'scale-[1.35]' : 'scale-100'} ${
              active ? "stroke-[2.5px] text-apple-ink dark:text-white" : "stroke-[2px] text-apple-ink dark:text-white opacity-80"
            }`}
          />
        </div>
      )}
      <span className={`text-[14px] font-sans tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'opacity-100 lg:max-w-[200px] w-auto'}`}>
        {label}
      </span>
      {count && (
        <span
          className={`ml-auto shrink-0 relative z-10 text-[12px] font-sans font-bold py-[2px] rounded-apple-pill overflow-hidden transition-all duration-300 flex items-center justify-center ${isCollapsed ? 'lg:opacity-0 lg:max-w-0 lg:px-0 lg:border-0 lg:m-0' : 'opacity-100 lg:max-w-[40px] px-[8px]'} ${
            active
              ? "bg-white text-apple-ink dark:bg-black dark:text-white shadow-sm"
              : "bg-apple-parchment dark:bg-[#1c1c1e] text-apple-muted"
          }`}
        >
          {count}
        </span>
      )}
    </div>
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-normal rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 hidden lg:block whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
));

SidebarItem.displayName = "SidebarItem";

export default function Sidebar({ isHovered, isCollapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { user } = useContext(DashboardContext) || {};
  const { t } = useLanguage();

  const q = searchParams?.get("q");
  const activeCategoryId = searchParams?.get("category_id");
  const activeSubCategoryId = searchParams?.get("subCategory_id");
  const activeChildCategoryId = searchParams?.get("childCategory_id");

  const [categories, setCategories] = useState([]);
  // Track which category is open. Initialised from URL once categories load.
  const [openCategory, setOpenCategory] = useState(null);
  const hoverTimeoutRef = React.useRef(null);

  useEffect(() => {
    api.get('/market/categories')
      .then(res => {
        const cats = res.data || res || [];
        setCategories(cats);

        // Auto-open the category whose child/sub is currently active in URL
        if (activeSubCategoryId || activeChildCategoryId || activeCategoryId) {
          for (const cat of cats) {
            if (cat._id === activeCategoryId) {
              setOpenCategory(cat._id);
              break;
            }
            const subcats = cat.subcategories || [];
            for (const sub of subcats) {
              if (sub._id === activeSubCategoryId) {
                setOpenCategory(cat._id);
                break;
              }
              const children = sub.subcategories || [];
              for (const child of children) {
                if (child._id === activeChildCategoryId) {
                  setOpenCategory(cat._id);
                  break;
                }
              }
            }
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  // When URL changes (user navigates), update openCategory to keep active tree open
  useEffect(() => {
    if (!categories.length) return;
    if (!activeCategoryId && !activeSubCategoryId && !activeChildCategoryId) return;

    for (const cat of categories) {
      if (cat._id === activeCategoryId) {
        setOpenCategory(cat._id);
        return;
      }
      const subcats = cat.subcategories || [];
      for (const sub of subcats) {
        if (sub._id === activeSubCategoryId) {
          setOpenCategory(cat._id);
          return;
        }
        const children = sub.subcategories || [];
        for (const child of children) {
          if (child._id === activeChildCategoryId) {
            setOpenCategory(cat._id);
            return;
          }
        }
      }
    }
  }, [activeCategoryId, activeSubCategoryId, activeChildCategoryId, categories]);

  // Hover open: only expand — never collapse the active category on mouse leave
  const handleMouseEnter = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenCategory(catId);
    }, 150);
  };

  const handleMouseLeave = (catId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      // Only close if this category is NOT the one that matches the active URL
      const isCatActive = categories.some(cat => {
        if (cat._id !== catId) return false;
        if (cat._id === activeCategoryId) return true;
        const subcats = cat.subcategories || [];
        for (const sub of subcats) {
          if (sub._id === activeSubCategoryId) return true;
          const children = sub.subcategories || [];
          for (const child of children) {
            if (child._id === activeChildCategoryId) return true;
          }
        }
        return false;
      });
      if (!isCatActive) {
        setOpenCategory(null);
      }
    }, 350);
  };

  const view = searchParams?.get("view");

  const leafCategories = React.useMemo(() => {
    let leaves = [];
    categories.forEach(cat => {
      const subcats = cat.subcategories || [];
      if (subcats.length === 0) {
        leaves.push({ ...cat, paramKey: 'category_id' });
      } else {
        subcats.forEach(sub => {
          const children = sub.subcategories || [];
          if (children.length === 0) {
            leaves.push({ ...sub, paramKey: 'subCategory_id' });
          } else {
            children.forEach(child => {
              leaves.push({ ...child, paramKey: 'childCategory_id' });
            });
          }
        });
      }
    });
    return leaves;
  }, [categories]);

  return (
    <aside className="h-full flex flex-col bg-transparent lg:bg-apple-canvas dark:bg-transparent lg:dark:bg-apple-canvas border-0 lg:border lg:border-apple-hairline rounded-none lg:rounded-apple-lg p-0 lg:p-3 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 hover:pr-0 transition-all custom-scrollbar">
        {/* Categories Accordion */}
        <div className="block space-y-1">
          {leafCategories.map(leaf => {
            const isActiveCat =
              (leaf.paramKey === 'category_id' && activeCategoryId === leaf._id) ||
              (leaf.paramKey === 'subCategory_id' && activeSubCategoryId === leaf._id) ||
              (leaf.paramKey === 'childCategory_id' && activeChildCategoryId === leaf._id);
            const Icon = getCategoryIcon(leaf.name);

            return (
              <div key={leaf._id} className="relative">
                <button
                  onClick={() => {
                    if (isCollapsed) return;
                    router.push(`/shop?${leaf.paramKey}=${leaf._id}`);
                  }}
                  className={`w-full group relative flex items-center justify-between px-[12px] py-[10px] mb-[2px] rounded-apple-sm transition-all duration-200 ${
                    isActiveCat
                      ? "bg-[#e5e5ea] text-apple-ink dark:bg-[#2c2c2e] dark:text-white"
                      : "text-apple-ink dark:text-white hover:bg-[#f2f2f7] dark:hover:bg-[#1c1c1e]"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    {leaf.image ? (
                      <img src={leaf.image} alt={leaf.name} className={`w-[18px] h-[18px] object-cover rounded shrink-0 transform transition-transform duration-300 origin-center ${isCollapsed ? 'scale-[1.35]' : 'scale-100'}`} />
                    ) : typeof Icon === 'string' ? (
                      <img src={Icon} alt={leaf.name} className={`w-[18px] h-[18px] object-contain shrink-0 dark:invert transform transition-transform duration-300 origin-center ${isCollapsed ? 'scale-[1.35]' : 'scale-100'}`} />
                    ) : (
                      <Icon className={`w-[18px] h-[18px] shrink-0 transform transition-transform duration-300 origin-center ${isCollapsed ? 'scale-[1.35]' : 'scale-100'} ${isActiveCat ? 'stroke-[2.5px]' : 'opacity-80'}`} />
                    )}
                    <span className={`text-[14px] font-sans whitespace-nowrap overflow-hidden transition-all duration-300 ${isActiveCat ? 'font-semibold' : 'font-normal'} ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'opacity-100 lg:max-w-[200px] w-auto'}`}>
                      {leaf.name}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/5 mx-2 my-3" />

        {/* Help */}
        <div className="space-y-1 pb-4">
          <SidebarItem
            icon={MessageCircle}
            label="Help & Feedback"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsFeedbackModalOpen(true);
            }}
            active={false}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onOpenChat={() => {
          // Dispatch custom event so ChatModal can catch it and open
          window.dispatchEvent(new CustomEvent('open-support-chat'));
        }}
      />
    </aside>
  );
}
