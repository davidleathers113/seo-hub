'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Layers, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'article' | 'pillar' | 'niche';
  title: string;
  timestamp: string;
  status: 'created' | 'updated' | 'deleted';
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  article: FileText,
  pillar: Layers,
  niche: Target,
};

const statusColors = {
  created: 'text-green-500',
  updated: 'text-blue-500',
  deleted: 'text-red-500',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-8">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className={statusColors[activity.status]}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                      {' • '}
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}