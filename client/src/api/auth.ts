import api from './api';

// Login
// POST /auth/login
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
/**
 * Authenticates a user by sending their email and password to the login API endpoint.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to the API response.
 * @throws Will throw an error if the API request fails.
 */
export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

// Register
// POST /register (mounted directly in server.js)
// Request: { email: string, password: string }
// Response: { token: string, user: { id: string, email: string } }
/**
 * Registers a new user by sending their email and password to the API.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to the API response.
 * @throws Will throw an error if the API request fails.
 */
export const register = async (data: { email: string, password: string }) => {
  try {
    return api.post('/auth/register', data);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout
// POST /auth/logout
// Response: { success: boolean, message: string }
export const logout = () => {
  return api.post('/auth/logout');
};
