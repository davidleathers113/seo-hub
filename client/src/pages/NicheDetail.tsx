import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

interface Pillar {
  _id: string;
  title: string;
  status: string;
  approved: boolean;
}

interface Niche {
  id: string;
  name: string;
  pillars: Pillar[];
  pillarsCount: number;
  progress: number;
  status: string;
  lastUpdated: string;
}

export const NicheDetail: React.FC = () => {
  const { id: nicheId } = useParams<{ id: string }>();
  const [niche, setNiche] = useState<Niche | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPillars, setGeneratingPillars] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNiche = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching niche with ID:', nicheId);
        const response = await api.get(`/api/niches/${nicheId}`);
        console.log('Niche response:', response.data);
        setNiche(response.data);
      } catch (error: any) {
        console.error('Error fetching niche:', error);
        setError(error.response?.data?.error || 'Failed to load niche details');
      } finally {
        setLoading(false);
      }
    };

    if (nicheId) {
      fetchNiche();
    }
  }, [nicheId]);

  const handleDeleteNiche = async () => {
    try {
      console.log(`Attempting to delete niche with ID: ${nicheId}`);
      await api.delete(`/api/niches/${nicheId}`);
      console.log('Niche deleted successfully');
      toast({
        title: "Niche deleted",
        description: "The niche has been successfully deleted.",
      });
      console.log('About to navigate to /niche-selection');
      navigate('/niche-selection');
    } catch (error: any) {
      console.error('Error deleting niche:', error);
      toast({
        title: "Error",
        description: "Failed to delete the niche. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePillars = async () => {
    try {
      setGeneratingPillars(true);
      console.log(`Generating pillars for niche: ${nicheId}`);
      const response = await api.post(`/api/niches/${nicheId}/pillars/generate`);
      console.log('Pillars generated:', response.data);

      // Update the niche state with new pillars
      setNiche(prev => prev ? {
        ...prev,
        pillars: response.data,
        pillarsCount: response.data.length
      } : null);

      toast({
        title: "Pillars generated",
        description: "Content pillars have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating pillars:', error);
      toast({
        title: "Error",
        description: "Failed to generate pillars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPillars(false);
    }
  };

  if (loading) {
    return <div>Loading niche details...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!niche) {
    return <div>No niche found</div>;
  }

  return (
    <div className="niche-detail">
      <h1>Niche Detail</h1>
      <div className="niche-info">
        <p><strong>ID:</strong> {niche.id}</p>
        <p><strong>Name:</strong> {niche.name}</p>
        <p><strong>Status:</strong> {niche.status}</p>
        <p><strong>Progress:</strong> {niche.progress}%</p>
        <p><strong>Pillars Count:</strong> {niche.pillarsCount}</p>
        <p><strong>Last Updated:</strong> {new Date(niche.lastUpdated).toLocaleDateString()}</p>
      </div>
      <div className="actions">
        <Button onClick={handleDeleteNiche} variant="destructive">Delete Niche</Button>
        {(!niche.pillars || niche.pillars.length === 0) && (
          <Button
            onClick={handleGeneratePillars}
            disabled={generatingPillars}
            data-testid="generate-pillars-button"
          >
            {generatingPillars ? 'Generating...' : 'Generate Pillars'}
          </Button>
        )}
      </div>
      {niche.pillars && niche.pillars.length > 0 ? (
        <div className="pillars-section">
          <h2>Pillars</h2>
          <ul>
            {niche.pillars.map((pillar, index) => (
              <li
                key={index}
                data-testid={`pillar-card-${pillar._id || index}`}
                className="cursor-pointer hover:bg-accent/50 transition-colors p-4 rounded-lg"
                onClick={() => navigate(`/pillars/${pillar._id}/subpillars`)}
              >
                <p><strong>Title:</strong> {pillar.title}</p>
                <p><strong>Status:</strong> {pillar.status}</p>
                <p><strong>Approved:</strong> {pillar.approved ? 'Yes' : 'No'}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No pillars created yet</p>
      )}
    </div>
  );
};
