/**
 * Framer-motion mock for jsdom tests.
 * motion.* components are replaced with plain divs that pass through
 * className and children so class assertions work correctly.
 */
import React from 'react';

type MotionProps = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

function makeMotionComponent(tag: string) {
  const Component = React.forwardRef<HTMLElement, MotionProps>(
    ({ children, className, ...rest }, ref) => {
      // Filter out framer-motion-specific props that would cause React warnings
      const {
        initial, animate, exit, whileInView, whileHover, whileTap,
        whileFocus, whileDrag, transition, variants, viewport,
        layout, layoutId, drag, dragConstraints, dragElastic,
        dragMomentum, onDragStart, onDragEnd, onDrag,
        onAnimationStart, onAnimationComplete,
        ...domProps
      } = rest;
      void initial; void animate; void exit; void whileInView; void whileHover;
      void whileTap; void whileFocus; void whileDrag; void transition;
      void variants; void viewport; void layout; void layoutId; void drag;
      void dragConstraints; void dragElastic; void dragMomentum;
      void onDragStart; void onDragEnd; void onDrag;
      void onAnimationStart; void onAnimationComplete;

      return React.createElement(tag, { className, ref, ...domProps }, children as any);
    }
  );
  Component.displayName = `motion.${tag}`;
  return Component;
}

const tags = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'main', 'nav', 'header', 'footer',
  'ul', 'ol', 'li', 'a', 'button', 'img', 'svg',
];

export const motion = Object.fromEntries(
  tags.map(tag => [tag, makeMotionComponent(tag)])
);

export const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children as any);

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
});

export const useInView = () => true;
export const useScroll = () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } });
export const useTransform = (v: unknown, _: unknown, __: unknown) => v;
export const useSpring = (v: unknown) => v;
export const useMotionValue = (initial: unknown) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {},
});
export const useReducedMotion = () => false;
