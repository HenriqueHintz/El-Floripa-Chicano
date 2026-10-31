/**
 * Ultra-lightweight, zero-dependency Real User Monitoring (RUM) for Core Web Vitals
 * Follows Web Vitals specification (LCP, CLS, INP, FCP) via native PerformanceObserver.
 */

export interface WebVitalsMetrics {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  path: string;
  deviceType: 'mobile' | 'desktop';
  effectiveType?: string;
  timestamp: number;
}

export function initWebVitals(onReport?: (metrics: WebVitalsMetrics) => void): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const metrics: WebVitalsMetrics = {
    cls: 0,
    path: window.location.pathname,
    deviceType: window.innerWidth < 640 ? 'mobile' : 'desktop',
    timestamp: Date.now(),
  };

  const navConnection = (navigator as unknown as { connection?: { effectiveType?: string } })
    .connection;
  if (navConnection?.effectiveType) {
    metrics.effectiveType = navConnection.effectiveType;
  }

  const observers: PerformanceObserver[] = [];

  // 1. Observe FCP (First Contentful Paint)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntriesByName('first-contentful-paint')) {
        metrics.fcp = Math.round(entry.startTime);
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
    observers.push(fcpObserver);
  } catch {
    // Unsupported entry type
  }

  // 2. Observe LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = Math.round(lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);
  } catch {
    // Unsupported entry type
  }

  // 3. Observe CLS (Cumulative Layout Shift)
  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        // Exclude shifts within 500ms of user input
        if (!layoutShift.hadRecentInput && typeof layoutShift.value === 'number') {
          metrics.cls = Number(((metrics.cls || 0) + layoutShift.value).toFixed(4));
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  } catch {
    // Unsupported entry type
  }

  // 4. Observe INP / First Input Delay (Interaction to Next Paint)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEntry & { duration?: number };
        if (typeof eventEntry.duration === 'number') {
          metrics.inp = Math.max(metrics.inp || 0, Math.round(eventEntry.duration));
        }
      }
    });
    inpObserver.observe({ type: 'first-input', buffered: true });
    observers.push(inpObserver);
  } catch {
    // Unsupported entry type
  }

  // Flush report on visibility change or page hide
  const flushMetrics = () => {
    if (onReport) {
      onReport(metrics);
    } else {
      // Default: dispatch via non-blocking sendBeacon if available
      try {
        const payload = JSON.stringify(metrics);
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry', payload);
        }
      } catch {
        // Silent
      }
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushMetrics();
    }
  };

  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', flushMetrics);

  return () => {
    observers.forEach((obs) => obs.disconnect());
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', flushMetrics);
  };
}
