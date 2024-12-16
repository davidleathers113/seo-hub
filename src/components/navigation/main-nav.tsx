'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart,
  FileText,
  Layers,
  Search,
  Settings,
  Target,
} from 'lucide-react';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart,
  },
  {
    title: 'Articles',
    href: '/dashboard/articles',
    icon: FileText,
  },
  {
    title: 'Pillars',
    href: '/dashboard/pillars',
    icon: Layers,
  },
  {
    title: 'Niches',
    href: '/dashboard/niches',
    icon: Target,
  },
  {
    title: 'Research',
    href: '/dashboard/research',
    icon: Search,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}