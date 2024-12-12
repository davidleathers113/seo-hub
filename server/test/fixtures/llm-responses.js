/**
 * Centralized test fixtures for LLM responses
 * Single source of truth for all LLM-related test data
 */

// OpenAI Response Templates
const openAIResponses = {
  default: 'OpenAI response',
  error: 'OpenAI error',
  rateLimit: 'OpenAI API rate limit exceeded',
  timeout: 'Request timed out',
  // Content generation responses
  pillars: `1. Content Strategy
2. Social Media Marketing
3. Email Marketing
4. SEO Optimization
5. Analytics and Metrics`,
  outline: `1. Introduction to Digital Marketing
2. Understanding Your Target Audience
3. Creating Effective Campaigns
4. Measuring Success
5. Future Trends`,
  contentPoints: `- Key demographic analysis methods
- Customer journey mapping
- Behavioral analytics
- Market segmentation strategies
- User persona development`
};

// Anthropic Response Templates
const anthropicResponses = {
  default: 'Anthropic response',
  error: 'Anthropic error',
  rateLimit: 'Anthropic API rate limit exceeded',
  timeout: 'Request timed out',
  // Content generation responses
  research: `Based on the provided sources, here are the key findings:
1. Market trends show increasing demand
2. Customer preferences are shifting
3. Competition is intensifying
4. New opportunities emerging`,
  analysis: `The data suggests:
- Strong growth potential
- Untapped market segments
- Need for differentiation
- Innovation opportunities`
};

// Error Messages
const errorMessages = {
  openai: {
    default: 'OpenAI error',
    rateLimit: 'OpenAI API rate limit exceeded',
    timeout: 'Request timed out',
    invalid: 'Invalid OpenAI response format'
  },
  anthropic: {
    default: 'Anthropic error',
    rateLimit: 'Anthropic API rate limit exceeded',
    timeout: 'Request timed out',
    invalid: 'Invalid Anthropic response format'
  },
  general: {
    unsupportedProvider: (provider) => `Unsupported LLM provider: ${provider}`,
    invalidResponse: 'Invalid response format',
    missingData: 'Required data is missing'
  }
};

// Test Data
const testData = {
  messages: {
    simple: 'Test message',
    long: 'This is a longer test message that includes multiple sentences and specific requirements.',
    invalid: ''
  },
  models: {
    openai: ['gpt-4', 'gpt-3.5-turbo'],
    anthropic: ['claude-2', 'claude-instant']
  }
};

module.exports = {
  openAIResponses,
  anthropicResponses,
  errorMessages,
  testData
};