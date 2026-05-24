// utils/trackers/MouseTracker.js
// Mouse movement tracking with path compression and heatmap generation

export class MouseTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.path = [];
    this.clicks = [];
    this.scrollEvents = [];
    this.startTime = Date.now();
    this.lastMouseTime = 0;
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = Date.now();

    // Track mouse movement (throttled)
    this.mouseMoveHandler = this.throttle((e) => {
      const now = Date.now();
      this.path.push([
        e.clientX,
        e.clientY,
        now - this.startTime,
        0 // event type: 0=move
      ]);
      this.lastMouseTime = now;
    }, 100); // Sample every 100ms

    // Track clicks
    this.clickHandler = (e) => {
      this.clicks.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now() - this.startTime,
        button: e.button,
        target: this.getSelector(e.target),
        isRageClick: this.detectRageClick(e.clientX, e.clientY),
      });

      // Add to path
      this.path.push([e.clientX, e.clientY, Date.now() - this.startTime, 1]); // 1=click
    };

    // Track scroll
    this.scrollHandler = this.throttle((e) => {
      this.scrollEvents.push({
        timestamp: Date.now() - this.startTime,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        deltaY: e.deltaY,
        deltaX: e.deltaX,
      });

      // Add to path
      if (this.path.length > 0) {
        const last = this.path[this.path.length - 1];
        this.path.push([last[0], last[1], Date.now() - this.startTime, 2]); // 2=scroll
      }
    }, 200);

    // Attach listeners
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('wheel', this.scrollHandler, { passive: true });

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 10000); // Every 10 seconds
  }

  stop() {
    this.isTracking = false;

    // Remove listeners
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('click', this.clickHandler);
    document.removeEventListener('wheel', this.scrollHandler);

    // Clear interval
    if (this.flushInterval) clearInterval(this.flushInterval);

    // Final flush
    this.flush();
  }

  flush() {
    if (this.path.length === 0) return;

    // Compress path (Ramer-Douglas-Peucker algorithm)
    const compressedPath = this.compressPath(this.path);

    // Calculate metrics
    const metrics = this.calculateMetrics(compressedPath);

    // Add to tracker buffer
    this.tracker.mouseBuffer.push({
      compressedPath,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
      metrics: {
        ...metrics,
        originalPoints: this.path.length,
        duration: Date.now() - this.startTime,
      },
      clicks: this.clicks,
      scrollEvents: this.scrollEvents,
    });

    // Reset
    this.path = [];
    this.clicks = [];
    this.scrollEvents = [];
    this.startTime = Date.now();
  }

  // Compress path using RDP algorithm
  compressPath(path, epsilon = 5) {
    if (path.length < 3) return path;

    // Simple RDP implementation
    const result = [path[0]];
    let lastIndex = 0;

    for (let i = 1; i < path.length; i++) {
      const distance = this.perpendicularDistance(
        path[i],
        path[lastIndex],
        path[path.length - 1]
      );

      if (distance > epsilon || i === path.length - 1) {
        result.push(path[i]);
        lastIndex = i;
      }
    }

    return result;
  }

  // Calculate perpendicular distance
  perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    }

    const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    const clampedT = Math.max(0, Math.min(1, t));

    const nearestX = x1 + clampedT * dx;
    const nearestY = y1 + clampedT * dy;

    return Math.sqrt((x - nearestX) ** 2 + (y - nearestY) ** 2);
  }

  // Calculate metrics
  calculateMetrics(path) {
    if (path.length < 2) return {};

    let totalDistance = 0;
    let straightLineDistance = 0;
    const speeds = [];

    for (let i = 1; i < path.length; i++) {
      const dx = path[i][0] - path[i-1][0];
      const dy = path[i][1] - path[i-1][1];
      const dt = (path[i][2] - path[i-1][2]) / 1000; // seconds
      const distance = Math.sqrt(dx * dx + dy * dy);

      totalDistance += distance;

      if (dt > 0) {
        speeds.push(distance / dt);
      }
    }

    // Straight line distance
    if (path.length >= 2) {
      const dx = path[path.length - 1][0] - path[0][0];
      const dy = path[path.length - 1][1] - path[0][1];
      straightLineDistance = Math.sqrt(dx * dx + dy * dy);
    }

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

    return {
      totalDistance,
      straightLineDistance,
      straightLineRatio: totalDistance > 0 ? straightLineDistance / totalDistance : 0,
      avgSpeed,
      maxSpeed,
      curvatureIndex: totalDistance > 0 ? totalDistance / (straightLineDistance || 1) : 1,
    };
  }

  // Detect rage click
  detectRageClick(x, y) {
    const recentClicks = this.clicks.filter(c => 
      Date.now() - this.startTime - c.timestamp < 500 // Last 500ms
    );

    if (recentClicks.length < 2) return false;

    // Check if clicks are in same area
    return recentClicks.every(c => 
      Math.abs(c.x - x) < 50 && Math.abs(c.y - y) < 50
    );
  }

  // Get CSS selector for element
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
    
    return element.tagName ? element.tagName.toLowerCase() : 'unknown';
  }

  // Throttle function
  throttle(func, wait) {
    let timeout;
    let lastTime = 0;

    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        func.apply(this, args);
        lastTime = now;
      }
    };
  }
}
