const mongoose = require('mongoose');
const TestFixture = require('../../models/TestFixture');

class FixtureHelper {
  /**
   * Ensure database connection is ready
   */
  static async ensureConnection() {
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.ensureConnection();
    }
  }

  /**
   * Initialize fixtures for a test suite
   */
  static async initializeFixtures() {
    await this.ensureConnection();
    await TestFixture.seedFixtures();
  }

  /**
   * Get a response fixture
   * @param {string} provider - 'openai' or 'anthropic'
   * @param {string} category - response category (e.g., 'default', 'pillars')
   */
  static async getResponse(provider, category) {
    await this.ensureConnection();
    return TestFixture.getFixture(provider, 'response', category);
  }

  /**
   * Get an error fixture
   * @param {string} provider - 'openai' or 'anthropic'
   * @param {string} category - error category (e.g., 'rateLimit', 'timeout')
   */
  static async getError(provider, category) {
    await this.ensureConnection();
    return TestFixture.getFixture(provider, 'error', category);
  }

  /**
   * Get test data
   * @param {string} category - data category (e.g., 'message', 'model')
   */
  static async getTestData(category) {
    await this.ensureConnection();
    return TestFixture.getFixture('general', 'test_data', category);
  }

  /**
   * Update a fixture
   * @param {string} provider - 'openai', 'anthropic', or 'general'
   * @param {string} type - 'response', 'error', or 'test_data'
   * @param {string} category - fixture category
   * @param {*} content - new content
   * @param {Object} metadata - optional metadata
   */
  static async updateFixture(provider, type, category, content, metadata = {}) {
    await this.ensureConnection();
    return TestFixture.updateFixture(provider, type, category, content, {
      ...metadata,
      lastUpdated: new Date()
    });
  }

  /**
   * Clear all fixtures (useful for cleanup)
   */
  static async clearFixtures() {
    await this.ensureConnection();
    await TestFixture.deleteMany({});
  }
}

module.exports = FixtureHelper;