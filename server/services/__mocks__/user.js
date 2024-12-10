// Mock implementation of UserService
class UserServiceMock {
  static get = jest.fn().mockImplementation((id) => {
    return Promise.resolve({
      _id: id,
      id: id,
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  static getByEmail = jest.fn().mockImplementation((email) => {
    return Promise.resolve({
      _id: 'test-id',
      email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(this)
    });
  });

  static authenticateWithPassword = jest.fn().mockImplementation((email, password) => {
    return Promise.resolve({
      _id: 'test-id',
      email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  static authenticateWithToken = jest.fn().mockImplementation((token) => {
    return Promise.resolve({
      _id: 'test-id',
      email: 'test@example.com',
      role: 'user',
      token,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  static createUser = jest.fn().mockImplementation(({ email, password, name = '' }) => {
    const user = {
      _id: 'test-id',
      email,
      name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return Promise.resolve({ user, token: 'test-token' });
  });

  static update = jest.fn().mockImplementation((id, data) => {
    return Promise.resolve({
      _id: id,
      ...data,
      updatedAt: new Date()
    });
  });

  static delete = jest.fn().mockImplementation((id) => {
    return Promise.resolve(true);
  });

  static list = jest.fn().mockImplementation(() => {
    return Promise.resolve([]);
  });

  static regenerateToken = jest.fn().mockImplementation((user) => {
    return Promise.resolve({
      ...user,
      token: 'new-test-token'
    });
  });

  static setPassword = jest.fn().mockImplementation((user, password) => {
    return Promise.resolve(user);
  });
}

module.exports = UserServiceMock;
