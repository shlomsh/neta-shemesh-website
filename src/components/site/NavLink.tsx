import Link from 'next/link';

/**
 * One nav link. Rule: use <Link> only for hash-free routes (/blog, /). Hash links, even
 * cross-route ones like /#about-me, always use a plain <a> so the browser does a full navigation
 * that reliably replaces the fragment.
 */
export function NavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string;
  label: string;
  className: string;
  onClick?: () => void;
}) {
  return href.startsWith('/') && !href.includes('#') ? (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  );
}
