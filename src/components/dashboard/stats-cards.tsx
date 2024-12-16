'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, Target, Users } from 'lucide-react';

interface StatsCardsProps {
  totalArticles: number;
  totalPillars: number;
  totalNiches: number;
  totalKeywords: number;
}

export function StatsCards({
  totalArticles,
  totalPillars,
  totalNiches,
  totalKeywords,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Articles',
      value: totalArticles,
      icon: FileText,
      description: 'Articles created',
    },
    {
      title: 'Content Pillars',
      value: totalPillars,
      icon: Layers,
      description: 'Active pillars',
    },
    {
      title: 'Niches',
      value: totalNiches,
      icon: Target,
      description: 'Target markets',
    },
    {
      title: 'Keywords',
      value: totalKeywords,
      icon: Users,
      description: 'Researched keywords',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}