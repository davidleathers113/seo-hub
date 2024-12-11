
// Unit tests for: createTestUser




const { createTestUser } = require('../helpers');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
jest.mock("bcrypt");
jest.mock("../../models/User");

describe('createTestUser() createTestUser method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should create a user with default values when no userData is provided', async () => {
      // Arrange
      const defaultEmail = 'test@example.com';
      const defaultName = 'Test User';
      const defaultPassword = 'password123';
      const hashedPassword = 'hashedPassword123';

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue({
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
      });

      // Act
      const user = await createTestUser();

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(defaultPassword, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
      });
      expect(user).toEqual({
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
      });
    });

    it('should create a user with provided userData', async () => {
      // Arrange
      const userData = {
        email: 'custom@example.com',
        password: 'customPassword',
        name: 'Custom User',
      };
      const hashedPassword = 'hashedCustomPassword';

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue({
        ...userData,
        password: hashedPassword,
      });

      // Act
      const user = await createTestUser(userData);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(user).toEqual({
        ...userData,
        password: hashedPassword,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing password in userData by using default password', async () => {
      // Arrange
      const userData = {
        email: 'custom@example.com',
        name: 'Custom User',
      };
      const defaultPassword = 'password123';
      const hashedPassword = 'hashedDefaultPassword';

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue({
        ...userData,
        password: hashedPassword,
      });

      // Act
      const user = await createTestUser(userData);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(defaultPassword, 'salt');
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(user).toEqual({
        ...userData,
        password: hashedPassword,
      });
    });

    it('should handle bcrypt.genSalt failure gracefully', async () => {
      // Arrange
      const error = new Error('genSalt failed');
      bcrypt.genSalt.mockRejectedValue(error);

      // Act & Assert
      await expect(createTestUser()).rejects.toThrow('genSalt failed');
    });

    it('should handle bcrypt.hash failure gracefully', async () => {
      // Arrange
      const error = new Error('hash failed');
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockRejectedValue(error);

      // Act & Assert
      await expect(createTestUser()).rejects.toThrow('hash failed');
    });

    it('should handle User.create failure gracefully', async () => {
      // Arrange
      const error = new Error('User creation failed');
      const hashedPassword = 'hashedPassword123';

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockRejectedValue(error);

      // Act & Assert
      await expect(createTestUser()).rejects.toThrow('User creation failed');
    });
  });
});

// End of unit tests for: createTestUser
