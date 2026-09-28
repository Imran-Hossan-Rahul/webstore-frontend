"use client";

// floorCoords: { y, x, textWidth } — passed from MarketClientView via the floor-position event
const HeroBackground = ({ floorCoords = { y: 0, x: null, textWidth: 500 } }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-white overflow-hidden">
      
      {/* Background is now clean white with no grids */}

    </div>
  );
};

export default HeroBackground;
