// utils/trackers/DeviceTracker.js
// Device metrics collection - battery, permissions, hardware, sensors

export class DeviceTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.batteryHistory = [];
    this.batteryMonitorInterval = null;
  }

  async collect() {
    if (typeof window === 'undefined') return;

    const deviceMetrics = {
      visitorId: this.tracker.visitorId,
      sessionId: this.tracker.sessionId,
      userId: this.tracker.userId,
      page: window.location.pathname,
      battery: await this.collectBatteryInfo(),
      permissions: await this.collectPermissions(),
      hardware: this.collectHardwareInfo(),
      sensors: {},
      mediaDevices: await this.collectMediaDevices(),
      browserCapabilities: this.collectBrowserCapabilities(),
      privacy: this.collectPrivacySettings(),
    };

    // Send to backend
    this.tracker.sendData('/track/advanced/device', deviceMetrics);

    // Start battery monitoring
    this.startBatteryMonitoring();
  }

  async collectBatteryInfo() {
    if (!navigator.getBattery) return {};

    try {
      const battery = await navigator.getBattery();

      const batteryInfo = {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        history: [],
      };

      // Monitor battery changes
      battery.addEventListener('levelchange', () => {
        this.batteryHistory.push({
          timestamp: new Date(),
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        });
      });

      return batteryInfo;
    } catch {
      return {};
    }
  }

  async collectPermissions() {
    const permissions = {};

    // Check various permissions
    const permissionNames = ['camera', 'microphone', 'geolocation', 'notifications', 'clipboard-read', 'clipboard-write'];

    for (const name of permissionNames) {
      try {
        const result = await navigator.permissions.query({ name });
        permissions[name] = {
          status: result.state,
          requestedAt: new Date(),
        };
      } catch {
        permissions[name] = { status: 'unknown' };
      }
    }

    return permissions;
  }

  collectHardwareInfo() {
    return {
      cpuCores: navigator.hardwareConcurrency,
      deviceMemoryGB: navigator.deviceMemory,
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenOrientation: screen.orientation?.type || 'unknown',
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      maxTouchPoints: navigator.maxTouchPoints,
      touchSupport: 'ontouchstart' in window,
      hasVibration: 'vibrate' in navigator,
    };
  }

  async collectMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { cameras: [], microphones: [], speakers: [], totalDevices: 0 };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter(d => d.kind === 'videoinput').map(d => ({
        deviceId: d.deviceId.substring(0, 10), // Truncate for privacy
        label: d.label || 'Camera',
        kind: d.kind,
      }));

      const microphones = devices.filter(d => d.kind === 'audioinput').map(d => ({
        deviceId: d.deviceId.substring(0, 10),
        label: d.label || 'Microphone',
        kind: d.kind,
      }));

      const speakers = devices.filter(d => d.kind === 'audiooutput').map(d => ({
        deviceId: d.deviceId.substring(0, 10),
        label: d.label || 'Speaker',
        kind: d.kind,
      }));

      return {
        cameras,
        microphones,
        speakers,
        totalDevices: devices.length,
        hasMultipleCameras: cameras.length > 1,
        hasMultipleMicrophones: microphones.length > 1,
      };
    } catch {
      return { cameras: [], microphones: [], speakers: [], totalDevices: 0 };
    }
  }

  collectBrowserCapabilities() {
    return {
      hasWebGL: !!window.WebGLRenderingContext,
      hasWebGL2: !!window.WebGL2RenderingContext,
      hasWebRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasWebAssembly: typeof WebAssembly !== 'undefined',
      hasServiceCraftsman: 'serviceCraftsman' in navigator,
      hasWebCraftsman: typeof Craftsman !== 'undefined',
      hasIndexedDB: !!window.indexedDB,
      hasLocalStorage: !!window.localStorage,
      hasSessionStorage: !!window.sessionStorage,
      hasCookies: navigator.cookieEnabled,
      hasNotifications: 'Notification' in window,
      hasGeolocation: 'geolocation' in navigator,
      hasVibration: 'vibrate' in navigator,
      hasDeviceOrientation: 'DeviceOrientationEvent' in window,
      hasDeviceMotion: 'DeviceMotionEvent' in window,
      hasBatteryAPI: 'getBattery' in navigator,
      hasNetworkInformation: 'connection' in navigator,
      hasMediaRecorder: 'MediaRecorder' in window,
      hasClipboardAPI: 'clipboard' in navigator,
      hasPaymentRequest: 'PaymentRequest' in window,
      hasCredentialManagement: 'credentials' in navigator,
    };
  }

  collectPrivacySettings() {
    return {
      doNotTrack: navigator.doNotTrack === '1',
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
    };
  }

  startBatteryMonitoring() {
    // Monitor battery every 5 minutes
    this.batteryMonitorInterval = setInterval(async () => {
      if (!navigator.getBattery) return;

      try {
        const battery = await navigator.getBattery();
        
        // Send update if battery is low
        if (battery.level < 0.2) {
          this.tracker.sendData('/track/advanced/device', {
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              history: this.batteryHistory,
            },
          });
        }
      } catch {}
    }, 300000); // 5 minutes
  }

  stop() {
    if (this.batteryMonitorInterval) {
      clearInterval(this.batteryMonitorInterval);
    }
  }
}
