
// Unit tests for: generatePasswordHash




const { generatePasswordHash } = require('../password');
const bcrypt = require('bcrypt');
jest.mock("bcrypt");

describe('generatePasswordHash() generatePasswordHash method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should generate a valid hash for a given password', async () => {
      // Arrange
      const password = 'securePassword123';
      const fakeSalt = 'fakeSalt';
      const fakeHash = 'fakeHash';

      bcrypt.genSalt.mockResolvedValue(fakeSalt);
      bcrypt.hash.mockResolvedValue(fakeHash);

      // Act
      const result = await generatePasswordHash(password);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, fakeSalt);
      expect(result).toBe(fakeHash);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should throw an error if password is undefined', async () => {
      // Arrange
      const password = undefined;
      const fakeSalt = 'fakeSalt';

      bcrypt.genSalt.mockResolvedValue(fakeSalt);

      // Act & Assert
      await expect(generatePasswordHash(password)).rejects.toThrow();
    });

    it('should throw an error if password is null', async () => {
      // Arrange
      const password = null;
      const fakeSalt = 'fakeSalt';

      bcrypt.genSalt.mockResolvedValue(fakeSalt);

      // Act & Assert
      await expect(generatePasswordHash(password)).rejects.toThrow();
    });

    it('should throw an error if password is an empty string', async () => {
      // Arrange
      const password = '';
      const fakeSalt = 'fakeSalt';

      bcrypt.genSalt.mockResolvedValue(fakeSalt);

      // Act & Assert
      await expect(generatePasswordHash(password)).rejects.toThrow();
    });

    it('should handle bcrypt.genSalt failure gracefully', async () => {
      // Arrange
      const password = 'securePassword123';
      const errorMessage = 'genSalt failed';

      bcrypt.genSalt.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(generatePasswordHash(password)).rejects.toThrow(errorMessage);
    });

    it('should handle bcrypt.hash failure gracefully', async () => {
      // Arrange
      const password = 'securePassword123';
      const fakeSalt = 'fakeSalt';
      const errorMessage = 'hash failed';

      bcrypt.genSalt.mockResolvedValue(fakeSalt);
      bcrypt.hash.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(generatePasswordHash(password)).rejects.toThrow(errorMessage);
    });
  });
});

// End of unit tests for: generatePasswordHash
