
// Unit tests for: calculateNodesAndEdges


import { PillarItem } from '@/types/pillar';
import { calculateNodesAndEdges } from '../nodeCalculations';


describe('calculateNodesAndEdges() calculateNodesAndEdges method', () => {
  const mockHandleNodeUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddChild = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should return nodes and edges for a single pillar with no subpillars', () => {
      const pillars: PillarItem[] = [
        { id: '1', title: 'Pillar 1', status: 'active', subpillars: [] }
      ];

      const { initialNodes, initialEdges } = calculateNodesAndEdges(
        pillars,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toHaveLength(1);
      expect(initialEdges).toHaveLength(0);
      expect(initialNodes[0].data.label).toBe('Pillar 1');
    });

    it('should return nodes and edges for a pillar with subpillars', () => {
      const pillars: PillarItem[] = [
        {
          id: '1',
          title: 'Pillar 1',
          status: 'active',
          subpillars: [
            { id: '1-1', title: 'Subpillar 1', status: 'completed', progress: 100 }
          ]
        }
      ];

      const { initialNodes, initialEdges } = calculateNodesAndEdges(
        pillars,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toHaveLength(2);
      expect(initialEdges).toHaveLength(1);
      expect(initialNodes[1].data.label).toBe('Subpillar 1');
      expect(initialEdges[0].source).toBe('pillar-1');
      expect(initialEdges[0].target).toBe('subpillar-1-1');
    });

    it('should use saved positions from localStorage if available', () => {
      const savedPositions = {
        'pillar-1': { x: 200, y: 200 },
        'subpillar-1-1': { x: 600, y: 280 }
      };
      localStorage.setItem('nodePositions', JSON.stringify(savedPositions));

      const pillars: PillarItem[] = [
        {
          id: '1',
          title: 'Pillar 1',
          status: 'active',
          subpillars: [
            { id: '1-1', title: 'Subpillar 1', status: 'completed', progress: 100 }
          ]
        }
      ];

      const { initialNodes } = calculateNodesAndEdges(
        pillars,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes[0].position).toEqual(savedPositions['pillar-1']);
      expect(initialNodes[1].position).toEqual(savedPositions['subpillar-1-1']);
    });
  });

  describe('Edge cases', () => {
    it('should return empty arrays if pillars is null', () => {
      const { initialNodes, initialEdges } = calculateNodesAndEdges(
        null as any,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toEqual([]);
      expect(initialEdges).toEqual([]);
    });

    it('should return empty arrays if pillars is not an array', () => {
      const { initialNodes, initialEdges } = calculateNodesAndEdges(
        {} as any,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toEqual([]);
      expect(initialEdges).toEqual([]);
    });

    it('should skip invalid pillar data', () => {
      const pillars: PillarItem[] = [
        { id: '1', title: 'Pillar 1', status: 'active', subpillars: [] },
        null as any,
        { id: '', title: 'Invalid Pillar', status: 'active', subpillars: [] }
      ];

      const { initialNodes } = calculateNodesAndEdges(
        pillars,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toHaveLength(1);
      expect(initialNodes[0].data.label).toBe('Pillar 1');
    });

    it('should skip invalid subpillar data', () => {
      const pillars: PillarItem[] = [
        {
          id: '1',
          title: 'Pillar 1',
          status: 'active',
          subpillars: [
            { id: '1-1', title: 'Subpillar 1', status: 'completed', progress: 100 },
            null as any,
            { id: '', title: 'Invalid Subpillar', status: 'completed', progress: 100 }
          ]
        }
      ];

      const { initialNodes, initialEdges } = calculateNodesAndEdges(
        pillars,
        mockHandleNodeUpdate,
        mockOnDelete,
        mockOnAddChild
      );

      expect(initialNodes).toHaveLength(2);
      expect(initialEdges).toHaveLength(1);
      expect(initialNodes[1].data.label).toBe('Subpillar 1');
    });
  });
});

// End of unit tests for: calculateNodesAndEdges
