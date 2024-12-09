import api from './api';

// Login
// POST /api/auth/login
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
export const login = (email: string, password: string) => {
  return api.post('/api/auth/login', { email, password });
};

// Register
// POST /api/register
// Request: { email: string, password: string }
// Response: { success: boolean, message: string }
export const register = (data: { email: string; password: string }) => {
  return api.post('/api/register', {
    email: data.email,
    password: data.password
  });
};

// Logout
// POST /api/auth/logout
// Response: { success: boolean, message: string }
export const logout = () => {
  return api.post('/api/auth/logout');
};
