"use client";
import { useState, useEffect, useRef } from "react";
import HomeTemplateCard from "./Card/HomeTemplate";
import { useRouter } from "next/navigation";

export default function FeaturedRow({ type, title }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const rowRef = useRef(null);
  const router = useRouter();

  // Fetch featured templates
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/template/featured?type=${type}`)
      .then((res) => res.json())
      .then((data) => data.success && setTemplates(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type]);

  // Fetch total template count
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/template/count`)
      .then((res) => res.json())
      .then((data) => data.success && setTotalCount(data.total))
      .catch(console.error);
  }, []);

  // Scroll arrows logic
  useEffect(() => {
    const row = rowRef.current;
    const update = () => {
      if (!row) return;
      setCanScrollLeft(row.scrollLeft > 0);
      setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth);
    };
    update();
    row?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      row?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [templates]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!templates.length) return null;

  const scrollRow = (dir) =>
    rowRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  const goToAllTemplatesPage = () => router.push("/templates");

  return (
    <div className="mb-8 mt-6 relative overflow-hidden">
      {/* Title + count + arrow */}
      {/* Title + count + arrow */}
      <div className="flex items-center ml-10 mr-6 py-5 space-x-4">
        <h2 className="text-xl font-semibold text-black">{title}</h2>

        {/* Gap দেয়ার জন্য margin বা space-x-4 ব্যবহার করেছি */}
        <button
          onClick={goToAllTemplatesPage}
          className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
        >
          <span className="mt-1">{totalCount}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mt-[1px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable templates */}
      <div className="flex items-center relative">
        {canScrollLeft && (
          <button
            onClick={() => scrollRow(-1)}
            className="absolute left-2 z-50 bg-white p-2 rounded-full shadow hover:scale-110"
          >
            {"<"}
          </button>
        )}
        <div
          ref={rowRef}
          className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth px-6"
        >
          {templates.map((t) => (
            <HomeTemplateCard key={t._id} {...t} rating={t.averageRating} />
          ))}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scrollRow(1)}
            className="absolute right-2 z-50 bg-white p-2 rounded-full shadow hover:scale-110"
          >
            {">"}
          </button>
        )}
      </div>
    </div>
  );
}
