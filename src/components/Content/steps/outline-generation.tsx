import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { useQuery } from '@tanstack/react-query';

interface OutlineGenerationProps {
  formData: {
    topic: string;
    keywords: string[];
    outline: {
      sections: {
        title: string;
        points: string[];
      }[];
    };
  };
  onBack: () => void;
  onNext: () => void;
  setFormData: React.Dispatch<React.SetStateAction<{
    topic: string;
    keywords: string[];
    outline: {
      sections: {
        title: string;
        points: string[];
      }[];
    };
    content: string;
  }>>;
}

export default function OutlineGeneration({ formData, onBack, onNext, setFormData }: OutlineGenerationProps) {
  const { data: outline, isLoading } = useQuery({
    queryKey: ['generate-outline', formData.topic],
    queryFn: async () => {
      // Replace with your actual API call
      return {
        sections: [
          {
            title: 'Introduction',
            points: ['Background', 'Purpose', 'Scope']
          },
          {
            title: 'Main Content',
            points: ['Key Point 1', 'Key Point 2', 'Key Point 3']
          },
          {
            title: 'Conclusion',
            points: ['Summary', 'Call to Action']
          }
        ]
      };
    },
    enabled: !!formData.topic
  });

  React.useEffect(() => {
    if (outline) {
      setFormData(prev => ({
        ...prev,
        outline
      }));
    }
  }, [outline, setFormData]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Generate Outline</h3>
        <p className="text-sm text-muted-foreground">
          Review and customize the generated outline for your content
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Icons.spinner className="h-6 w-6 animate-spin" />
            <span className="ml-2">Generating outline...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {formData.outline.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <h4 className="font-medium">{section.title}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-sm">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={isLoading || !formData.outline.sections.length}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          Next
          <Icons.arrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
