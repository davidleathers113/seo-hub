// Load environment variables first
import { resolve } from 'path'
import dotenv from 'dotenv'

// Configure dotenv to load from the root .env file
dotenv.config({ path: resolve(__dirname, '../../../.env') })

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../utils/log';

const log = logger('supabase-config');

if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

// Cache configuration
const CACHE_TTL = 5 * 60; // 5 minutes in seconds
const cache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(table: string, query: string): string {
  return `${table}:${query}`;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function getCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = (Date.now() - cached.timestamp) / 1000 > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'content-creation-app',
      },
    },
  }
);

// Enhanced query functions with caching
export async function queryWithCache<T>(
  table: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  cacheKey?: string
): Promise<{ data: T | null; error: any }> {
  const key = cacheKey || table;
  const cachedData = getCache(key);
  
  if (cachedData) {
    return { data: cachedData, error: null };
  }

  const { data, error } = await queryFn();
  
  if (!error && data) {
    setCache(key, data);
  }

  return { data, error };
}

// Initialize Supabase with connection test and monitoring
export async function initializeSupabase() {
  try {
    log.info('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      throw error;
    }
    
    log.info('Supabase connection successful');

    // Set up monitoring
    setupMonitoring(supabase);

    return supabase;
  } catch (error) {
    log.error('Supabase connection failed:', error);
    throw error;
  }
}

interface MonitoringMetrics {
  slowQueries: number;
  errors: number;
  lastHealthCheck: Date | null;
  channels: Set<RealtimeChannel>;
}

const metrics: MonitoringMetrics = {
  slowQueries: 0,
  errors: 0,
  lastHealthCheck: null,
  channels: new Set(),
};

// Monitoring setup
function setupMonitoring(supabase: SupabaseClient) {
  // Monitor realtime connection status
  const channel = supabase.channel('system')
    .on('system', { event: 'presence_state' }, () => {
      log.info('Realtime connection established');
      metrics.lastHealthCheck = new Date();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        log.info('Channel subscribed');
        metrics.channels.add(channel);
      } else if (status === 'CLOSED') {
        log.warn('Channel closed');
        metrics.channels.delete(channel);
      } else if (status === 'CHANNEL_ERROR') {
        log.error('Channel error');
        metrics.errors++;
      }
    });

  // Monitor auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    log.info('Auth state changed:', event);
    if (event === 'SIGNED_OUT') {
      // Clear cache on sign out
      cache.clear();
      // Reset metrics
      metrics.slowQueries = 0;
      metrics.errors = 0;
      metrics.channels.clear();
    }
  });

  // Set up periodic health checks
  const healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  setInterval(async () => {
    try {
      const start = performance.now();
      const { error } = await supabase.from('users').select('count').single();
      const duration = performance.now() - start;

      if (error) {
        log.error('Health check failed:', error);
        metrics.errors++;
      } else {
        log.debug('Health check passed', { duration: `${duration.toFixed(2)}ms` });
        metrics.lastHealthCheck = new Date();
        
        if (duration > 1000) {
          metrics.slowQueries++;
          log.warn('Slow health check detected:', {
            duration: `${duration.toFixed(2)}ms`,
            totalSlowQueries: metrics.slowQueries
          });
        }
      }
    } catch (error) {
      log.error('Health check error:', error);
      metrics.errors++;
    }
  }, healthCheckInterval);
}

// Export cache utilities for external use
export const cacheUtils = {
  clearCache: () => cache.clear(),
  getCacheSize: () => cache.size,
  invalidateCache: (key: string) => cache.delete(key),
  getMetrics: () => ({
    ...metrics,
    channelCount: metrics.channels.size,
    channels: Array.from(metrics.channels)
  }),
};
