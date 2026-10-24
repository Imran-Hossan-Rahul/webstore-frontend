import React from 'react';

export default function GlassBackground() {
  return (
    <>
      {/* Core neutral pearl white tint behind everything - Fully opaque to block dark body bg */}
      <div className="fixed inset-0 bg-[#F7F9FB] z-[0] pointer-events-none" />

      {/* Glowing ambient elements */}
      <div className="fixed inset-0 overflow-hidden z-[0] pointer-events-none">
        
        {/* Giant Center Dynamic Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[90vh] rounded-[100%] bg-gradient-to-tr from-[#D0D7DF]/20 via-[#E1E7EE]/25 to-[#E4E2F0]/15 blur-[130px] mix-blend-normal" />

        {/* Left ambient glow */}
        <div className="absolute -left-[5%] top-[10%] w-[40%] h-[700px] rounded-full bg-[#E3EDF5] opacity-[0.15] blur-[130px]" />
        
        {/* Right ambient glow */}
        <div className="absolute -right-[5%] top-[20%] w-[40%] h-[800px] rounded-full bg-[#E4E2F0] opacity-[0.15] blur-[140px]" />
        
        {/* Center/Bottom Ambient Bridge */}
        <div 
          className="absolute rounded-full bg-[#E1E7EE] opacity-[0.12] blur-[120px]"
          style={{
            left: '30%',
            top: '30%',
            width: '80%',
            height: '800px'
          }}
        />

        {/* 4 Tilted Glowing Boxes (Top, pointing towards center) */}
        {/* Left Top 1 */}
        <div 
          className="absolute rounded-r-full bg-gradient-to-r from-[#D0D7DF] to-[#D0D7DF]/0 shadow-[0_0_35px_rgba(208,215,223,0.30)] opacity-[0.35] blur-[22px]"
          style={{
            left: '0px',
            top: '120px',
            transformOrigin: 'left center',
            transform: `translateY(-50%) rotate(25deg)`,
            width: '45vw',
            maxWidth: '500px',
            height: '70px',
          }}
        />
        {/* Left Top 2 */}
        <div 
          className="absolute rounded-r-full bg-gradient-to-r from-[#E3EDF5] to-[#E3EDF5]/0 shadow-[0_0_50px_rgba(227,237,245,0.40)] opacity-[0.45] blur-[20px]"
          style={{
            left: '0px',
            top: '40px',
            transformOrigin: 'left center',
            transform: `translateY(-50%) rotate(18deg)`,
            width: '50vw',
            maxWidth: '550px',
            height: '74px',
          }}
        />
        {/* Right Top 1 */}
        <div 
          className="absolute rounded-l-full bg-gradient-to-l from-[#E4E2F0] to-[#E4E2F0]/0 shadow-[0_0_35px_rgba(228,226,240,0.30)] opacity-[0.35] blur-[22px]"
          style={{
            right: '0px',
            top: '120px',
            transformOrigin: 'right center',
            transform: `translateY(-50%) rotate(-25deg)`,
            width: '45vw',
            maxWidth: '500px',
            height: '70px',
          }}
        />
        {/* Right Top 2 */}
        <div 
          className="absolute rounded-l-full bg-gradient-to-l from-[#E1E7EE] to-[#E1E7EE]/0 shadow-[0_0_50px_rgba(225,231,238,0.40)] opacity-[0.45] blur-[20px]"
          style={{
            right: '0px',
            top: '40px',
            transformOrigin: 'right center',
            transform: `translateY(-50%) rotate(-18deg)`,
            width: '50vw',
            maxWidth: '550px',
            height: '74px',
          }}
        />

        {/* 4 Tilted Glowing Boxes (Bottom, pointing towards center) */}
        {/* Left Bottom 1 */}
        <div 
          className="absolute rounded-r-full bg-gradient-to-r from-[#D0D7DF] to-[#D0D7DF]/0 shadow-[0_0_35px_rgba(208,215,223,0.30)] opacity-[0.35] blur-[22px]"
          style={{
            left: '0px',
            bottom: '120px',
            transformOrigin: 'left center',
            transform: `translateY(50%) rotate(-25deg)`,
            width: '45vw',
            maxWidth: '500px',
            height: '70px',
          }}
        />
        {/* Left Bottom 2 */}
        <div 
          className="absolute rounded-r-full bg-gradient-to-r from-[#E1E7EE] to-[#E1E7EE]/0 shadow-[0_0_50px_rgba(225,231,238,0.40)] opacity-[0.45] blur-[20px]"
          style={{
            left: '0px',
            bottom: '40px',
            transformOrigin: 'left center',
            transform: `translateY(50%) rotate(-18deg)`,
            width: '50vw',
            maxWidth: '550px',
            height: '74px',
          }}
        />
        {/* Right Bottom 1 */}
        <div 
          className="absolute rounded-l-full bg-gradient-to-l from-[#E3EDF5] to-[#E3EDF5]/0 shadow-[0_0_35px_rgba(227,237,245,0.30)] opacity-[0.35] blur-[22px]"
          style={{
            right: '0px',
            bottom: '120px',
            transformOrigin: 'right center',
            transform: `translateY(50%) rotate(25deg)`,
            width: '45vw',
            maxWidth: '500px',
            height: '70px',
          }}
        />
        {/* Right Bottom 2 */}
        <div 
          className="absolute rounded-l-full bg-gradient-to-l from-[#E4E2F0] to-[#E4E2F0]/0 shadow-[0_0_50px_rgba(228,226,240,0.40)] opacity-[0.45] blur-[20px]"
          style={{
            right: '0px',
            bottom: '40px',
            transformOrigin: 'right center',
            transform: `translateY(50%) rotate(18deg)`,
            width: '50vw',
            maxWidth: '550px',
            height: '74px',
          }}
        />
      </div>
    </>
  );
}
