/**
 * Cloudinary URL Optimizer
 * Converts standard Cloudinary URLs into highly optimized WebP/AVIF formats
 * by injecting f_auto and q_auto parameters.
 */
export const getOptimizedUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return '';
  
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
    }
  }
  
  return url;
};
