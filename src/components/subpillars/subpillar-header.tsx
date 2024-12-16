import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

interface SubpillarHeaderProps {
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SubpillarHeader({
  title,
  status,
  createdAt,
  updatedAt,
  onEdit,
  onDelete
}: SubpillarHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
            >
              <Icons.edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-destructive hover:text-destructive-foreground h-10 py-2 px-4"
            >
              <Icons.delete className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status}
        </Badge>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icons.calendar className="h-4 w-4 mr-1" />
          Created: {new Date(createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icons.clock className="h-4 w-4 mr-1" />
          Updated: {new Date(updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
