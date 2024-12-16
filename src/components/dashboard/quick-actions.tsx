'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'New Article',
      icon: FileText,
      description: 'Create a new article',
      onClick: () => router.push('/articles/new'),
    },
    {
      title: 'New Niche',
      icon: Target,
      description: 'Define a new niche',
      onClick: () => router.push('/niches/new'),
    },
    {
      title: 'Research',
      icon: Search,
      description: 'Start keyword research',
      onClick: () => router.push('/research'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full justify-start"
              onClick={action.onClick}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.title}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}