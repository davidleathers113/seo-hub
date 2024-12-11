
// Unit tests for: validatePassword




const { validatePassword } = require('../password');
const bcrypt = require('bcrypt');
jest.mock("bcrypt");

describe('validatePassword() validatePassword method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return true when the password matches the hash', async () => {
      // Arrange
      const password = 'securePassword123';
      const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z1ZQ4u1E1QqU1E1QqU1E1'; // Mocked hash
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await validatePassword(password, hash);

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false when the password does not match the hash', async () => {
      // Arrange
      const password = 'wrongPassword';
      const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z1ZQ4u1E1QqU1E1QqU1E1'; // Mocked hash
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(password, hash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return false when the hash is invalid', async () => {
      // Arrange
      const password = 'anyPassword';
      const invalidHash = 'invalidHash';
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(password, invalidHash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, invalidHash);
    });

    it('should handle empty password gracefully', async () => {
      // Arrange
      const emptyPassword = '';
      const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z1ZQ4u1E1QqU1E1QqU1E1'; // Mocked hash
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(emptyPassword, hash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(emptyPassword, hash);
    });

    it('should handle empty hash gracefully', async () => {
      // Arrange
      const password = 'anyPassword';
      const emptyHash = '';
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(password, emptyHash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, emptyHash);
    });

    it('should handle null password gracefully', async () => {
      // Arrange
      const nullPassword = null;
      const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z1ZQ4u1E1QqU1E1QqU1E1'; // Mocked hash
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(nullPassword, hash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(nullPassword, hash);
    });

    it('should handle null hash gracefully', async () => {
      // Arrange
      const password = 'anyPassword';
      const nullHash = null;
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await validatePassword(password, nullHash);

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, nullHash);
    });
  });
});

// End of unit tests for: validatePassword
