
// Unit tests for: createTestNiche




const { createTestUser, createTestNiche } = require('../helpers');
const Niche = require('../../models/Niche');
const mongoose = require('mongoose');
jest.mock("../../models/Niche");

describe('createTestNiche() createTestNiche method', () => {
  let user;

  beforeAll(async () => {
    // Set up a test user before running the tests
    user = await createTestUser();
  });

  afterEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Niche.mockClear();
  });

  afterAll(async () => {
    // Clean up any resources if necessary
    await mongoose.connection.close();
  });

  describe('Happy Paths', () => {
    it('should create a niche with default values when no nicheData is provided', async () => {
      // Arrange
      const expectedNicheData = {
        name: 'Test Niche',
        userId: user._id,
        pillars: [],
        status: 'new',
        progress: 0
      };

      // Act
      await createTestNiche({}, user);

      // Assert
      expect(Niche.create).toHaveBeenCalledWith(expect.objectContaining(expectedNicheData));
    });

    it('should create a niche with provided nicheData', async () => {
      // Arrange
      const nicheData = {
        name: 'Custom Niche',
        pillars: ['pillar1', 'pillar2'],
        status: 'active',
        progress: 50
      };

      // Act
      await createTestNiche(nicheData, user);

      // Assert
      expect(Niche.create).toHaveBeenCalledWith(expect.objectContaining({
        ...nicheData,
        userId: user._id
      }));
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user gracefully', async () => {
      // Arrange
      const nicheData = { name: 'Niche Without User' };

      // Act & Assert
      await expect(createTestNiche(nicheData, null)).rejects.toThrow();
    });

    it('should handle empty nicheData object', async () => {
      // Act
      await createTestNiche({}, user);

      // Assert
      expect(Niche.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Niche',
        userId: user._id,
        pillars: [],
        status: 'new',
        progress: 0
      }));
    });

    it('should handle nicheData with unexpected fields', async () => {
      // Arrange
      const nicheData = {
        name: 'Niche With Extra Fields',
        unexpectedField: 'unexpectedValue'
      };

      // Act
      await createTestNiche(nicheData, user);

      // Assert
      expect(Niche.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Niche With Extra Fields',
        userId: user._id
      }));
    });
  });
});

// End of unit tests for: createTestNiche
