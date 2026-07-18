// Standardized animations for modals, dropdowns, and tooltips across the platform

export const hoverModalVariants = {
  hidden: { 
    opacity: 0, 
    rotateX: -15,
    scaleY: 0,
    transformOrigin: "top",
    transition: {
      duration: 0.15,
      ease: "easeIn",
      delay: 0.05 // 50ms delay before closing
    }
  },
  visible: { 
    opacity: 1, 
    rotateX: 0,
    scaleY: 1,
    transformOrigin: "top center",
    transition: {
      duration: 0.4, // 150ms faster
      ease: [0.23, 1, 0.32, 1] // Beautiful spring-like ease out
    }
  }
};

export const tooltipVariants = {
  hidden: { opacity: 0, y: 5, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};
