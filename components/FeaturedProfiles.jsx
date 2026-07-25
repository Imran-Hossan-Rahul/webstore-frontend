// Components/FeaturedProfiles.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import ProfileCard from "./Card/ProfileCard";
import { useRouter } from "next/navigation";

export default function FeaturedProfiles({ type, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const rowRef = useRef(null);
  const router = useRouter();

  // Fetch featured users
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/craftsmen`)
      .then((res) => res.json())
      .then((data) => data.success && setUsers(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type]);

  // Fetch total user count
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/count`)
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
  }, [users]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!users.length) return null;

  const scrollRow = (dir) =>
    rowRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  const goToAllUsersPage = () => router.push("/users");

  return (
    <div className="mb-8 mt-6 relative w-[1800px] overflow-hidden">
      {/* Title + count + arrow */}
      <div className="flex items-center ml-10 mr-6 py-5 space-x-4">
        <h2 className="text-xl font-semibold text-black">{title}</h2>

        <button
          onClick={goToAllUsersPage}
          className="flex items-center text-slate-700 hover:text-slate-900 font-medium"
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

      {/* Scrollable users */}
      <div className="flex items-center relative">
        {canScrollLeft && (
          <button
            onClick={() => scrollRow(-0.6)}
            className="absolute left-2 z-50 bg-white p-2 rounded-full shadow hover:opacity-80"
          >
            {"<"}
          </button>
        )}

        <div
          ref={rowRef}
          className="flex overflow-x-scroll  space-x-4 scroll-smooth px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {users.map((user) => (
            <div key={user._id} className="flex-shrink-0">
              <ProfileCard
                profilePic={user.profilePic}
                name={user.name}
                status={user.status}
                solo={user.workType === "solo"}
                skills={user.skills}
              />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollRow(0.6)}
            className="absolute right-2 z-50 bg-white p-2 rounded-full shadow hover:opacity-80"
          >
            {">"}
          </button>
        )}
      </div>
    </div>
  );
}

