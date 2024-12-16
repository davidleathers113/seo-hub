import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { useQuery } from '@tanstack/react-query';

interface ContentWritingProps {
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

export default function ContentWriting({ formData, onBack, onNext, setFormData }: ContentWritingProps) {
  const { data: generatedContent, isLoading } = useQuery({
    queryKey: ['generate-content', formData.topic, formData.outline],
    queryFn: async () => {
      // Replace with your actual API call
      return `# ${formData.topic}\n\n` + 
        formData.outline.sections.map(section => 
          `## ${section.title}\n\n${section.points.join('\n\n')}`
        ).join('\n\n');
    },
    enabled: !!formData.topic && !!formData.outline.sections.length
  });

  React.useEffect(() => {
    if (generatedContent) {
      setFormData(prev => ({
        ...prev,
        content: generatedContent
      }));
    }
  }, [generatedContent, setFormData]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Write Content</h3>
        <p className="text-sm text-muted-foreground">
          Review and edit the generated content
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Outline</h4>
          <ScrollArea className="h-[500px] rounded-md border p-4">
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

        <div className="space-y-4">
          <h4 className="font-medium">Content</h4>
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px] rounded-md border">
              <Icons.spinner className="h-6 w-6 animate-spin" />
              <span className="ml-2">Generating content...</span>
            </div>
          ) : (
            <Textarea
              value={formData.content}
              onChange={handleContentChange}
              className="h-[500px] resize-none"
              placeholder="Content will appear here..."
            />
          )}
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
          onClick={onNext}
          disabled={isLoading || !formData.content}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          Next
          <Icons.arrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
