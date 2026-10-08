interface ScrollAnchorProps {
  id: string;
}

/**
 * Invisible anchor div for navigation to smoothly scroll to without 
 * interfering with layout or taking up space.
 */
export function ScrollAnchor({ id }: ScrollAnchorProps) {
  return <div id={id} className="invisible h-0" aria-hidden="true" />;
}
