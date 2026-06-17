'use client';

import { useEffect } from 'react';

export default function ScrollAnimator() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for the layout to settle and CSS to apply before measuring intersections
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          // Filter out elements that are actually intersecting
          const intersectingEntries = entries.filter(e => e.isIntersecting);
          if (intersectingEntries.length === 0) return;

          // Add the trigger class to all elements that entered the viewport
          // Because we stripped Canva's inline styles, our clean CSS will take over!
          intersectingEntries.forEach((entry) => {
            const target = entry.target as HTMLElement;
            
            // Add our custom CSS class to trigger the clean fade-up
            target.classList.add('start-animation');

            // Stop observing once triggered
            obs.unobserve(target);
          });
        },
        { threshold: 0.05 } // Trigger when 5% is visible
      );

      // We only need to observe the containers
      const containers = document.querySelectorAll('.animation_container');
      
      containers.forEach((el) => {
        observer.observe(el);
      });
    }, 500); // 500ms delay to ensure page height expands

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
