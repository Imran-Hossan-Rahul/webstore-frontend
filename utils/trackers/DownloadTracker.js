// utils/trackers/DownloadTracker.js
// Tracks file downloads, speeds, and completion rates

export class DownloadTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    this.isTracking = true;

    // Intercept clicks on download links
    this.downloadHandler = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const isDownload = link.hasAttribute('download') || 
                        /\.(pdf|zip|rar|exe|msi|dmg|pkg|mp4|mp3|wav|jpg|png|gif)$/i.test(link.href);

      if (isDownload) {
        this.trackDownload(link.href, link.getAttribute('download') || 'unnamed');
      }
    };

    document.addEventListener('click', this.downloadHandler);
  }

  stop() {
    this.isTracking = false;
    document.removeEventListener('click', this.downloadHandler);
  }

  async trackDownload(url, filename) {
    const startTime = Date.now();
    
    this.tracker.trackEvent('download_started', {
      url,
      filename,
      timestamp: startTime,
    });

    // We can't easily track actual download completion without a proxy or service craftsman
    // but we can track the intent and metadata
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      const type = response.headers.get('content-type');

      this.tracker.sendData('/track/advanced/download', {
        url,
        filename,
        fileSize: size ? parseInt(size) : 0,
        fileType: type,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Fallback if HEAD request fails (CORS etc)
      this.tracker.sendData('/track/advanced/download', {
        url,
        filename,
        timestamp: Date.now(),
      });
    }
  }
}
