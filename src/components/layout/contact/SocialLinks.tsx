import { maskIconStyle } from '@/components/primitives/ui/maskIcon';
import { SOCIAL_LINKS } from '@/content/home/social';

export function SocialLinks() {
  return (
    <div className="flex gap-[24px]">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="w-[44px] h-[44px] flex-shrink-0 hover:opacity-80 transition-opacity"
          style={maskIconStyle(link.iconSrc)}
        />
      ))}
    </div>
  );
}
