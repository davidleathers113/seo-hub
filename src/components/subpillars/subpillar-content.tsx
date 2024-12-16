import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

interface SubpillarContentProps {
  content: string;
  keywords?: string[];
  metaDescription?: string;
}

export function SubpillarContent({
  content,
  keywords = [],
  metaDescription
}: SubpillarContentProps) {
  return (
    <div className="space-y-6">
      {metaDescription && (
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-2">Meta Description</h3>
          <p className="text-sm text-muted-foreground">{metaDescription}</p>
        </div>
      )}
      
      {keywords.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-medium">Content</h3>
        <ScrollArea className="h-[500px] rounded-md border p-4">
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          onClick={() => window.print()}
        >
          <Icons.printer className="h-4 w-4 mr-2" />
          Print
        </button>
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          onClick={() => navigator.clipboard.writeText(content)}
        >
          <Icons.copy className="h-4 w-4 mr-2" />
          Copy
        </button>
      </div>
    </div>
  );
}
