// utils/AdvancedTracker.js
import { getVisitorId } from './visitor';
import { api } from './api';

class AdvancedTracker {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_URL,
    };
    this.visitorId = getVisitorId();
    this.userId = null;
    this.isActive = false;
  }

  async init(userId = null) {
    if (typeof window === 'undefined') return;
    this.userId = userId;
    this.isActive = true;
    console.log('✅ Minimal Tracker initialized');
  }

  setUserId(userId) {
    this.userId = userId;
  }

  trackPageView(page) {
    // Only basic page view tracking logic here, or just stub it out.
    // We are keeping it completely minimal so it doesn't do deep analytics.
    console.log(`[Tracker] Page view: ${page}`);
  }

  stop() {
    this.isActive = false;
  }
}

let instance = null;
export const initTracker = (config) => {
  if (!instance) {
    instance = new AdvancedTracker(config);
  }
  return instance;
};

export const getTracker = () => instance;
