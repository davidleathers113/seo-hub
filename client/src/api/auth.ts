import api from './api';

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
export const login = (email: string, password: string) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          token: "mock-token",
          user: { id: "1", email }
        }
      });
    }, 1000);
  });
  // return api.post('/auth/login', { email, password });
};

// Register
// POST /auth/register
// Request: { email: string, password: string }
// Response: { success: boolean, message: string }
export const register = (data: { email: string; password: string }) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          message: "Registration successful"
        }
      });
    }, 1000);
  });
  // return api.post('/auth/register', data);
};

// Logout
// POST /auth/logout
// Response: { success: boolean }
export const logout = () => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 1000);
  });
  // return api.post('/auth/logout');
};