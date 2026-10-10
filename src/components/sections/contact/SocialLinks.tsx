import { MaskIcon } from '@/components/primitives/ui/MaskIcon';
import { SOCIAL_LINKS } from '@/content/home/social';

export function SocialLinks() {
  return (
    <div className="flex gap-6">
      {SOCIAL_LINKS.map((link) => (
        <MaskIcon
          key={link.href}
          as="a"
          href={link.href}
          label={link.label}
          external
          src={link.iconSrc}
          size="lg"
          className="hover:opacity-80 transition-opacity"
        />
      ))}
    </div>
  );
}
