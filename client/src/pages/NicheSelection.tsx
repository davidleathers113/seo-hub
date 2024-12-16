import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNiches, createNiche } from '../api/niches';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Niche } from '../types/niche';

function isNetworkError(error: any) {
  return error.message?.includes('network') ||
         error.message?.includes('internet') ||
         error.message?.includes('Failed to fetch');
}

export function NicheSelection() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nicheName, setNicheName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign in again to continue.',
        });
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  const fetchNiches = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getNiches();
      setNiches(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load niches';
      setError(message);

      if (isNetworkError(error)) {
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: 'Please check your internet connection and try again.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Loading Niches',
          description: message,
        });
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchNiches();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchNiches();
  };

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

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign in to create a niche.',
        });
        navigate('/login');
        return;
      }

      const { data: newNiche } = await createNiche(nicheName);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Niche created successfully',
      });

      setNiches(prevNiches => [...prevNiches, newNiche]);
      setNicheName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create niche';

      if (message.includes('sign in') || message.includes('authenticated')) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign in again to continue.',
        });
        navigate('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Creating Niche',
          description: message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNicheClick = (nicheId: string) => {
    try {
      navigate(`/niches/${nicheId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Navigation failed';
      toast({
        variant: 'destructive',
        title: 'Navigation Error',
        description: message,
      });
    }
  };

  const renderNiche = (niche: Niche) => (
    <Card
      key={niche.id}
      className="cursor-pointer niche-card hover:shadow-md transition-shadow"
      onClick={() => handleNicheClick(niche.id)}
      data-testid={`niche-card-${niche.id}`}
    >
      <div className="p-4">
        <h3 className="text-lg font-medium">{niche.name}</h3>
        <p>{`${niche.pillars?.length || 0} Pillars`}</p>
        <p>Progress: {niche.progress}%</p>
        <p>Status: {niche.status}</p>
      </div>
    </Card>
  );

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
                onChange={(e) => setNicheName(e.target.value)}
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
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center p-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
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
