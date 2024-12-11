
// Unit tests for: verifyToken




const { verifyToken } = require('../jwt');
const jwt = require('jsonwebtoken');
jest.mock("jsonwebtoken");

describe('verifyToken() verifyToken method', () => {
  const mockSecret = 'testsecret';
  const validToken = 'valid.token.here';
  const decodedPayload = { id: '123', email: 'test@example.com' };

  beforeAll(() => {
    process.env.JWT_SECRET = mockSecret;
  });

  describe('Happy Paths', () => {
    it('should verify a valid token and return the decoded payload', () => {
      // Arrange
      jwt.verify.mockImplementation((token, secret, callback) => {
        if (token === validToken && secret === mockSecret) {
          callback(null, decodedPayload);
        }
      });

      // Act
      const result = verifyToken(validToken);

      // Assert
      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(validToken, mockSecret, expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error if the token is invalid', () => {
      // Arrange
      const invalidToken = 'invalid.token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        if (token === invalidToken) {
          callback(new Error('Invalid token'));
        }
      });

      // Act & Assert
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
      expect(jwt.verify).toHaveBeenCalledWith(invalidToken, mockSecret, expect.any(Function));
    });

    it('should throw an error if the token is expired', () => {
      // Arrange
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new jwt.TokenExpiredError('jwt expired', new Date()));
      });

      // Act & Assert
      expect(() => verifyToken(validToken)).toThrow('jwt expired');
      expect(jwt.verify).toHaveBeenCalledWith(validToken, mockSecret, expect.any(Function));
    });

    it('should throw an error if the token is malformed', () => {
      // Arrange
      const malformedToken = 'malformed.token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new jwt.JsonWebTokenError('jwt malformed'));
      });

      // Act & Assert
      expect(() => verifyToken(malformedToken)).toThrow('jwt malformed');
      expect(jwt.verify).toHaveBeenCalledWith(malformedToken, mockSecret, expect.any(Function));
    });

    it('should throw an error if the secret is incorrect', () => {
      // Arrange
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new jwt.JsonWebTokenError('invalid signature'));
      });

      // Act & Assert
      expect(() => verifyToken(validToken)).toThrow('invalid signature');
      expect(jwt.verify).toHaveBeenCalledWith(validToken, mockSecret, expect.any(Function));
    });
  });
});

// End of unit tests for: verifyToken
