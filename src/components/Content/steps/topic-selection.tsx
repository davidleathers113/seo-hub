import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { useQuery } from '@tanstack/react-query';
import { Database } from '@/types/database';
import { FormData } from '../types';

interface TopicSelectionProps {
  formData: FormData;
  onNext: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

type Niche = Database['public']['Tables']['niches']['Row'];

export default function TopicSelection({ formData, onNext, setFormData }: TopicSelectionProps) {
  const { data: niches, isLoading } = useQuery({
    queryKey: ['niches'],
    queryFn: async () => {
      // Replace with your actual API call
      return [
        { id: '1', name: 'Technology', description: null, user_id: '', created_at: '', updated_at: '' },
        { id: '2', name: 'Health & Wellness', description: null, user_id: '', created_at: '', updated_at: '' },
        { id: '3', name: 'Business', description: null, user_id: '', created_at: '', updated_at: '' }
      ] as Niche[];
    }
  });

  const handleNicheSelect = (value: string) => {
    const selectedNiche = niches?.find((niche) => niche.id === value);
    if (selectedNiche) {
      setFormData({
        ...formData,
        topic: selectedNiche.name,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select Topic</h3>
        <p className="text-sm text-muted-foreground">
          Choose a niche and topic for your content
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Niche</label>
          <Select
            value={formData.topic}
            onValueChange={handleNicheSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a niche" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </SelectItem>
              ) : (
                niches?.map((niche) => (
                  <SelectItem key={niche.id} value={niche.id}>
                    {niche.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {formData.topic && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Topic</label>
            <div className="flex flex-wrap gap-2">
              <Badge>{formData.topic}</Badge>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!formData.topic}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          Next
          <Icons.arrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
