# Canva Template Animation Learnings

When migrating a static HTML/CSS template exported from Canva into a Next.js/React application, we encountered several complex issues specifically related to scroll-triggered animations.

Here are the key learnings for future sessions:

## 1. Playwright and Opacity "Visibility"
- **The Pitfall**: Playwright's `toBeVisible()` assertion considers elements with `opacity: 0` as visible because they still occupy space in the DOM.
- **The Learning**: When testing CSS animations that fade in from `0` to `1` opacity, `toBeVisible()` will return false positives even if the animation fails and the element remains completely invisible to the user.
- **The Solution**: Always explicitly assert computed CSS values for opacity (e.g., `await expect(locator).toHaveCSS('opacity', '1')`) to verify that fade animations have successfully completed.

## 2. React `dangerouslySetInnerHTML` vs Class Attributes
- **The Pitfall**: When parsing raw HTML into React via `dangerouslySetInnerHTML`, developers often mistakenly use Regex to replace `class=` with `className=`.
- **The Learning**: React expects standard HTML syntax (including `class=`) inside the raw HTML string provided to `dangerouslySetInnerHTML`. Injecting `className=` into the raw string results in a custom DOM attribute (`classname="..."`), which completely strips the element of its CSS styles and breaks Javascript `document.querySelectorAll('.class')` selections.
- **The Solution**: Leave `class=` untouched when passing HTML strings to `dangerouslySetInnerHTML`.

## 3. IntersectionObserver and Layout Race Conditions
- **The Pitfall**: When triggering animations via `IntersectionObserver` on page load, Next.js can sometimes initialize the observer *before* external CSS fully positions the absolute elements.
- **The Learning**: During the very first frame of rendering, all absolutely positioned elements may temporarily stack at `top: 0` before the CSS layout settles. If the observer is attached immediately, it will falsely detect that *every single element on the page* intersects the viewport, causing all animations to fire instantly on page load.
- **The Solution**: Add a `setTimeout` (e.g., 500ms) or wait for `document.readyState` before initializing the `IntersectionObserver` to ensure the layout has fully settled into its absolute positions.

## 4. Recreating Canva's Staggered Cascade
- **The Pitfall**: Canva elements exported with animations (e.g., `.animated`) all have hardcoded delays in the CSS (e.g., `100ms`). Traversing the DOM to stagger children inside a `.animation_container` fails because Canva actually places *every single text element into its own separate container*.
- **The Learning**: Staggering cannot be achieved by iterating over DOM children. Canva dynamically staggers elements based on when they appear on the screen.
- **The Solution**: Group elements by **Intersection Event Batching**. When the `IntersectionObserver` callback fires, collect all intersecting elements in that specific event, sort them from top-to-bottom based on their `boundingClientRect.top`, and dynamically apply increasing `animationDelay` values (+150ms per element) to recreate the true waterfall cascade.
