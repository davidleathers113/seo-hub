import { OutlineService } from '../../../../services/OutlineService';
import { createUpdateSectionsHandler } from '../update-sections';
import {
  createTestHandler,
  mockAuthenticatedRequest,
  createMockResponse,
  mockService,
  expectSuccess,
  expectError
} from '../../../../test/helpers/route-testing';
import { Outline, OutlineSection } from '../../../../database/interfaces';

describe('Update Sections Handler', () => {
  const mockSections: OutlineSection[] = [
    {
      title: 'Section 1',
      contentPoints: [{ point: 'Point 1', generated: false }],
      order: 0
    },
    {
      title: 'Section 2',
      contentPoints: [{ point: 'Point 2', generated: false }],
      order: 1
    }
  ];

  const mockOutline: Outline = {
    id: 'outline-1',
    subpillarId: 'subpillar-1',
    sections: mockSections,
    status: 'draft',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOutlineService = mockService<OutlineService>({
    update: jest.fn().mockResolvedValue(mockOutline)
  });

  const handler = createTestHandler(createUpdateSectionsHandler(mockOutlineService));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update outline sections with valid input', async () => {
    const req = mockAuthenticatedRequest(
      'user-1',
      { id: 'outline-1' },
      { sections: mockSections }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.update).toHaveBeenCalledWith(
      'outline-1',
      'user-1',
      { sections: mockSections }
    );
    expectSuccess(res, mockOutline);
  });

  it('should return 400 when sections is not an array', async () => {
    const req = mockAuthenticatedRequest(
      'user-1',
      { id: 'outline-1' },
      { sections: 'not an array' }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.update).not.toHaveBeenCalled();
    expectError(res, 400, 'Sections must be an array');
  });

  it('should return 404 when outline is not found', async () => {
    mockOutlineService.update = jest.fn().mockResolvedValue(null);

    const req = mockAuthenticatedRequest(
      'user-1',
      { id: 'outline-1' },
      { sections: mockSections }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.update).toHaveBeenCalled();
    expectError(res, 404, 'Outline not found');
  });

  it('should return 403 when user is not authorized', async () => {
    mockOutlineService.update = jest.fn().mockRejectedValue(
      new Error('Not authorized to modify this outline')
    );

    const req = mockAuthenticatedRequest(
      'user-2',
      { id: 'outline-1' },
      { sections: mockSections }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.update).toHaveBeenCalled();
    expectError(res, 403, 'Not authorized to modify this outline');
  });

  it('should return 500 when service throws unexpected error', async () => {
    mockOutlineService.update = jest.fn().mockRejectedValue(
      new Error('Database error')
    );

    const req = mockAuthenticatedRequest(
      'user-1',
      { id: 'outline-1' },
      { sections: mockSections }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.update).toHaveBeenCalled();
    expectError(res, 500);
  });
});
