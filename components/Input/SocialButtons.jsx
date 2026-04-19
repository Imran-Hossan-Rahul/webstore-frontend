export default function SocialButtons() {
    return (
      <div className="flex justify-center gap-4 mb-8">
        {/* Social Buttons */}
        <button className="w-12 h-12 bg-[#e0e5ec] rounded-lg flex items-center justify-center text-[#6c7293] shadow-[6px_6px_15px_#bec3cf,-6px_-6px_15px_#ffffff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff]">
          <img className="h-7" src="/google-svgrepo-com.svg" alt="" />
        </button>
        <button className="w-12 h-12 bg-[#e0e5ec] rounded-lg flex items-center justify-center text-[#6c7293] shadow-[6px_6px_15px_#bec3cf,-6px_-6px_15px_#ffffff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff]">
          <img className="h-5" src="/twitter-154-svgrepo-com.svg" alt="" />
        </button>
        <button className="w-12 h-12 bg-[#e0e5ec] rounded-lg flex items-center justify-center text-[#6c7293] shadow-[6px_6px_15px_#bec3cf,-6px_-6px_15px_#ffffff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff]">
          <img className="h-5" src="/instagram-svgrepo-com.svg" alt="" />
        </button>
        <button className="w-12 h-12 bg-[#e0e5ec] rounded-lg flex items-center justify-center text-[#6c7293] shadow-[6px_6px_15px_#bec3cf,-6px_-6px_15px_#ffffff] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] active:shadow-[inset_3px_3px_8px_#bec3cf,inset_-3px_-3px_8px_#ffffff]">
          <img className="h-5" src="/github-142-svgrepo-com.svg" alt="" />
        </button>
      </div>
    );
}