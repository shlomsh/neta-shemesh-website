import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Clean CSS Animations', () => {
  test('Scrolling into view applies the start-animation class to trigger native CSS fade-up', async ({ page }) => {
    // Navigate to the page
    await page.goto(TARGET_URL, { waitUntil: 'load' });

    // Wait for the initial 500ms stabilization delay from ScrollAnimator
    await page.waitForTimeout(1000);

    // Get an element far down the page (e.g. How It Works? section)
    // and verify it DOES NOT have the start-animation class initially
    const targetSection = page.locator('text="איך זה עובד?"');
    const container = targetSection.locator('xpath=ancestor::*[contains(@class, "animation_container")]').first();
    
    await expect(container).not.toHaveClass(/start-animation/);

    // Scroll the element into view
    await targetSection.scrollIntoViewIfNeeded();
    
    // Wait for the observer to process
    await page.waitForTimeout(500);

    // Verify the class was added!
    await expect(container).toHaveClass(/start-animation/);
    
    // Verify the element is visible
    await expect(container).toHaveCSS('opacity', '1');

    // Protect the new relaxed easing and duration from regressions
    // We expect the computed duration to be exactly '1.5s'
    await expect(container).toHaveCSS('animation-duration', '1.5s');
  });

  test('Framer Motion ScrollReveal triggers fade-in on StepCard', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });
    
    // Find the first StepCard by its Title
    const stepCardTitle = page.locator('text="הערכה ראשונית והגדרת מטרות"').first();
    // Get its ScrollReveal parent (the motion.div)
    const motionDiv = stepCardTitle.locator('xpath=ancestor::div[contains(@class, "w-[260.58px]")]').first();
    
    // Initially, it should be opacity 0 (because we set initial={{ opacity: 0 }})
    // Note: playwright might report a tiny value or 0
    await expect(motionDiv).toHaveCSS('opacity', '0');

    // Scroll into view
    await stepCardTitle.scrollIntoViewIfNeeded();

    // Wait for the Framer Motion animation to finish (duration is 0.8s)
    await page.waitForTimeout(1000);

    // It should now be fully visible
    await expect(motionDiv).toHaveCSS('opacity', '1');
  });
});
