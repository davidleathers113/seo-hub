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
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register
// POST /register
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
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout
// POST /auth/logout
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token even if the server request fails
    localStorage.removeItem('token');
    throw error;
  }
};
