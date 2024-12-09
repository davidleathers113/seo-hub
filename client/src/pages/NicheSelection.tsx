import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Niche {
  id: string;
  name: string;
  pillars: Array<any>;
  pillarsCount: number;
  progress: number;
  status: string;
  lastUpdated: string;
}

interface ApiResponse {
  data: Niche[];
}

export function NicheSelection() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [nicheName, setNicheName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        console.log('Fetching niches from API');
        const response = await api.get<{ data: Niche[] }>('/niches');
        console.log('API response:', response.data);
        if (Array.isArray(response.data.data)) {
          console.log('Setting niches:', response.data.data);
          setNiches(response.data.data);
        } else {
          throw new Error('Invalid data format received for niches');
        }
      } catch (err: any) {
        console.error('Error loading niches:', err);
        setError('Error loading niches');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Failed to load niches',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNiches();
  }, [toast]);

  const validateForm = (): boolean => {
    if (!nicheName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Niche name is required',
      });
      return false;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(nicheName)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Niche name can only contain letters, numbers, and spaces',
      });
      return false;
    }
    return true;
  };

  const handleCreateNiche = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Create niche button clicked');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Making API request to create niche:', nicheName);
      const response = await api.post('/niches', { name: nicheName });
      console.log('Niche creation response:', response);

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Niche created successfully',
      });
      setNicheName('');

      // Refresh the list of niches
      console.log('Refreshing niches list...');
      const nichesResponse = await api.get<{ data: Niche[] }>('/niches');
      console.log('Updated niches:', nichesResponse.data);
      setNiches(nichesResponse.data.data);
    } catch (error: any) {
      console.error('Error creating niche:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create niche. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNicheClick = (nicheId: string) => {
    try {
      navigate(`/niches/${nicheId}`);
    } catch (err: any) {
      console.error('Error navigating to niche:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error navigating to niche',
      });
    }
  };

  const renderNiche = (niche: Niche) => {
    console.log('Rendering niche:', JSON.stringify(niche, null, 2));
    return (
      <Card
        key={niche.id}
        className="cursor-pointer niche-card"
        onClick={() => handleNicheClick(niche.id)}
        data-testid={`niche-card-${niche.id}`}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium">{niche.name}</h3>
          <p>{`${niche.pillarsCount} Pillars`}</p>
          <p>Progress: {niche.progress}%</p>
          <p>Status: {niche.status}</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="niche-selection">
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="text-2xl font-semibold leading-none tracking-tight">
            Create New Niche
          </div>
          <div className="text-sm text-muted-foreground">
            Enter a niche to generate content pillars
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nicheName">Niche Name</Label>
              <Input
                id="nicheName"
                name="nicheName"
                placeholder="e.g., Digital Marketing"
                value={nicheName}
                onChange={(e) => {
                  console.log('Input value changed:', e.target.value);
                  setNicheName(e.target.value);
                }}
                required
              />
            </div>
            <Button
              onClick={handleCreateNiche}
              disabled={submitting}
              type="button"
              className="w-full"
            >
              {submitting ? 'Creating Niche...' : 'Create Niche'}
            </Button>
          </div>
        </div>
      </Card>
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="text-2xl font-semibold leading-none tracking-tight">
            Your Niches
          </div>
          <div className="text-sm text-muted-foreground">
            Select a niche to view its content pillars
          </div>
        </div>
        <div className="p-6 pt-0">
          {loading ? (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
              <div role="progressbar" aria-label="Loading niches">
                <LoadingSpinner />
              </div>
            </div>
          ) : error ? (
            <p>{error}</p>
          ) : niches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {niches.map(renderNiche)}
            </div>
          ) : (
            <p>No niches found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}