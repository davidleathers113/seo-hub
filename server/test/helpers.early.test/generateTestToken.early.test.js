
// Unit tests for: generateTestToken




const { generateTestToken } = require('../helpers');
const jwt = require('jsonwebtoken');
describe('generateTestToken() generateTestToken method', () => {
  // Mock data
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com'
  };

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should generate a valid JWT token for a valid user object', () => {
      // Test description: This test checks if a valid JWT token is generated for a valid user object.
      const token = generateTestToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toHaveProperty('id', mockUser._id);
      expect(decoded).toHaveProperty('email', mockUser.email);
    });

    it('should set the token expiration to 1 day', () => {
      // Test description: This test ensures that the token expiration is set to 1 day.
      const token = generateTestToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const currentTime = Math.floor(Date.now() / 1000);
      const oneDayInSeconds = 24 * 60 * 60;
      expect(decoded.exp).toBeGreaterThan(currentTime);
      expect(decoded.exp).toBeLessThanOrEqual(currentTime + oneDayInSeconds);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should throw an error if user object is missing', () => {
      // Test description: This test checks if an error is thrown when the user object is missing.
      expect(() => generateTestToken()).toThrow();
    });

    it('should throw an error if user object is missing _id', () => {
      // Test description: This test checks if an error is thrown when the user object is missing the _id property.
      const invalidUser = { email: 'test@example.com' };
      expect(() => generateTestToken(invalidUser)).toThrow();
    });

    it('should throw an error if user object is missing email', () => {
      // Test description: This test checks if an error is thrown when the user object is missing the email property.
      const invalidUser = { _id: 'user123' };
      expect(() => generateTestToken(invalidUser)).toThrow();
    });

    it('should handle special characters in email', () => {
      // Test description: This test ensures that special characters in the email are handled correctly.
      const specialCharUser = { _id: 'user123', email: 'test+alias@example.com' };
      const token = generateTestToken(specialCharUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded).toHaveProperty('email', specialCharUser.email);
    });
  });
});

// End of unit tests for: generateTestToken
