const mongoose = require('mongoose');

const TestFixtureSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ['openai', 'anthropic', 'general']
  },
  type: {
    type: String,
    required: true,
    enum: ['response', 'error', 'test_data']
  },
  category: {
    type: String,
    required: true,
    enum: ['default', 'error', 'rateLimit', 'timeout', 'pillars', 'outline', 'contentPoints', 'research', 'analysis', 'message', 'model']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    version: String,
    lastUpdated: Date,
    createdBy: String,
    description: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TestFixtureSchema.index({ provider: 1, type: 1, category: 1 });

// Static method to seed initial data
TestFixtureSchema.statics.seedFixtures = async function() {
  const fixtures = [
    // OpenAI Responses
    {
      provider: 'openai',
      type: 'response',
      category: 'default',
      content: 'OpenAI response',
      metadata: {
        version: '1.0',
        description: 'Default OpenAI response'
      }
    },
    {
      provider: 'openai',
      type: 'response',
      category: 'pillars',
      content: `1. Content Strategy
2. Social Media Marketing
3. Email Marketing
4. SEO Optimization
5. Analytics and Metrics`,
      metadata: {
        version: '1.0',
        description: 'Sample content pillars response'
      }
    },
    // OpenAI Errors
    {
      provider: 'openai',
      type: 'error',
      category: 'rateLimit',
      content: 'OpenAI API rate limit exceeded',
      metadata: {
        version: '1.0',
        description: 'Rate limit error message'
      }
    },
    // Anthropic Responses
    {
      provider: 'anthropic',
      type: 'response',
      category: 'default',
      content: 'Anthropic response',
      metadata: {
        version: '1.0',
        description: 'Default Anthropic response'
      }
    },
    // Test Data
    {
      provider: 'general',
      type: 'test_data',
      category: 'message',
      content: {
        simple: 'Test message',
        long: 'This is a longer test message that includes multiple sentences and specific requirements.'
      },
      metadata: {
        version: '1.0',
        description: 'Common test messages'
      }
    }
  ];

  // Use bulkWrite for efficient insertion
  const operations = fixtures.map(fixture => ({
    updateOne: {
      filter: {
        provider: fixture.provider,
        type: fixture.type,
        category: fixture.category
      },
      update: { $set: fixture },
      upsert: true
    }
  }));

  await this.bulkWrite(operations);
};

// Helper method to get fixture by criteria
TestFixtureSchema.statics.getFixture = async function(provider, type, category) {
  const fixture = await this.findOne({ provider, type, category });
  return fixture ? fixture.content : null;
};

// Helper method to update fixture
TestFixtureSchema.statics.updateFixture = async function(provider, type, category, content, metadata = {}) {
  return this.findOneAndUpdate(
    { provider, type, category },
    { $set: { content, metadata: { ...metadata, lastUpdated: new Date() } } },
    { new: true, upsert: true }
  );
};

const TestFixture = mongoose.model('TestFixture', TestFixtureSchema);

module.exports = TestFixture;