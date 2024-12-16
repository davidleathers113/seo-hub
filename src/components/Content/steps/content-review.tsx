import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

interface ContentReviewProps {
  formData: {
    topic: string;
    keywords: string[];
    outline: {
      sections: {
        title: string;
        points: string[];
      }[];
    };
    content: string;
  };
  onBack: () => void;
  onComplete: () => Promise<void>;
}

export default function ContentReview({ formData, onBack, onComplete }: ContentReviewProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Content</h3>
        <p className="text-sm text-muted-foreground">
          Review your content before finalizing
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Topic</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formData.topic}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Outline</h4>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            {formData.outline.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2 mb-4">
                <h5 className="font-medium">{section.title}</h5>
                <ul className="list-disc list-inside space-y-1">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-sm">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Content</h4>
          <Textarea
            value={formData.content}
            readOnly
            className="h-[300px] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Complete
              <Icons.check className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
