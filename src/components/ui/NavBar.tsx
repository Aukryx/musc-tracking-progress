'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, BarChart3, UtensilsCrossed } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/workout', label: 'Séance', icon: Zap },
  { href: '/progress', label: 'Progression', icon: BarChart3 },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
];

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === '/workout') return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 16, right: 16, zIndex: 40, pointerEvents: 'none' }}>
      <nav
        style={{
          pointerEvents: 'auto',
          background: 'rgba(15,15,18,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid var(--color-line)',
          borderRadius: 20,
          padding: '10px 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 4px',
                  color: active ? 'var(--color-accent)' : 'var(--color-ink-3)',
                  textDecoration: 'none',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
