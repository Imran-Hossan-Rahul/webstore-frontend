// utils/trackers/FormTracker.js
// Form interaction tracking - field-level analysis

export class FormTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.activeForms = new Map();
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;

    // Find all forms
    this.trackForms();

    // Watch for new forms
    this.setupFormObserver();
  }

  stop() {
    this.isTracking = false;

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Send all form data
    this.activeForms.forEach((formData, formId) => {
      this.sendFormData(formData);
    });
  }

  trackForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      if (!form.id && !form.name) {
        form.setAttribute('data-tracker-id', `form_${Date.now()}_${Math.random().toString(36).substring(2)}`);
      }

      const formId = form.id || form.name || form.getAttribute('data-tracker-id');
      
      if (!this.activeForms.has(formId)) {
        this.initializeFormTracking(form, formId);
      }
    });
  }

  initializeFormTracking(form, formId) {
    const formData = {
      formId,
      form: {
        id: formId,
        name: form.name,
        action: form.action,
        method: form.method,
        type: this.inferFormType(form),
      },
      fields: [],
      session: {
        startTime: new Date(),
        status: 'started',
        submitted: false,
      },
      startTime: Date.now(),
    };

    // Track all fields
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      if (field.type === 'password') return; // Skip password fields

      const fieldData = {
        name: field.name || field.id,
        id: field.id,
        type: field.type || field.tagName.toLowerCase(),
        label: this.getFieldLabel(field),
        required: field.required,
        interactions: [],
        firstFocusAt: null,
        lastBlurAt: null,
        focusCount: 0,
        inputCount: 0,
        backspaceCount: 0,
        completed: false,
      };

      formData.fields.push(fieldData);

      // Track field interactions
      this.trackField(field, fieldData, formData);
    });

    // Track form submission
    form.addEventListener('submit', (e) => {
      formData.session.submitted = true;
      formData.session.status = 'completed';
      formData.session.endTime = new Date();
      this.sendFormData(formData);
    });

    this.activeForms.set(formId, formData);
  }

  trackField(field, fieldData, formData) {
    // Focus event
    field.addEventListener('focus', () => {
      if (!fieldData.firstFocusAt) {
        fieldData.firstFocusAt = new Date();
      }
      fieldData.focusCount++;

      fieldData.interactions.push({
        type: 'focus',
        timestamp: new Date(),
      });
    });

    // Blur event
    field.addEventListener('blur', () => {
      fieldData.lastBlurAt = new Date();

      fieldData.interactions.push({
        type: 'blur',
        timestamp: new Date(),
      });

      // Check if completed
      if (field.value && field.value.length > 0) {
        fieldData.completed = true;
        fieldData.completedAt = new Date();
      }
    });

    // Input event
    field.addEventListener('input', () => {
      fieldData.inputCount++;

      fieldData.interactions.push({
        type: 'input',
        timestamp: new Date(),
        valueLength: field.value.length,
      });
    });

    // Keydown event (for backspace detection)
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        fieldData.backspaceCount++;
      }
    });

    // Paste event
    field.addEventListener('paste', () => {
      fieldData.interactions.push({
        type: 'paste',
        timestamp: new Date(),
      });
    });
  }

  async sendFormData(formData) {
    // Calculate metrics
    const totalFields = formData.fields.length;
    const completedFields = formData.fields.filter(f => f.completed).length;
    const fieldsWithErrors = 0; // Would need validation tracking

    const metrics = {
      totalFields,
      completedFields,
      completionRate: totalFields > 0 ? (completedFields / totalFields) * 100 : 0,
      fieldsWithErrors,
    };

    try {
      await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.tracker.visitorId,
          sessionId: this.tracker.sessionId,
          userId: this.tracker.userId,
          page: window.location.pathname,
          form: formData.form,
          fields: formData.fields,
          session: formData.session,
          metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to send form data:', error);
    }
  }

  setupFormObserver() {
    this.observer = new MutationObserver(() => {
      this.trackForms();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  inferFormType(form) {
    const action = form.action.toLowerCase();
    const inputs = Array.from(form.querySelectorAll('input')).map(i => i.type);

    if (action.includes('login') || inputs.includes('password')) return 'login';
    if (action.includes('signup') || action.includes('register')) return 'signup';
    if (action.includes('checkout') || action.includes('payment')) return 'checkout';
    if (action.includes('contact')) return 'contact';
    if (action.includes('search')) return 'search';
    return 'other';
  }

  getFieldLabel(field) {
    // Try to find associated label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Try parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

    // Use placeholder or name
    return field.placeholder || field.name || field.id || '';
  }
}
