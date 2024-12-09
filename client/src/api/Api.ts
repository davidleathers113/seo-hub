import axios from 'axios';

// Log the API configuration
console.log('API connecting to:', 'http://localhost:3001');

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor to log all API calls and check for valid JWT
api.interceptors.request.use(request => {
  const currentUrl = request.url || '';
  console.log('Outgoing request:', request.method, currentUrl, request.data);
  
  // Skip token check for public endpoints
  const publicEndpoints = ['/api/register', '/api/auth/login'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => currentUrl.includes(endpoint));
  
  // Only check token for protected endpoints
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('token');
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid or missing token for protected endpoint');
      localStorage.removeItem('token'); // Remove any invalid token
      window.location.href = '/login'; // Redirect to login page
      return Promise.reject('Invalid token'); // Prevent the request from being sent
    }
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  const requestUrl = `${request.baseURL || ''}${currentUrl}`;
  console.log('API Request:', request.method?.toUpperCase(), requestUrl);
  return request;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      console.error('API Response Error:', error.response?.data || error.message);
      // Handle specific error cases
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
