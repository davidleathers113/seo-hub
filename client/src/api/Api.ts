import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  shouldRetry: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status <= 599);
  },
};

// Create event emitter for retry status updates
type RetryStatus = {
  requestId: string;
  attempt: number;
  maxRetries: number;
  error: Error;
  nextRetryMs: number;
};

type RetryStatusListener = (status: RetryStatus) => void;
const retryListeners: RetryStatusListener[] = [];

export const onRetryStatusUpdate = (listener: RetryStatusListener) => {
  retryListeners.push(listener);
  return () => {
    const index = retryListeners.indexOf(listener);
    if (index > -1) {
      retryListeners.splice(index, 1);
    }
  };
};

const notifyRetryStatus = (status: RetryStatus) => {
  retryListeners.forEach(listener => listener(status));
};

// Store failed requests for manual retry
interface FailedRequest {
  config: AxiosRequestConfig;
  retryCount: number;
  lastError: AxiosError;
}

const failedRequests = new Map<string, FailedRequest>();

export const getFailedRequest = (requestId: string): FailedRequest | undefined => {
  return failedRequests.get(requestId);
};

export const clearFailedRequest = (requestId: string) => {
  failedRequests.delete(requestId);
};

// Manual retry function
export const retryRequest = async (requestId: string): Promise<AxiosResponse> => {
  const failedRequest = failedRequests.get(requestId);
  if (!failedRequest) {
    throw new Error('Request not found or already completed');
  }

  const { config, retryCount } = failedRequest;
  if (retryCount >= defaultRetryConfig.maxRetries) {
    throw new Error('Maximum retry attempts reached');
  }

  // Calculate delay with exponential backoff
  const delayMs = Math.min(
    defaultRetryConfig.initialDelayMs * Math.pow(2, retryCount),
    defaultRetryConfig.maxDelayMs
  );

  // Update retry count
  failedRequest.retryCount += 1;
  failedRequests.set(requestId, failedRequest);

  // Notify listeners of retry attempt
  notifyRetryStatus({
    requestId,
    attempt: failedRequest.retryCount,
    maxRetries: defaultRetryConfig.maxRetries,
    error: failedRequest.lastError,
    nextRetryMs: delayMs,
  });

  // Wait for the calculated delay
  await new Promise(resolve => setTimeout(resolve, delayMs));

  try {
    const response = await api(config);
    // Clear the failed request on success
    clearFailedRequest(requestId);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError;
    failedRequest.lastError = axiosError;
    failedRequests.set(requestId, failedRequest);
    throw error;
  }
};

// Create axios instance with manual retry support
const createApiWithRetry = (config: AxiosRequestConfig): AxiosInstance => {
  const api = axios.create(config);

  api.interceptors.request.use(request => {
    console.log('API Request:', {
      method: request.method,
      url: request.url,
      data: request.data,
      headers: request.headers
    });

    const token = localStorage.getItem('token');
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add unique request ID for tracking retries
    request.headers['X-Request-ID'] = request.headers['X-Request-ID'] ||
      Math.random().toString(36).substring(7);
    return request;
  });

  api.interceptors.response.use(
    response => {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // Clear any failed request on success
      const requestId = response.config.headers?.['X-Request-ID'];
      if (requestId) {
        clearFailedRequest(requestId as string);
      }
      return response;
    },
    async error => {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          data: error.config?.data
        }
      });

      const config = error.config;
      const requestId = config.headers['X-Request-ID'];

      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Please log in to continue.'));
      }

      // Store failed request for manual retry if it meets retry criteria
      if (defaultRetryConfig.shouldRetry(error)) {
        failedRequests.set(requestId, {
          config,
          retryCount: 0,
          lastError: error,
        });
      }

      // Handle different error types
      if (!error.response) {
        return Promise.reject(new Error('Unable to connect to the server. Please check your connection.'));
      }

      if (error.response.status >= 500) {
        return Promise.reject(new Error('An unexpected error occurred. Please try again later.'));
      }

      // Extract error message from response
      const errorMessage = error.response.data?.error || 
                         error.response.data?.message || 
                         error.message || 
                         'An error occurred';
      
      return Promise.reject(new Error(errorMessage));
    }
  );

  return api;
};

// Create and export the API instance
const api = createApiWithRetry({
  // No need to specify baseURL since we're using Vite's proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
