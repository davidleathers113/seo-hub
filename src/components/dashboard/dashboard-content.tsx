'use client';

import { StatsCards } from './stats-cards';
import { RecentActivity } from './recent-activity';
import { QuickActions } from './quick-actions';

interface DashboardContentProps {
  stats: {
    totalArticles: number;
    totalPillars: number;
    totalNiches: number;
    totalKeywords: number;
  };
  activities: Array<{
    id: string;
    type: 'article' | 'pillar' | 'niche';
    title: string;
    timestamp: string;
    status: 'created' | 'updated' | 'deleted';
  }>;
}

export function DashboardContent({ stats, activities }: DashboardContentProps) {
  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <StatsCards
          totalArticles={stats.totalArticles}
          totalPillars={stats.totalPillars}
          totalNiches={stats.totalNiches}
          totalKeywords={stats.totalKeywords}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RecentActivity activities={activities} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}