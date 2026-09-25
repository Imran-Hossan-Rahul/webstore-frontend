"use client";
// Card/ProfileCard.jsx
export default function ProfileCard({
  profilePic,
  name,
  status = "offline", // online / offline
  solo = true,
  skills = ["#React", "#Next.js", "#Software Development"],
}) {
  return (
    <div className="w-48 rounded-2xl p-4 flex flex-col items-center relative">
      {/* Profile Picture */}
      <div className="relative">
        <img
          src={profilePic}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-[#262626]"
        />
        {/* Status Circle */}
        <span
          className={`absolute bottom-1 right-3 w-4 h-4 rounded-full border-2 border-white ${
            status === "online" ? "bg-brand-teal" : "bg-yellow-400"
          }`}
        ></span>
      </div>

      {/* Name + Working Type */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="text-base font-medium text-slate-800 dark:text-white cursor-pointer hover:underline font-sans"
          onClick={(e) => e.preventDefault()} // prevent default, placeholder
        >
          {name}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-[#171717] text-slate-500 dark:text-slate-400 rounded-sm cursor-pointer hover:underline font-mono font-medium uppercase tracking-wider border border-slate-200 dark:border-[#262626]"
          onClick={(e) => e.preventDefault()}
        >
          {solo ? "Solo" : "Team"}
        </span>
      </div>

      {/* Skills / Hashtags */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#171717] px-2 py-1 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-[#262626] font-sans font-medium transition-colors border border-slate-200 dark:border-[#262626]"
            onClick={(e) => e.preventDefault()} // placeholder click
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
