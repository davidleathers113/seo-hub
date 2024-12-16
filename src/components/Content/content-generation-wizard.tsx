import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import TopicSelection from './steps/topic-selection';
import OutlineGeneration from './steps/outline-generation';
import ContentWriting from './steps/content-writing';
import ContentReview from './steps/content-review';
import { FormData } from './types';

const initialFormData: FormData = {
  topic: '',
  keywords: [],
  outline: { sections: [] },
  content: ''
};

export function ContentGenerationWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    // Handle completion logic here
    console.log('Content generation completed:', formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold tracking-tight">Content Generation</h2>
        <Badge variant="secondary">Step {step} of 4</Badge>
      </div>

      <ScrollArea className="h-[600px] rounded-md border p-4">
        {step === 1 && (
          <TopicSelection
            formData={formData}
            onNext={handleNext}
            setFormData={setFormData}
          />
        )}
        {step === 2 && (
          <OutlineGeneration
            formData={formData}
            onBack={handleBack}
            onNext={handleNext}
            setFormData={setFormData}
          />
        )}
        {step === 3 && (
          <ContentWriting
            formData={formData}
            onBack={handleBack}
            onNext={handleNext}
            setFormData={setFormData}
          />
        )}
        {step === 4 && (
          <ContentReview
            formData={formData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </ScrollArea>
    </div>
  );
}
