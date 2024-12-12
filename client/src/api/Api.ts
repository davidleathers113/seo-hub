import axios from 'axios';

// Log the API configuration
console.log('API connecting to:', 'http://localhost:3001');

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Added /api prefix
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
  const publicEndpoints = ['/auth/register', '/auth/login']; // Updated register path
  const isPublicEndpoint = publicEndpoints.some(endpoint => currentUrl.includes(endpoint));

  if (!isPublicEndpoint) {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }
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
      console.error('API Response Error:', error.response?.data?.error || error.message);
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