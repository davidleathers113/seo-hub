
// Unit tests for: PillarTreeView

import { fireEvent, render, screen } from '@testing-library/react';
import { useNavigate } from "react-router-dom";
import { PillarTreeView } from '../PillarTreeView';
import "@testing-library/jest-dom";

// Mock the useNavigate hook from react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe('PillarTreeView() PillarTreeView method', () => {
  const mockNavigate = jest.fn();
  const mockOnModify = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  describe('Happy Paths', () => {
    it('should render pillars and subpillars correctly', () => {
      const pillars = [
        {
          id: 'pillar1',
          title: 'Pillar 1',
          status: 'approved',
          subpillars: [
            { id: 'subpillar1', title: 'Subpillar 1', status: 'research', progress: 50 },
          ],
        },
      ];

      render(<PillarTreeView pillars={pillars} onModify={mockOnModify} />);

      expect(screen.getByText('Pillar 1')).toBeInTheDocument();
      expect(screen.getByText('1 subpillars')).toBeInTheDocument();
      expect(screen.queryByText('Subpillar 1')).not.toBeInTheDocument();
    });

    it('should expand and collapse pillars on click', () => {
      const pillars = [
        {
          id: 'pillar1',
          title: 'Pillar 1',
          status: 'approved',
          subpillars: [
            { id: 'subpillar1', title: 'Subpillar 1', status: 'research', progress: 50 },
          ],
        },
      ];

      render(<PillarTreeView pillars={pillars} onModify={mockOnModify} />);

      const trigger = screen.getByText('Pillar 1');
      fireEvent.click(trigger);

      expect(screen.getByText('Subpillar 1')).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.queryByText('Subpillar 1')).not.toBeInTheDocument();
    });

    it('should navigate to subpillar detail on subpillar click', () => {
      const pillars = [
        {
          id: 'pillar1',
          title: 'Pillar 1',
          status: 'approved',
          subpillars: [
            { id: 'subpillar1', title: 'Subpillar 1', status: 'research', progress: 50 },
          ],
        },
      ];

      render(<PillarTreeView pillars={pillars} onModify={mockOnModify} />);

      const trigger = screen.getByText('Pillar 1');
      fireEvent.click(trigger);

      const subpillarButton = screen.getByText('Subpillar 1');
      fireEvent.click(subpillarButton);

      expect(mockNavigate).toHaveBeenCalledWith('/subpillar-detail/subpillar1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pillars array gracefully', () => {
      render(<PillarTreeView pillars={[]} onModify={mockOnModify} />);

      expect(screen.queryByText('subpillars')).not.toBeInTheDocument();
    });

    it('should handle pillars with no subpillars', () => {
      const pillars = [
        {
          id: 'pillar1',
          title: 'Pillar 1',
          status: 'approved',
          subpillars: [],
        },
      ];

      render(<PillarTreeView pillars={pillars} onModify={mockOnModify} />);

      expect(screen.getByText('0 subpillars')).toBeInTheDocument();
    });

    it('should not break when onModify is not provided', () => {
      const pillars = [
        {
          id: 'pillar1',
          title: 'Pillar 1',
          status: 'approved',
          subpillars: [
            { id: 'subpillar1', title: 'Subpillar 1', status: 'research', progress: 50 },
          ],
        },
      ];

      render(<PillarTreeView pillars={pillars} onModify={undefined as any} />);

      const trigger = screen.getByText('Pillar 1');
      fireEvent.click(trigger);

      expect(screen.getByText('Subpillar 1')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: PillarTreeView
