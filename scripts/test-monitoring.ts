// Load environment variables first
import { resolve } from 'path'
import dotenv from 'dotenv'

// Configure dotenv to load from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

// Other imports
import { supabase, initializeSupabase, queryWithCache, cacheUtils } from '../server/config/supabase'
import { PostgrestResponse } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
}

async function testMonitoring() {
  console.log('Testing Supabase monitoring and caching...')

  try {
    // Initialize Supabase with monitoring
    await initializeSupabase()
    console.log('✅ Supabase initialized with monitoring')

    // Test caching
    console.log('\nTesting caching...')
    
    // First query - should hit database
    console.log('Making first query (uncached)...')
    const start1 = performance.now()
    const result1 = await queryWithCache<User[]>('users', async () => {
      const response = await supabase
        .from('users')
        .select('id, email')
        .limit(5)
      return {
        data: response.data,
        error: response.error
      }
    })
    const duration1 = performance.now() - start1
    
    if (result1.error) {
      throw result1.error
    }
    console.log(`✅ First query completed in ${duration1.toFixed(2)}ms`)

    // Second query - should hit cache
    console.log('\nMaking second query (should be cached)...')
    const start2 = performance.now()
    const result2 = await queryWithCache<User[]>('users', async () => {
      const response = await supabase
        .from('users')
        .select('id, email')
        .limit(5)
      return {
        data: response.data,
        error: response.error
      }
    })
    const duration2 = performance.now() - start2

    if (result2.error) {
      throw result2.error
    }
    console.log(`✅ Second query completed in ${duration2.toFixed(2)}ms`)
    
    if (duration2 < duration1) {
      console.log('✅ Cache is working (second query was faster)')
    }

    // Test cache utilities
    console.log('\nTesting cache utilities...')
    console.log(`Current cache size: ${cacheUtils.getCacheSize()} entries`)
    
    cacheUtils.clearCache()
    console.log('Cache cleared')
    console.log(`Cache size after clear: ${cacheUtils.getCacheSize()} entries`)

    // Test monitoring metrics
    console.log('\nChecking monitoring metrics...')
    const metrics = cacheUtils.getMetrics()
    console.log('Current metrics:', {
      slowQueries: metrics.slowQueries,
      errors: metrics.errors,
      lastHealthCheck: metrics.lastHealthCheck,
      activeChannels: metrics.channelCount
    })

    // Test realtime subscription
    console.log('\nTesting realtime subscription...')
    const channel = supabase.channel('test')
      .on('presence', { event: 'sync' }, () => {
        console.log('✅ Realtime presence sync received')
      })
      .subscribe((status) => {
        console.log(`Channel status: ${status}`)
      })

    // Wait for a moment to see realtime events
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Cleanup
    await channel.unsubscribe()
    console.log('✅ Channel unsubscribed')

    console.log('\nMonitoring and caching tests completed successfully!')

  } catch (error) {
    console.error('❌ Error during monitoring tests:', error)
    process.exit(1)
  }
}

// Run the tests
testMonitoring().catch(console.error)
