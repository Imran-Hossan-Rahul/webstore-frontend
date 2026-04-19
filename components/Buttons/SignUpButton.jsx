export default function SignInButton({ onClick, loading }) {
  return (
    <button
      type="submit"
      onClick={onClick} // parent handler
      disabled={loading} // loading হলে disable
      className="w-full bg-[#e0e5ec] rounded-[15px] p-4 text-[#3d4468] font-semibold text-base shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] relative overflow-hidden transition-all duration-300 active:scale-[0.9] hover:shadow-[12px_12px_30px_#bec3cf,-12px_-12px_30px_#ffffff]"
    >
      <span className="relative z-10">
        {loading ? "Signing up..." : "Sign Up"}
      </span>
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500"></div>
    </button>
  );
}
