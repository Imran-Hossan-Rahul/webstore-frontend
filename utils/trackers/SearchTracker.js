// utils/trackers/SearchTracker.js
// Search query and interaction tracking

export class SearchTracker {
  constructor(tracker) {
    this.tracker = tracker;
    this.activeSearches = new Map();
    this.isTracking = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isTracking) return;
    
    this.isTracking = true;

    // Find all search inputs
    this.trackSearchInputs();

    // Watch for new search inputs
    this.setupSearchObserver();
  }

  stop() {
    this.isTracking = false;

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Send all search data
    this.activeSearches.forEach((searchData, searchId) => {
      this.sendSearchData(searchData);
    });
  }

  trackSearchInputs() {
    // Find search inputs by type, name, or placeholder
    const searchInputs = document.querySelectorAll(
      'input[type="search"], input[name*="search"], input[placeholder*="search"], input[placeholder*="Search"]'
    );

    searchInputs.forEach(input => {
      // ✅ PREVENT DUPLICATE LISTENERS - This fixes the 36x search counting bug
      if (input.dataset.searchTracked) return;
      input.dataset.searchTracked = 'true';

      const searchId = input.id || input.name || `search_${Date.now()}`;
      
      if (!this.activeSearches.has(searchId)) {
        this.initializeSearchTracking(input, searchId);
      }
    });
  }

  initializeSearchTracking(input, searchId) {
    let searchData = null;
    let typingTimer = null;

    // Track input (with debounce)
    input.addEventListener('input', () => {
      clearTimeout(typingTimer);

      typingTimer = setTimeout(() => {
        const query = input.value.trim();
        
        if (query.length > 0) {
          searchData = {
            searchId,
            query: {
              original: query,
              normalized: query.toLowerCase(),
              length: query.length,
              wordCount: query.split(/\s+/).length,
            },
            context: {
              timestamp: new Date(),
              searchBox: this.getSearchBoxLocation(input),
              searchType: 'site_search',
            },
            interaction: {
              clickedResults: 0,
              clickPosition: [],
              refined: false,
            },
          };

          this.activeSearches.set(searchId, searchData);
        }
      }, 500); // Wait 500ms after user stops typing
    });

    // Track form submission
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        if (searchData && searchData.query.original !== input.dataset.lastSentQuery) {
          input.dataset.lastSentQuery = searchData.query.original;
          this.sendSearchData(searchData);
        }
      });
    }

    // Track Enter key
    input.addEventListener('keydown', (e) => {
      // Prevent spamming if user holds down Enter
      if (e.key === 'Enter' && !e.repeat && searchData) {
        if (searchData.query.original !== input.dataset.lastSentQuery) {
          input.dataset.lastSentQuery = searchData.query.original;
          this.sendSearchData(searchData);
        }
      }
    });

    // ✅ NEW: Track Search CTR (Clicks on search results or links after searching)
    // We listen on the document and if a link is clicked, count it as a click
    document.addEventListener('click', (e) => {
      // If user clicked a link (a tag) or a result container
      const link = e.target.closest('a') || e.target.closest('.search-result') || e.target.closest('[class*="item"]');
      if (link && searchData) {
        searchData.interaction.clickedResults += 1;
        searchData.interaction.clickPosition.push(1); // placeholder for click position
      }
    });
  }

  async sendSearchData(searchData) {
    // Detect results (simplified - would need more sophisticated detection)
    const resultsCount = this.detectResultsCount();

    try {
      await fetch(`${this.tracker.config.apiUrl}/analytics/advanced/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.tracker.visitorId,
          sessionId: this.tracker.sessionId,
          userId: this.tracker.userId,
          page: window.location.pathname,
          query: searchData.query,
          results: {
            totalResults: resultsCount,
            hasZeroResults: resultsCount === 0,
          },
          interaction: searchData.interaction,
          context: searchData.context,
        }),
      });
    } catch (error) {
      console.error('Failed to send search data:', error);
    }
  }

  detectResultsCount() {
    // Try to find result count in common patterns
    const patterns = [
      /(\d+)\s*results?/i,
      /(\d+)\s*items?/i,
      /showing\s*(\d+)/i,
      /found\s*(\d+)/i,
    ];

    const bodyText = document.body.textContent;

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Fallback: count elements that might be results
    const possibleResults = document.querySelectorAll(
      '.result, .search-result, [class*="result"], [class*="item"]'
    );

    return possibleResults.length;
  }

  getSearchBoxLocation(input) {
    const rect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top < viewportHeight * 0.2) return 'header';
    if (rect.top > viewportHeight * 0.8) return 'footer';
    return 'inline';
  }

  setupSearchObserver() {
    this.observer = new MutationObserver(() => {
      this.trackSearchInputs();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
