// utils/trackers/KeystrokeTracker.js
// Keystroke timing analysis for behavioral biometrics

export class KeystrokeTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.keystrokes = [];
    this.digraphs = new Map(); // Two-key combinations
    this.trigraphs = new Map(); // Three-key combinations
    this.startTime = Date.now();
    this.lastKeyTime = 0;
    this.lastKey = null;
    this.keySequence = [];
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = Date.now();

    // Track keydown
    this.keydownHandler = (e) => {
      // Skip password fields for privacy
      if (e.target.type === 'password') return;

      // Detect Print Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        this.tracker.trackEvent('print_screen_detected', {
          timestamp: Date.now(),
          page: window.location.pathname,
        });
      }

      const now = Date.now();
      const keyCategory = this.categorizeKey(e.key);
      
      // Calculate timing
      const dwellTime = 0; // Will be calculated on keyup
      const flightTime = this.lastKeyTime > 0 ? now - this.lastKeyTime : 0;

      const keystroke = {
        keyCategory,
        keyCode: e.keyCode,
        timestamp: now - this.startTime,
        dwellTime: 0, // Placeholder
        flightTime,
        elementType: e.target.tagName.toLowerCase(),
        elementId: e.target.id || e.target.name || '',
        inputType: e.target.type || '',
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        sequenceIndex: this.keystrokes.length,
        isFirstKey: this.keystrokes.length === 0,
        keydownTime: now,
      };

      this.keystrokes.push(keystroke);
      this.keySequence.push(keyCategory);

      // Track digraphs
      if (this.lastKey) {
        const digraphKey = `${this.lastKey}-${keyCategory}`;
        this.digraphs.set(digraphKey, (this.digraphs.get(digraphKey) || 0) + 1);
      }

      // Track trigraphs
      if (this.keySequence.length >= 3) {
        const trigraphKey = this.keySequence.slice(-3).join('-');
        this.trigraphs.set(trigraphKey, (this.trigraphs.get(trigraphKey) || 0) + 1);
      }

      this.lastKey = keyCategory;
      this.lastKeyTime = now;
    };

    // Track keyup (to calculate dwell time)
    this.keyupHandler = (e) => {
      if (e.target.type === 'password') return;

      const now = Date.now();
      
      // Find the corresponding keydown event
      const lastKeystroke = this.keystrokes[this.keystrokes.length - 1];
      if (lastKeystroke && lastKeystroke.keydownTime) {
        lastKeystroke.dwellTime = now - lastKeystroke.keydownTime;
        delete lastKeystroke.keydownTime;
      }
    };

    // Attach listeners
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);

    // Periodic flush
    this.flushInterval = setInterval(() => this.flush(), 15000); // Every 15 seconds
  }

  stop() {
    this.isTracking = false;

    // Remove listeners
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('keyup', this.keyupHandler);

    // Clear interval
    if (this.flushInterval) clearInterval(this.flushInterval);

    // Final flush
    this.flush();
  }

  flush() {
    if (this.keystrokes.length === 0) return;

    // Calculate metrics
    const metrics = this.calculateMetrics();

    // Convert digraphs and trigraphs to arrays
    const digraphs = Array.from(this.digraphs.entries()).map(([keys, frequency]) => {
      const [key1, key2] = keys.split('-');
      return { key1, key2, frequency };
    });

    const trigraphs = Array.from(this.trigraphs.entries()).map(([keys, frequency]) => ({
      keys: keys.split('-'),
      frequency,
    }));

    // Add to tracker buffer
    this.tracker.keystrokeBuffer.push(...this.keystrokes);

    // Send aggregated data
    this.tracker.sendData('/track/advanced/keystroke', {
      keystrokes: this.keystrokes,
      digraphs,
      trigraphs,
      metrics,
    });

    // Reset
    this.keystrokes = [];
    this.digraphs.clear();
    this.trigraphs.clear();
    this.keySequence = [];
    this.startTime = Date.now();
  }

  calculateMetrics() {
    if (this.keystrokes.length === 0) return {};

    const dwellTimes = this.keystrokes.map(k => k.dwellTime).filter(Boolean);
    const flightTimes = this.keystrokes.map(k => k.flightTime).filter(Boolean);

    const totalTime = this.keystrokes[this.keystrokes.length - 1].timestamp;
    const totalKeys = this.keystrokes.length;
    const backspaceCount = this.keystrokes.filter(k => k.keyCategory === 'backspace').length;
    const pasteCount = this.keystrokes.filter(k => k.ctrlKey && k.keyCategory === 'letter').length;

    // Calculate WPM (assuming average word length of 5 characters)
    const wpm = totalTime > 0 ? (totalKeys / 5) / (totalTime / 60000) : 0;
    const cpm = totalTime > 0 ? totalKeys / (totalTime / 60000) : 0;

    // Calculate standard deviations
    const avgDwell = dwellTimes.length > 0 ? dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length : 0;
    const avgFlight = flightTimes.length > 0 ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length : 0;

    const stdDevDwell = dwellTimes.length > 0 ? Math.sqrt(
      dwellTimes.reduce((sum, val) => sum + Math.pow(val - avgDwell, 2), 0) / dwellTimes.length
    ) : 0;

    const stdDevFlight = flightTimes.length > 0 ? Math.sqrt(
      flightTimes.reduce((sum, val) => sum + Math.pow(val - avgFlight, 2), 0) / flightTimes.length
    ) : 0;

    // Rhythm consistency (lower stdDev = more consistent)
    const rhythmConsistency = avgFlight > 0 ? 100 - Math.min((stdDevFlight / avgFlight) * 100, 100) : 0;

    // Typing cadence
    let typingCadence = 'medium';
    if (wpm > 60) typingCadence = 'fast';
    else if (wpm < 30) typingCadence = 'slow';
    if (avgFlight > 0 && stdDevFlight > avgFlight * 0.5) typingCadence = 'irregular';

    return {
      totalKeystrokes: totalKeys,
      wpm: Math.round(wpm),
      cpm: Math.round(cpm),
      avgDwellTime: Math.round(avgDwell),
      stdDevDwellTime: Math.round(stdDevDwell),
      avgFlightTime: Math.round(avgFlight),
      stdDevFlightTime: Math.round(stdDevFlight),
      rhythmConsistency: Math.round(rhythmConsistency),
      typingCadence,
      backspaceCount,
      backspaceRatio: totalKeys > 0 ? backspaceCount / totalKeys : 0,
      pasteCount,
      duration: totalTime,
    };
  }

  categorizeKey(key) {
    if (!key) return 'unknown';
    if (/^[a-zA-Z]$/.test(key)) return 'letter';
    if (/^[0-9]$/.test(key)) return 'number';
    if (key === 'Backspace') return 'backspace';
    if (key === 'Enter') return 'enter';
    if (key === 'Tab') return 'navigation';
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return 'modifier';
    if (key.startsWith('Arrow')) return 'navigation';
    if (key.startsWith('F') && key.length <= 3) return 'function';
    return 'special';
  }
}
