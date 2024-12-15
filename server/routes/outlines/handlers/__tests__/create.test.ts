import { OutlineService } from '../../../../services/OutlineService';
import { createCreateOutlineHandler } from '../create';
import {
  createTestHandler,
  mockAuthenticatedRequest,
  createMockResponse,
  mockService,
  expectSuccess,
  expectError
} from '../../../../test/helpers/route-testing';
import { Outline } from '../../../../database/interfaces';

describe('Create Outline Handler', () => {
  const mockOutline: Outline = {
    id: 'outline-1',
    subpillarId: 'subpillar-1',
    sections: [{
      title: 'Test Section',
      contentPoints: [],
      order: 0
    }],
    status: 'draft',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOutlineService = mockService<OutlineService>({
    create: jest.fn().mockResolvedValue(mockOutline)
  });

  const handler = createTestHandler(createCreateOutlineHandler(mockOutlineService));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an outline with valid input', async () => {
    const req = mockAuthenticatedRequest(
      'user-1',
      { subpillarId: 'subpillar-1' },
      { title: 'Test Outline' }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.create).toHaveBeenCalledWith(
      'subpillar-1',
      'user-1',
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Test Outline',
          contentPoints: [],
          order: 0
        })
      ])
    );
    expectSuccess(res, mockOutline, 201);
  });

  it('should return 400 when title is missing', async () => {
    const req = mockAuthenticatedRequest(
      'user-1',
      { subpillarId: 'subpillar-1' },
      {}
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.create).not.toHaveBeenCalled();
    expectError(res, 400, 'Title is required');
  });

  it('should return 500 when service throws error', async () => {
    const error = new Error('Database error');
    mockOutlineService.create = jest.fn().mockRejectedValue(error);

    const req = mockAuthenticatedRequest(
      'user-1',
      { subpillarId: 'subpillar-1' },
      { title: 'Test Outline' }
    );
    const res = createMockResponse();

    await handler(req, res);

    expect(mockOutlineService.create).toHaveBeenCalled();
    expectError(res, 500, 'Internal server error');
  });
});
