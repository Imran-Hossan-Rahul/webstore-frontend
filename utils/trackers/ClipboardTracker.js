// utils/trackers/ClipboardTracker.js
// Clipboard activity tracking with security analysis

export class ClipboardTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;

    // Track copy events
    this.copyHandler = (e) => {
      const selection = window.getSelection();
      const text = selection.toString();

      this.trackClipboardEvent('copy', text, e.target);
    };

    // Track cut events
    this.cutHandler = (e) => {
      const selection = window.getSelection();
      const text = selection.toString();

      this.trackClipboardEvent('cut', text, e.target);
    };

    // Track paste events
    this.pasteHandler = (e) => {
      const text = e.clipboardData?.getData('text') || '';

      this.trackClipboardEvent('paste', text, e.target);
    };

    // Attach listeners
    document.addEventListener('copy', this.copyHandler);
    document.addEventListener('cut', this.cutHandler);
    document.addEventListener('paste', this.pasteHandler);
  }

  stop() {
    this.isTracking = false;

    // Remove listeners
    document.removeEventListener('copy', this.copyHandler);
    document.removeEventListener('cut', this.cutHandler);
    document.removeEventListener('paste', this.pasteHandler);
  }

  async trackClipboardEvent(eventType, text, target) {
    // Analyze content (privacy-safe)
    const analysis = this.analyzeContent(text);

    // Get source/target context
    const context = this.getElementContext(target);

    // Detect behavior patterns
    const behavior = this.detectBehavior(eventType);

    // Send to backend
    this.tracker.sendData('/track/advanced/clipboard', {
      eventType,
      content: {
        length: text.length,
        type: 'text/plain',
        text: text.substring(0, 100),
        timeSincePageLoad: Date.now() - this.tracker.startTime,
      },
      source: eventType !== 'paste' ? context : undefined,
      target: eventType === 'paste' ? context : undefined,
      behavior,
    });
  }

  analyzeContent(text) {
    return {
      hasUrls: /https?:\/\/[^\s]+/.test(text),
      hasEmails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
      hasPhoneNumbers: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
      hasCode: /<[^>]+>|function\s*\(|const\s+\w+\s*=/.test(text),
      lineCount: (text.match(/\n/g) || []).length + 1,
      wordCount: text.split(/\s+/).length,
    };
  }

  getElementContext(element) {
    if (!element) return {};

    return {
      element: this.getSelector(element),
      elementType: element.tagName?.toLowerCase(),
      elementId: element.id,
      elementClass: element.className,
      isEditable: element.isContentEditable || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA',
      isPasswordField: element.type === 'password',
      isFormField: element.tagName === 'INPUT' || element.tagName === 'TEXTAREA',
      fieldName: element.name || element.id,
    };
  }

  detectBehavior(eventType) {
    // Detect rapid clipboard operations
    const now = Date.now();
    if (!this.lastClipboardTime) {
      this.lastClipboardTime = now;
      this.clipboardCount = 1;
    } else {
      const timeSinceLast = now - this.lastClipboardTime;
      if (timeSinceLast < 1000) {
        this.clipboardCount++;
      } else {
        this.clipboardCount = 1;
      }
      this.lastClipboardTime = now;
    }

    return {
      isRapidFire: this.clipboardCount > 3,
      usedCtrlC: eventType === 'copy',
      usedCtrlV: eventType === 'paste',
      usedCtrlX: eventType === 'cut',
    };
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
