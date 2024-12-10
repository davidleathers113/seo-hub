
// Unit tests for: requireUser




const { requireUser } = require('../auth');
const { verifyToken } = require('../../../utils/jwt');
describe('requireUser() requireUser method', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('Happy Paths', () => {
    it('should call next if req.user is present', () => {
      // Arrange: Set up a request object with a user
      req.user = { id: '123', email: 'test@example.com' };

      // Act: Call the middleware
      requireUser(req, res, next);

      // Assert: Ensure next is called and no response is sent
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should respond with 401 if req.user is not present', () => {
      // Arrange: req.user is undefined

      // Act: Call the middleware
      requireUser(req, res, next);

      // Assert: Ensure a 401 response is sent
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle cases where req.user is null', () => {
      // Arrange: Set req.user to null
      req.user = null;

      // Act: Call the middleware
      requireUser(req, res, next);

      // Assert: Ensure a 401 response is sent
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle cases where req.user is an empty object', () => {
      // Arrange: Set req.user to an empty object
      req.user = {};

      // Act: Call the middleware
      requireUser(req, res, next);

      // Assert: Ensure next is called since req.user is technically present
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: requireUser
