// Inertial Smooth Scrolling Physics for Cinematic Section Navigation

let activeAnimationId: number | null = null;
let restoreScrollBehavior: (() => void) | null = null;

export function cancelInertiaScroll() {
  if (activeAnimationId !== null) {
    cancelAnimationFrame(activeAnimationId);
    activeAnimationId = null;
  }
  if (restoreScrollBehavior) {
    restoreScrollBehavior();
    restoreScrollBehavior = null;
  }
}

/**
 * Smoothly scrolls to a given Y coordinate with physical inertia / deceleration curve.
 */
export function smoothScrollToPosition(targetY: number, customDuration?: number) {
  cancelInertiaScroll();

  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  // Temporarily disable CSS scroll-behavior so programmatic requestAnimationFrame works without browser fighting
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';

  // Adaptive duration: 700ms for short distance, up to 1200ms for cross-page traversal
  const duration = customDuration ?? Math.min(1200, Math.max(700, Math.abs(distance) * 0.45));
  const startTime = performance.now();

  // Quintic ease-out: responsive initial launch with a silky, natural deceleration coast
  const easeOutQuint = (t: number): number => {
    return 1 - Math.pow(1 - t, 5);
  };

  const cancelOnUserInteraction = () => {
    cancelInertiaScroll();
  };

  const cleanup = () => {
    window.removeEventListener('wheel', cancelOnUserInteraction);
    window.removeEventListener('touchstart', cancelOnUserInteraction);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    restoreScrollBehavior = null;
  };

  restoreScrollBehavior = cleanup;

  window.addEventListener('wheel', cancelOnUserInteraction, { passive: true });
  window.addEventListener('touchstart', cancelOnUserInteraction, { passive: true });

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuint(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      activeAnimationId = requestAnimationFrame(step);
    } else {
      activeAnimationId = null;
      cleanup();
    }
  }

  activeAnimationId = requestAnimationFrame(step);
}

/**
 * Navigates to a target section accounting for fixed floating header clearance.
 */
export function smoothScrollToTarget(hrefOrId: string, headerOffset: number = 70) {
  if (!hrefOrId) return;
  const selector = hrefOrId.startsWith('#') ? hrefOrId : `#${hrefOrId}`;
  const targetEl = document.querySelector(selector);
  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const absoluteTop = rect.top + (window.pageYOffset || document.documentElement.scrollTop);
  const targetY = Math.max(0, absoluteTop - headerOffset);

  smoothScrollToPosition(targetY);
}

export function smoothScrollToTop() {
  smoothScrollToPosition(0, 850);
}

