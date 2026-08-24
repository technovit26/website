import { EnvelopeSimple, GithubLogo, InstagramLogo, LinkedinLogo } from '@phosphor-icons/react';
import type { Person } from './data';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={label === 'Email' ? `mailto:${href}` : href}
      target={label === 'Email' ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor={label}
      onClick={(e) => e.stopPropagation()}
      className="w-7 h-7 rounded-full border border-[#84C87F]/25 flex items-center justify-center
        text-[#84C87F]/70 hover:text-[#064928] hover:bg-[#84C87F] hover:border-[#84C87F] transition-colors duration-200"
    >
      {icon}
    </a>
  );
}

export default function MemberCard({
  member,
  tag,
  size = 'md',
  aspect = 'aspect-[4/5]',
}: {
  member: Person;
  tag: string;
  size?: 'md' | 'lg';
  aspect?: string;
}) {
  const socials = [
    member.linkedin && { href: member.linkedin, label: 'LinkedIn', icon: <LinkedinLogo size={14} weight="fill" /> },
    member.instagram && { href: member.instagram, label: 'Instagram', icon: <InstagramLogo size={14} weight="fill" /> },
    member.github && { href: member.github, label: 'GitHub', icon: <GithubLogo size={14} weight="fill" /> },
    member.email && { href: member.email, label: 'Email', icon: <EnvelopeSimple size={14} weight="fill" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <div
      className="member-card group relative flex flex-col overflow-hidden rounded-lg
        border border-[#84C87F]/20 bg-[#03080a] isolate transition-colors duration-300 hover:border-[#84C87F]/50"
      style={{ boxShadow: '0 0 0 1px rgba(132,200,127,0.08), 0 20px 50px rgba(0,0,0,0.35)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#080f09] border-b border-[#84C87F]/10 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F56]/70" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#FFBD2E]/70" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#27C93F]/70" />
        </div>
        <span className="font-terminal text-[9px] uppercase tracking-[0.2em] text-[#84C87F]/50">
          {tag}
        </span>
      </div>

      <div className={`relative w-full overflow-hidden bg-[#080f09] ${aspect}`}>
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover
              grayscale contrast-110 brightness-[0.85]
              group-hover:grayscale-0 group-hover:brightness-100
              transition-[filter] duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#080f09]">
            <span
              className={`font-clash font-bold text-[#84C87F]/15 group-hover:text-[#84C87F]/25
                transition-colors duration-500 leading-none ${size === 'lg' ? 'text-6xl' : 'text-5xl'}`}
            >
              {initialsOf(member.name)}
            </span>
          </div>
        )}
        <div aria-hidden className="terminal-scanlines opacity-30 group-hover:opacity-0 transition-opacity duration-700" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col gap-2 px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <h3 className={`font-clash font-bold text-[#c2e0a5] leading-tight ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>
            {member.name}
          </h3>
          <span className="font-bold uppercase tracking-[0.15em] text-[#84C87F]/60 text-[10px]">
            {member.role}
          </span>
        </div>

        {socials.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            {socials.map((s) => (
              <SocialLink key={s.label} {...s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
