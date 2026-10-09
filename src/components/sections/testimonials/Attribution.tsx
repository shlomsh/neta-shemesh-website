import { Avatar } from './Avatar';

interface AttributionProps {
  name: string;
  role: string;
  avatarSrc: string;
}

export function Attribution({ name, role, avatarSrc }: AttributionProps) {
  return (
    <div className="flex items-center justify-between mt-auto">
      <Avatar src={avatarSrc} alt={name} />
      <div className="text-right flex-grow">
        <p className="type-body font-bold text-plum">
          {name}
        </p>
        <p className="type-small text-mauve">
          {role}
        </p>
      </div>
    </div>
  );
}
