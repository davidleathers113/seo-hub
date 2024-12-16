'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  href: string;
  label: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`;
    const label = path.charAt(0).toUpperCase() + path.slice(1);
    return { href, label };
  });
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground"
      >
        <Home className="mr-1 h-4 w-4" />
        <span>Home</span>
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <Link
            href={breadcrumb.href}
            className={`ml-1 hover:text-foreground ${
              index === breadcrumbs.length - 1 ? 'text-foreground' : ''
            }`}
          >
            {breadcrumb.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}