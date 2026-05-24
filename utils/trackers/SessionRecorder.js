// utils/trackers/SessionRecorder.js
// Session replay - record DOM snapshots and interactions

export class SessionRecorder {
  constructor(tracker) {
    this.tracker = tracker;
    this.isRecording = false;
    this.snapshots = [];
    this.interactions = [];
    this.startTime = Date.now();
  }

  async start() {
    if (typeof window === 'undefined' || this.isRecording) return;
    
    this.isRecording = true;
    this.startTime = Date.now();

    // Start recording session
    await this.startRecording();

    // Capture initial snapshot
    this.captureSnapshot('full');

    // Set up mutation observer
    this.setupMutationObserver();

    // Track interactions
    this.trackInteractions();

    // Periodic snapshot
    this.snapshotInterval = setInterval(() => {
      this.captureSnapshot('incremental');
    }, 10000); // Every 10 seconds

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 30000); // Every 30 seconds
  }

  async stop() {
    this.isRecording = false;

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Remove interaction listeners
    this.removeInteractionListeners();

    // Clear intervals
    if (this.snapshotInterval) clearInterval(this.snapshotInterval);
    if (this.flushInterval) clearInterval(this.flushInterval);

    // End recording
    await this.endRecording();
  }

  async startRecording() {
    try {
      await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/replay/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.tracker.visitorId,
          sessionId: this.tracker.sessionId,
          userId: this.tracker.userId,
          metadata: {
            device: navigator.platform,
            browser: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            isAuthenticated: !!this.tracker.userId,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to start session recording:', error);
    }
  }

  captureSnapshot(type) {
    const snapshot = {
      timestamp: Date.now() - this.startTime,
      type,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };

    if (type === 'full') {
      // Capture full DOM (simplified - in production use rrweb or similar)
      snapshot.html = this.sanitizeHTML(document.documentElement.outerHTML);
    } else {
      // Incremental snapshot (mutations)
      snapshot.mutations = this.pendingMutations || [];
      this.pendingMutations = [];
    }

    this.snapshots.push(snapshot);
  }

  setupMutationObserver() {
    this.pendingMutations = [];

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        this.pendingMutations.push({
          type: mutation.type,
          target: this.getSelector(mutation.target),
          addedNodes: mutation.addedNodes.length,
          removedNodes: mutation.removedNodes.length,
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  trackInteractions() {
    // Mouse events
    this.clickListener = (e) => {
      this.interactions.push({
        timestamp: Date.now() - this.startTime,
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        target: this.getSelector(e.target),
      });
    };

    // Scroll events
    this.scrollListener = () => {
      this.interactions.push({
        timestamp: Date.now() - this.startTime,
        type: 'scroll',
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    // Input events
    this.inputListener = (e) => {
      // Don't record actual input values for privacy
      this.interactions.push({
        timestamp: Date.now() - this.startTime,
        type: 'input',
        target: this.getSelector(e.target),
      });
    };

    document.addEventListener('click', this.clickListener);
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    document.addEventListener('input', this.inputListener);
  }

  removeInteractionListeners() {
    document.removeEventListener('click', this.clickListener);
    window.removeEventListener('scroll', this.scrollListener);
    document.removeEventListener('input', this.inputListener);
  }

  async flush() {
    if (this.snapshots.length === 0 && this.interactions.length === 0) return;

    // Send snapshots
    if (this.snapshots.length > 0) {
      try {
        await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/replay/snapshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.tracker.sessionId,
            snapshot: this.snapshots,
          }),
        });
      } catch (error) {
        console.error('Failed to send snapshots:', error);
      }
    }

    // Send interactions
    if (this.interactions.length > 0) {
      try {
        await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/replay/interaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.tracker.sessionId,
            interaction: this.interactions,
          }),
        });
      } catch (error) {
        console.error('Failed to send interactions:', error);
      }
    }

    // Reset
    this.snapshots = [];
    this.interactions = [];
  }

  async endRecording() {
    // Final flush
    await this.flush();

    // End session
    try {
      await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/replay/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.tracker.sessionId,
          analysis: {
            engagementScore: 0, // Will be calculated on backend
            hadErrors: false,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to end session recording:', error);
    }
  }

  sanitizeHTML(html) {
    // Remove sensitive data (simplified)
    return html
      .replace(/value="[^"]*"/g, 'value=""')
      .replace(/password/gi, '***');
  }

  getSelector(element) {
    if (!element) return '';
    if (element.id && typeof element.id === 'string') return `#${element.id}`;
    
    let className = '';
    if (element.className) {
      if (typeof element.className === 'string') {
        className = element.className;
      } else if (typeof element.className === 'object' && element.className.baseVal !== undefined) {
        // Handle SVG elements where className is an SVGAnimatedString
        className = element.className.baseVal;
      }
    }

    if (className) {
      const firstClass = className.trim().split(/\s+/)[0];
      if (firstClass) return `.${firstClass}`;
    }
    
    return element.tagName?.toLowerCase() || 'unknown';
  }
}
