// utils/trackers/NetworkTracker.js
// Network performance monitoring

export class NetworkTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.speedTests = [];
    this.resourceTimings = [];
    this.apiCalls = [];
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;

    // Get connection info
    this.collectConnectionInfo();

    // Monitor resource timing
    this.monitorResourceTiming();

    // Intercept fetch for API monitoring
    this.interceptFetch();

    // Periodic speed test
    this.speedTestInterval = setInterval(() => this.runSpeedTest(), 60000); // Every minute

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 30000); // Every 30 seconds
  }

  stop() {
    this.isTracking = false;

    // Clear intervals
    if (this.speedTestInterval) clearInterval(this.speedTestInterval);
    if (this.flushInterval) clearInterval(this.flushInterval);

    // Restore original fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }

    // Final flush
    this.flush();
  }

  collectConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    this.connectionInfo = {
      effectiveType: connection?.effectiveType || 'unknown',
      type: connection?.type || 'unknown',
      downlink: connection?.downlink,
      downlinkMax: connection?.downlinkMax,
      rtt: connection?.rtt,
      saveData: connection?.saveData || false,
    };
  }

  monitorResourceTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = performance.getEntriesByType('resource');

    resources.forEach(resource => {
      this.resourceTimings.push({
        name: this.sanitizeUrl(resource.name),
        type: resource.initiatorType,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        ssl: resource.secureConnectionStart > 0 ? resource.connectEnd - resource.secureConnectionStart : 0,
        ttfb: resource.responseStart - resource.requestStart,
        download: resource.responseEnd - resource.responseStart,
        total: resource.duration,
        transferSize: resource.transferSize,
        encodedBodySize: resource.encodedBodySize,
        decodedBodySize: resource.decodedBodySize,
        fromCache: resource.transferSize === 0 && resource.decodedBodySize > 0,
        protocol: resource.nextHopProtocol,
        timestamp: new Date(),
      });
    });

    // Clear performance entries to avoid memory leak
    performance.clearResourceTimings();
  }

  interceptFetch() {
    this.originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args) {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;

      try {
        const response = await self.originalFetch.apply(this, args);
        const endTime = Date.now();

        // Track API call
        self.apiCalls.push({
          endpoint: self.sanitizeUrl(url),
          method: args[1]?.method || 'GET',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          duration: endTime - startTime,
          statusCode: response.status,
          success: response.ok,
          timestamp: new Date(),
        });

        return response;
      } catch (error) {
        const endTime = Date.now();

        // Track failed API call
        self.apiCalls.push({
          endpoint: self.sanitizeUrl(url),
          method: args[1]?.method || 'GET',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          duration: endTime - startTime,
          success: false,
          error: error.message,
          timestamp: new Date(),
        });

        throw error;
      }
    };
  }

  async runSpeedTest() {
    // Simple speed test using a small image
    const testUrl = 'https://via.placeholder.com/150'; // 150x150 placeholder image
    const startTime = Date.now();

    try {
      const response = await fetch(testUrl, { cache: 'no-store' });
      const blob = await response.blob();
      const endTime = Date.now();

      const duration = (endTime - startTime) / 1000; // seconds
      const sizeBytes = blob.size;
      const sizeMB = sizeBytes / (1024 * 1024);
      const speedMbps = (sizeMB * 8) / duration; // Megabits per second

      this.speedTests.push({
        timestamp: new Date(),
        method: 'resource_timing',
        downloadSpeedMbps: speedMbps,
        downloadSpeedKbps: speedMbps * 1024,
        latencyMs: duration * 1000,
        testDuration: duration * 1000,
        bytesTransferred: sizeBytes,
        testResult: 'success',
      });
    } catch (error) {
      this.speedTests.push({
        timestamp: new Date(),
        method: 'resource_timing',
        testResult: 'failed',
      });
    }
  }

  async flush() {
    if (this.speedTests.length === 0 && this.resourceTimings.length === 0 && this.apiCalls.length === 0) return;

    // Update connection info
    this.collectConnectionInfo();

    // Monitor new resources
    this.monitorResourceTiming();

    try {
      await fetch(`${this.tracker.config.apiUrl}/track/advanced/network`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.tracker.visitorId,
          sessionId: this.tracker.sessionId,
          userId: this.tracker.userId,
          page: window.location.pathname,
          connection: this.connectionInfo,
          speedTests: this.speedTests,
          resourceTimings: this.resourceTimings.slice(-50), // Last 50 resources
          apiCalls: this.apiCalls.slice(-20), // Last 20 API calls
        }),
      });
    } catch (error) {
      console.error('Failed to send network data:', error);
    }

    // Reset
    this.speedTests = [];
    this.resourceTimings = [];
    this.apiCalls = [];
  }

  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname; // Remove query params for privacy
    } catch {
      return url;
    }
  }
}
