import api from './api';

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

// Register
// POST /register (mounted directly in server.js)
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
export const register = (data: { email: string; password: string }) => {
  return api.post('/register', {
    email: data.email,
    password: data.password
  });
};

// Logout
// POST /auth/logout
// Response: { success: boolean, message: string }
export const logout = () => {
  return api.post('/auth/logout');
};
