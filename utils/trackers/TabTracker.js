// utils/trackers/TabTracker.js
// Tab visibility and attention tracking

export class TabTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.events = [];
    this.startTime = Date.now();
    this.lastEventTime = Date.now();
    this.currentState = document.visibilityState;
    this.isTracking = false;
    this.visibleTime = 0;
    this.hiddenTime = 0;
    this.switchCount = 0;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = Date.now();
    this.lastEventTime = Date.now();

    // Track visibility changes
    this.visibilityHandler = () => {
      const now = Date.now();
      const duration = now - this.lastEventTime;
      const newState = document.visibilityState;

      // Record event
      this.events.push({
        eventType: newState === 'visible' ? 'visible' : 'hidden',
        timestamp: new Date(),
        duration,
      });

      // Update metrics
      if (this.currentState === 'visible') {
        this.visibleTime += duration;
      } else {
        this.hiddenTime += duration;
      }

      if (this.currentState !== newState) {
        this.switchCount++;
      }

      this.currentState = newState;
      this.lastEventTime = now;
    };

    // Track focus/blur
    this.focusHandler = () => {
      const now = Date.now();
      const duration = now - this.lastEventTime;

      this.events.push({
        eventType: 'focus',
        timestamp: new Date(),
        duration,
      });

      this.lastEventTime = now;
    };

    this.blurHandler = () => {
      const now = Date.now();
      const duration = now - this.lastEventTime;

      this.events.push({
        eventType: 'blur',
        timestamp: new Date(),
        duration,
      });

      this.lastEventTime = now;
    };

    // Attach listeners
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 30000); // Every 30 seconds
  }

  stop() {
    this.isTracking = false;

    // Remove listeners
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('focus', this.focusHandler);
    window.removeEventListener('blur', this.blurHandler);

    // Clear interval
    if (this.flushInterval) clearInterval(this.flushInterval);

    // Final flush
    this.flush();
  }

  async flush() {
    if (this.events.length === 0) return;

    // Calculate final metrics
    const now = Date.now();
    const totalDuration = now - this.startTime;

    // Add remaining time to current state
    const remainingTime = now - this.lastEventTime;
    if (this.currentState === 'visible') {
      this.visibleTime += remainingTime;
    } else {
      this.hiddenTime += remainingTime;
    }

    const metrics = {
      totalSwitches: this.switchCount,
      totalTimeVisible: this.visibleTime,
      totalTimeHidden: this.hiddenTime,
      duration: totalDuration,
      visibleRatio: totalDuration > 0 ? this.visibleTime / totalDuration : 0,
      switchesPerMinute: totalDuration > 0 ? (this.switchCount / totalDuration) * 60000 : 0,
    };

    // Send to backend
    this.tracker.sendData('/track/advanced/tab', {
      events: this.events,
      metrics,
      context: {
        device: {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
        },
      },
    });

    // Reset
    this.events = [];
    this.visibleTime = 0;
    this.hiddenTime = 0;
    this.switchCount = 0;
    this.startTime = Date.now();
    this.lastEventTime = Date.now();
  }
}
