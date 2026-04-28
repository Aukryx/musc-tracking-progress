'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, History, BarChart3, Salad } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/workout', label: 'Séance', icon: Dumbbell },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
  { href: '/nutrition', label: 'Nutrition', icon: Salad },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-t border-zinc-900">
      <div className="flex items-stretch max-w-lg mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors touch-manipulation ${
                active ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
