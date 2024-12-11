
// Unit tests for: createTestPillar




const { createTestUser, createTestNiche, createTestPillar } = require('../helpers');
const mongoose = require('mongoose');
const Pillar = require('../../models/Pillar');

jest.mock("../../models/Pillar");

describe('createTestPillar() createTestPillar method', () => {
  let user;
  let niche;

  beforeAll(async () => {
    // Mocking User and Niche creation
    user = await createTestUser();
    niche = await createTestNiche({}, user);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should create a pillar with default values when no pillarData is provided', async () => {
      // Arrange
      const expectedPillarData = {
        title: 'Test Pillar',
        niche: niche._id,
        createdBy: user._id,
        status: 'pending',
      };

      // Act
      await createTestPillar({}, niche, user);

      // Assert
      expect(Pillar.create).toHaveBeenCalledWith(expect.objectContaining(expectedPillarData));
    });

    it('should create a pillar with provided pillarData', async () => {
      // Arrange
      const pillarData = {
        title: 'Custom Pillar',
        status: 'active',
      };
      const expectedPillarData = {
        ...pillarData,
        niche: niche._id,
        createdBy: user._id,
      };

      // Act
      await createTestPillar(pillarData, niche, user);

      // Assert
      expect(Pillar.create).toHaveBeenCalledWith(expect.objectContaining(expectedPillarData));
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle missing user gracefully', async () => {
      // Arrange
      const pillarData = {
        title: 'Pillar without User',
      };

      // Act & Assert
      await expect(createTestPillar(pillarData, niche, null)).rejects.toThrow();
    });

    it('should handle missing niche gracefully', async () => {
      // Arrange
      const pillarData = {
        title: 'Pillar without Niche',
      };

      // Act & Assert
      await expect(createTestPillar(pillarData, null, user)).rejects.toThrow();
    });

    it('should handle empty pillarData object', async () => {
      // Arrange
      const expectedPillarData = {
        title: 'Test Pillar',
        niche: niche._id,
        createdBy: user._id,
        status: 'pending',
      };

      // Act
      await createTestPillar({}, niche, user);

      // Assert
      expect(Pillar.create).toHaveBeenCalledWith(expect.objectContaining(expectedPillarData));
    });

    it('should handle pillarData with unexpected fields', async () => {
      // Arrange
      const pillarData = {
        title: 'Pillar with Extra Fields',
        unexpectedField: 'unexpectedValue',
      };
      const expectedPillarData = {
        title: 'Pillar with Extra Fields',
        niche: niche._id,
        createdBy: user._id,
        status: 'pending',
      };

      // Act
      await createTestPillar(pillarData, niche, user);

      // Assert
      expect(Pillar.create).toHaveBeenCalledWith(expect.objectContaining(expectedPillarData));
    });
  });
});

// End of unit tests for: createTestPillar
