// utils/AdvancedTracker.js
// World-Class Tracking SDK - Beats Google Analytics, Mixpanel, Hotjar combined
import { getVisitorId } from './visitor';
import { api } from './api';

class AdvancedTracker {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_URL,
      enableMouseTracking: config.enableMouseTracking !== false,
      enableKeystrokeTracking: config.enableKeystrokeTracking !== false,
      enableClipboardTracking: config.enableClipboardTracking !== false,
      enableTabTracking: config.enableTabTracking !== false,
      enableNetworkTracking: config.enableNetworkTracking !== false,
      enableDeviceTracking: config.enableDeviceTracking !== false,
      enableSessionReplay: config.enableSessionReplay !== false,
      enableFormTracking: config.enableFormTracking !== false,
      enableVideoTracking: config.enableVideoTracking !== false,
      enableSearchTracking: config.enableSearchTracking !== false,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000, // 5 seconds
      ...config
    };

    this.visitorId = getVisitorId();
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isActive = false;
    
    // Data buffers
    this.mouseBuffer = [];
    this.keystrokeBuffer = [];
    this.eventBuffer = [];
    this.interactionBuffer = [];
    
    // Trackers
    this.mouseTracker = null;
    this.keystrokeTracker = null;
    this.clipboardTracker = null;
    this.tabTracker = null;
    this.networkTracker = null;
    this.deviceTracker = null;
    this.sessionRecorder = null;
    this.formTracker = null;
    this.videoTracker = null;
    this.searchTracker = null;
    
    // Timers
    this.flushTimer = null;
    this.heartbeatTimer = null;
  }

  // Initialize tracking
  async init(userId = null) {
    if (typeof window === 'undefined') return;
    
    this.userId = userId;
    this.isActive = true;

    // Initialize all trackers
    if (this.config.enableMouseTracking) {
      const { MouseTracker } = await import('./trackers/MouseTracker');
      this.mouseTracker = new MouseTracker(this);
      this.mouseTracker.start();
    }

    if (this.config.enableKeystrokeTracking) {
      const { KeystrokeTracker } = await import('./trackers/KeystrokeTracker');
      this.keystrokeTracker = new KeystrokeTracker(this);
      this.keystrokeTracker.start();
    }

    if (this.config.enableClipboardTracking) {
      const { ClipboardTracker } = await import('./trackers/ClipboardTracker');
      this.clipboardTracker = new ClipboardTracker(this);
      this.clipboardTracker.start();
    }

    if (this.config.enableTabTracking) {
      const { TabTracker } = await import('./trackers/TabTracker');
      this.tabTracker = new TabTracker(this);
      this.tabTracker.start();
    }

    if (this.config.enableNetworkTracking) {
      const { NetworkTracker } = await import('./trackers/NetworkTracker');
      this.networkTracker = new NetworkTracker(this);
      this.networkTracker.start();
    }

    if (this.config.enableDeviceTracking) {
      const { DeviceTracker } = await import('./trackers/DeviceTracker');
      this.deviceTracker = new DeviceTracker(this);
      await this.deviceTracker.collect();
    }

    if (this.config.enableSessionReplay) {
      const { SessionRecorder } = await import('./trackers/SessionRecorder');
      this.sessionRecorder = new SessionRecorder(this);
      await this.sessionRecorder.start();
    }

    if (this.config.enableFormTracking) {
      const { FormTracker } = await import('./trackers/FormTracker');
      this.formTracker = new FormTracker(this);
      this.formTracker.start();
    }

    if (this.config.enableVideoTracking) {
      const { VideoTracker } = await import('./trackers/VideoTracker');
      this.videoTracker = new VideoTracker(this);
      this.videoTracker.start();
    }

    if (this.config.enableSearchTracking) {
      const { SearchTracker } = await import('./trackers/SearchTracker');
      this.searchTracker = new SearchTracker(this);
      this.searchTracker.start();
    }

    if (this.config.enableDownloadTracking !== false) {
      const { DownloadTracker } = await import('./trackers/DownloadTracker');
      this.downloadTracker = new DownloadTracker(this);
      this.downloadTracker.start();
    }

    // Initialize error tracking
    this.initErrorTracking();

    // 🚀 WORLD-CLASS: Emit initial visit signal to admin dashboard
    await this.sendData('/track/visit', {
      landingPath: typeof window !== 'undefined' ? window.location.pathname : '/',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      utm: {}, // Required by Joi validation
      timestamp: Date.now(),
      // Send device fingerprint if available
      ...(this.deviceTracker?.data || {})
    });

    // Start flush timer
    this.startFlushTimer();
    
    // Start heartbeat
    this.startHeartbeat();

    console.log('✅ Advanced Tracker initialized');
  }

  /**
   * Centralized method to send tracking data
   */
  async sendData(endpoint, data) {
    if (!this.isActive) return;
    
    try {
      return await api.post(endpoint, {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        userId: this.userId,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        ...data
      });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || '';
      if (!msg.toLowerCase().includes('too many requests') && error?.response?.status !== 429) {
        console.error(`[AdvancedTracker] Failed to send data to ${endpoint}:`, error);
      }
    }
  }

  // Stop tracking
  stop() {
    this.isActive = false;

    // Stop all trackers
    this.mouseTracker?.stop();
    this.keystrokeTracker?.stop();
    this.clipboardTracker?.stop();
    this.tabTracker?.stop();
    this.networkTracker?.stop();
    this.sessionRecorder?.stop();
    this.formTracker?.stop();
    this.videoTracker?.stop();
    this.searchTracker?.stop();

    // Clear timers
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    // Final flush
    this.flush();

    console.log('🛑 Advanced Tracker stopped');
  }

  // Generate session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Add event to buffer
  addEvent(type, data) {
    this.eventBuffer.push({
      type,
      data,
      timestamp: Date.now(),
    });

    if (this.eventBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Flush all buffers
  async flush() {
    if (!this.isActive) return;

    const promises = [];

    // Flush mouse data
    if (this.mouseBuffer.length > 0) {
      promises.push(this.flushMouseData());
    }

    // Flush keystroke data
    if (this.keystrokeBuffer.length > 0) {
      promises.push(this.flushKeystrokeData());
    }

    // Flush events
    if (this.eventBuffer.length > 0) {
      promises.push(this.flushEvents());
    }

    // Flush interactions (for session replay)
    if (this.interactionBuffer.length > 0) {
      promises.push(this.flushInteractions());
    }

    await Promise.allSettled(promises);
  }

  // Flush mouse data
  async flushMouseData() {
    const data = [...this.mouseBuffer];
    this.mouseBuffer = [];

    try {
      await api.post('/track/advanced/mouse', {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        userId: this.userId,
        page: window.location.pathname,
        ...data[data.length - 1], // Send latest aggregated data
      });
    } catch (error) {
      console.error('Failed to flush mouse data:', error);
    }
  }

  // Flush keystroke data
  async flushKeystrokeData() {
    const data = [...this.keystrokeBuffer];
    this.keystrokeBuffer = [];

    try {
      await api.post('/track/advanced/keystroke', {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        userId: this.userId,
        page: window.location.pathname,
        keystrokes: data,
      });
    } catch (error) {
      console.error('Failed to flush keystroke data:', error);
    }
  }

  // Flush events
  async flushEvents() {
    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await api.post('/track/event', {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        userId: this.userId,
        events,
      });
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  // Flush interactions (for session replay)
  async flushInteractions() {
    const interactions = [...this.interactionBuffer];
    this.interactionBuffer = [];

    try {
      await api.post('/analytics/advanced/replay/interaction', {
        sessionId: this.sessionId,
        interaction: interactions,
      });
    } catch (error) {
      console.error('Failed to flush interactions:', error);
    }
  }

  // Start flush timer
  startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Start heartbeat
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isActive) {
        api.post('/track/heartbeat', {
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
        }).catch(() => {});
      }
    }, 5000); // Every 5 seconds
  }

  // Initialize error tracking
  initErrorTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'runtime_error',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        type: 'promise_rejection',
      });
    });
  }

  // Track error with stack trace
  trackError(error, context = {}) {
    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      timestamp: Date.now(),
      page: window.location.pathname,
      ...context,
    };

    this.addEvent('error', errorData);
    
    // Immediate flush for critical errors
    this.sendData('/track/advanced/error', errorData);
  }

  // Track custom event
  trackEvent(eventName, properties = {}) {
    this.addEvent('custom', {
      eventName,
      properties,
      page: window.location.pathname,
      timestamp: Date.now(),
    });
  }

  // Track page view
  trackPageView(page = window.location.pathname) {
    this.addEvent('pageview', {
      page,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    });
    this.flush(); // Immediate flush for page views
  }

  // Track conversion
  trackConversion(type, value = 0) {
    this.addEvent('conversion', {
      type,
      value,
      page: window.location.pathname,
      timestamp: Date.now(),
    });
  }

  // Set user ID
  setUserId(userId) {
    this.userId = userId;
  }

  // Get session ID
  getSessionId() {
    return this.sessionId;
  }

  // Get visitor ID
  getVisitorId() {
    return this.visitorId;
  }
}

// Create singleton instance
let trackerInstance = null;

export const initTracker = (config = {}) => {
  if (!trackerInstance) {
    trackerInstance = new AdvancedTracker(config);
  }
  return trackerInstance;
};

export const getTracker = () => {
  if (!trackerInstance) {
    trackerInstance = new AdvancedTracker();
  }
  return trackerInstance;
};

export default AdvancedTracker;
