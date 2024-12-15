import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { getNiches, createNiche } from '../api/niches';
import { onRetryStatusUpdate, retryRequest } from '../api/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/useToast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Niche } from '../types/niche';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  maxRetries: number;
  nextRetryMs: number;
  requestId?: string;
}

export function NicheSelection() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nicheName, setNicheName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    maxRetries: 0,
    nextRetryMs: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up retry status listener
    const unsubscribe = onRetryStatusUpdate((status) => {
      setRetryState({
        isRetrying: true,
        attempt: status.attempt,
        maxRetries: status.maxRetries,
        nextRetryMs: status.nextRetryMs,
        requestId: status.requestId,
      });

      // Show retry toast
      toast({
        variant: 'default',
        title: 'Retrying Connection',
        description: `Attempt ${status.attempt} of ${status.maxRetries}. Next retry in ${Math.ceil(status.nextRetryMs / 1000)}s`,
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const fetchNiches = async () => {
    try {
      const response = await getNiches();
      if (Array.isArray(response.data)) {
        setNiches(response.data);
        setError('');
        setRetryState({
          isRetrying: false,
          attempt: 0,
          maxRetries: 0,
          nextRetryMs: 0,
        });
      } else {
        throw new Error('Invalid data format received for niches');
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load niches';
      setError(errorMessage);
      // Store the request ID for retry
      const requestId = error.config?.headers?.['X-Request-ID'] as string;
      if (requestId) {
        setRetryState(prev => ({
          ...prev,
          requestId,
          isRetrying: false,
          attempt: 0,
        }));
      }
      toast({
        variant: 'destructive',
        title: 'Error Loading Niches',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNiches();
  }, []);

  const handleRetry = async () => {
    if (!retryState.requestId) return;

    setLoading(true);
    try {
      const response = await retryRequest(retryState.requestId);
      if (Array.isArray(response.data)) {
        setNiches(response.data);
        setError('');
        setRetryState({
          isRetrying: false,
          attempt: 0,
          maxRetries: 0,
          nextRetryMs: 0,
        });
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Successfully loaded niches',
        });
      }
    } catch (err) {
      const error = err as Error;
      toast({
        variant: 'destructive',
        title: 'Retry Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
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
      const response = await createNiche(nicheName);
      const newNiche = response.data;

      toast({
        variant: 'default',
        title: 'Success',
        description: 'Niche created successfully',
      });

      setNiches(prevNiches => [...prevNiches, newNiche]);
      setNicheName('');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create niche';
      toast({
        variant: 'destructive',
        title: 'Error Creating Niche',
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNicheClick = (nicheId: string) => {
    try {
      navigate(`/niches/${nicheId}`);
    } catch (err) {
      const error = err as Error;
      toast({
        variant: 'destructive',
        title: 'Navigation Error',
        description: error.message || 'Unable to view niche details. Please try again.',
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
        <p>{`${niche.pillars.length} Pillars`}</p>
        <p>Progress: {niche.progress}%</p>
        <p>Status: {niche.status}</p>
      </div>
    </Card>
  );

  const renderError = () => (
    <div className="text-center p-4">
      <p className="text-destructive">{error}</p>
      {retryState.requestId && (
        <div className="mt-4">
          <Button
            onClick={handleRetry}
            variant="outline"
            disabled={loading || retryState.isRetrying}
            className="w-full sm:w-auto"
          >
            {retryState.isRetrying ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Retrying... ({retryState.attempt}/{retryState.maxRetries})
              </>
            ) : (
              'Retry Loading Niches'
            )}
          </Button>
          {retryState.isRetrying && (
            <p className="text-xs text-muted-foreground mt-2">
              Next retry in {Math.ceil(retryState.nextRetryMs / 1000)} seconds
            </p>
          )}
        </div>
      )}
    </div>
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
            renderError()
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
