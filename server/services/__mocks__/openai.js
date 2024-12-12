const { createMockStateManager, createMockFunction } = require('./utils/mockHelpers');

const DEFAULT_RESPONSE = {
  choices: [{
    message: {
      content: 'OpenAI response'
    }
  }]
};

const stateManager = createMockStateManager(DEFAULT_RESPONSE, 'OpenAI');

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(async (params) => {
        if (stateManager.shouldFail()) {
          throw new Error(stateManager.getFailureMessage());
        }
        return stateManager.getResponse();
      })
    }
  }
};

// Test helper functions
mockOpenAI.__setResponse = (response) => {
  stateManager.setResponse({
    choices: [{
      message: {
        content: response
      }
    }]
  });
};

mockOpenAI.__setFailure = (fail, message = 'OpenAI error') => {
  stateManager.setFailure(fail, message);
};

mockOpenAI.__reset = () => {
  stateManager.reset(mockOpenAI.chat.completions.create);
};

module.exports = jest.fn(() => mockOpenAI);
