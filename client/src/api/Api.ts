import axios from 'axios';

// Log the API configuration
console.log('API connecting to:', 'http://localhost:3001/api');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log all API calls
api.interceptors.request.use(request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', request.method?.toUpperCase(), request.baseURL + request.url);
  return request;
});

export default api;
