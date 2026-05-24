// utils/trackers/VideoTracker.js
// Video engagement tracking

export class VideoTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.activeVideos = new Map();
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;

    // Find all videos
    this.trackVideos();

    // Watch for new videos
    this.setupVideoObserver();
  }

  stop() {
    this.isTracking = false;

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Send all video data
    this.activeVideos.forEach((videoData, videoId) => {
      this.sendVideoData(videoData);
    });
  }

  trackVideos() {
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
      const videoId = video.id || video.src || `video_${Date.now()}`;
      
      if (!this.activeVideos.has(videoId)) {
        this.initializeVideoTracking(video, videoId);
      }
    });
  }

  initializeVideoTracking(video, videoId) {
    const videoData = {
      videoId,
      video: {
        id: videoId,
        title: video.title || document.title,
        url: video.src || video.currentSrc,
        duration: video.duration,
        type: 'native',
      },
      events: [],
      metrics: {
        playCount: 0,
        pauseCount: 0,
        seekCount: 0,
        volumeChanges: 0,
        fullscreenCount: 0,
      },
      session: {
        startTime: new Date(),
        completed: false,
        completionPercentage: 0,
      },
      watchPattern: {
        milestones: {
          started: false,
          reached25: false,
          reached50: false,
          reached75: false,
          reached100: false,
        },
      },
    };

    // Track play
    video.addEventListener('play', () => {
      videoData.metrics.playCount++;
      videoData.events.push({
        timestamp: new Date(),
        videoTime: video.currentTime,
        eventType: 'play',
      });

      if (!videoData.watchPattern.milestones.started) {
        videoData.watchPattern.milestones.started = true;
      }
    });

    // Track pause
    video.addEventListener('pause', () => {
      videoData.metrics.pauseCount++;
      videoData.events.push({
        timestamp: new Date(),
        videoTime: video.currentTime,
        eventType: 'pause',
      });
    });

    // Track ended
    video.addEventListener('ended', () => {
      videoData.session.completed = true;
      videoData.session.completedAt = new Date();
      videoData.watchPattern.milestones.reached100 = true;
      
      videoData.events.push({
        timestamp: new Date(),
        videoTime: video.currentTime,
        eventType: 'ended',
      });

      this.sendVideoData(videoData);
    });

    // Track seeking
    video.addEventListener('seeking', () => {
      videoData.metrics.seekCount++;
      videoData.events.push({
        timestamp: new Date(),
        videoTime: video.currentTime,
        eventType: 'seeking',
      });
    });

    // Track volume change
    video.addEventListener('volumechange', () => {
      videoData.metrics.volumeChanges++;
      videoData.events.push({
        timestamp: new Date(),
        videoTime: video.currentTime,
        eventType: 'volumechange',
        data: { volume: video.volume, muted: video.muted },
      });
    });

    // Track time update (for milestones)
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;

      const progress = (video.currentTime / video.duration) * 100;
      videoData.session.completionPercentage = progress;

      // Check milestones
      if (progress >= 25 && !videoData.watchPattern.milestones.reached25) {
        videoData.watchPattern.milestones.reached25 = true;
        videoData.events.push({
          timestamp: new Date(),
          videoTime: video.currentTime,
          eventType: 'milestone_25',
        });
      }

      if (progress >= 50 && !videoData.watchPattern.milestones.reached50) {
        videoData.watchPattern.milestones.reached50 = true;
        videoData.events.push({
          timestamp: new Date(),
          videoTime: video.currentTime,
          eventType: 'milestone_50',
        });
      }

      if (progress >= 75 && !videoData.watchPattern.milestones.reached75) {
        videoData.watchPattern.milestones.reached75 = true;
        videoData.events.push({
          timestamp: new Date(),
          videoTime: video.currentTime,
          eventType: 'milestone_75',
        });
      }
    });

    // Track fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === video) {
        videoData.metrics.fullscreenCount++;
        videoData.events.push({
          timestamp: new Date(),
          videoTime: video.currentTime,
          eventType: 'fullscreenchange',
          data: { fullscreen: true },
        });
      }
    });

    this.activeVideos.set(videoId, videoData);

    // Periodic update
    setInterval(() => {
      if (videoData.events.length > 10) {
        this.sendVideoData(videoData);
        videoData.events = [];
      }
    }, 30000); // Every 30 seconds
  }

  async sendVideoData(videoData) {
    try {
      await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.tracker.visitorId,
          sessionId: this.tracker.sessionId,
          userId: this.tracker.userId,
          page: window.location.pathname,
          video: videoData.video,
          events: videoData.events,
          metrics: videoData.metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to send video data:', error);
    }
  }

  setupVideoObserver() {
    this.observer = new MutationObserver(() => {
      this.trackVideos();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
