const { createMockStateManager, createMockFunction } = require('./utils/mockHelpers');

const DEFAULT_RESPONSE = {
  content: [{ text: 'Anthropic response' }]
};

const stateManager = createMockStateManager(DEFAULT_RESPONSE, 'Anthropic');

const mockAnthropic = {
  messages: {
    create: createMockFunction(
      response => response,
      stateManager
    )
  }
};

// Test helper functions
mockAnthropic.__setResponse = (response) => {
  stateManager.setResponse({
    content: [{ text: response }]
  });
};

mockAnthropic.__setFailure = (fail, message) => {
  stateManager.setFailure(fail, message);
};

mockAnthropic.__reset = () => {
  stateManager.reset(mockAnthropic.messages.create);
};

module.exports = mockAnthropic;