
// Unit tests for: generateToken




const { generateToken } = require('../jwt');
const jwt = require('jsonwebtoken');
jest.mock("jsonwebtoken");

describe('generateToken() generateToken method', () => {
  const JWT_SECRET = 'testsecret';
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = { ...originalEnv, JWT_SECRET };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Happy Paths', () => {
    it('should generate a token for a valid user object', () => {
      // Arrange
      const user = { _id: '123', email: 'test@example.com' };
      const expectedToken = 'mockedToken';
      jwt.sign.mockReturnValue(expectedToken);

      // Act
      const token = generateToken(user);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(token).toBe(expectedToken);
    });

    it('should generate different tokens for different users', () => {
      // Arrange
      const user1 = { _id: '123', email: 'user1@example.com' };
      const user2 = { _id: '456', email: 'user2@example.com' };
      const token1 = 'mockedToken1';
      const token2 = 'mockedToken2';
      jwt.sign
        .mockReturnValueOnce(token1)
        .mockReturnValueOnce(token2);

      // Act
      const result1 = generateToken(user1);
      const result2 = generateToken(user2);

      // Assert
      expect(result1).toBe(token1);
      expect(result2).toBe(token2);
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error if user object is missing', () => {
      // Arrange
      const user = null;

      // Act & Assert
      expect(() => generateToken(user)).toThrow();
    });

    it('should throw an error if user object does not have an email', () => {
      // Arrange
      const user = { _id: '123' };

      // Act & Assert
      expect(() => generateToken(user)).toThrow();
    });

    it('should throw an error if user object does not have an _id', () => {
      // Arrange
      const user = { email: 'test@example.com' };

      // Act & Assert
      expect(() => generateToken(user)).toThrow();
    });

    it('should throw an error if JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      const user = { _id: '123', email: 'test@example.com' };

      // Act & Assert
      expect(() => generateToken(user)).toThrow();
    });
  });
});

// End of unit tests for: generateToken
