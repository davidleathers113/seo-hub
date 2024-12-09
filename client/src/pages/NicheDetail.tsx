import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

interface Niche {
  id: string;
  name: string;
  pillars: any[];
  pillarsCount: number;
  progress: number;
  status: string;
  lastUpdated: string;
}

export const NicheDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [niche, setNiche] = useState<Niche | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNiche = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching niche with ID:', id);
        const response = await api.get(`/niches/${id}`);
        console.log('Niche response:', response.data);
        setNiche(response.data.data);
      } catch (error: any) {
        console.error('Error fetching niche:', error);
        setError(error.response?.data?.error || 'Failed to load niche details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNiche();
    }
  }, [id]);

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

      {niche.pillars && niche.pillars.length > 0 ? (
        <div className="pillars-section">
          <h2>Pillars</h2>
          <ul>
            {niche.pillars.map((pillar, index) => (
              <li key={index}>
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
