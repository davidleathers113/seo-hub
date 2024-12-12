const { createMockStateManager, createMockFunction } = require('./utils/mockHelpers');

// Constants
const MAX_RETRIES = 3;
let retryCount = 0;

// Default responses
const DEFAULT_OPENAI_RESPONSE = {
  choices: [{
    message: {
      content: 'OpenAI response'
    }
  }]
};

const DEFAULT_ANTHROPIC_RESPONSE = {
  content: [{ text: 'Anthropic response' }]
};

// Create state managers for each service
const openAIStateManager = createMockStateManager(DEFAULT_OPENAI_RESPONSE, 'OpenAI');
const anthropicStateManager = createMockStateManager(DEFAULT_ANTHROPIC_RESPONSE, 'Anthropic');

// Create mock implementations with retry logic
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(async (params) => {
        if (openAIStateManager.shouldFail()) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            throw new Error('OpenAI error');
          }
          throw new Error('OpenAI error');
        }
        return openAIStateManager.getResponse();
      })
    }
  }
};

const mockAnthropic = {
  messages: {
    create: jest.fn(async (params) => {
      if (anthropicStateManager.shouldFail()) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          throw new Error('Anthropic error');
        }
        throw new Error('Anthropic error');
      }
      return anthropicStateManager.getResponse();
    })
  }
};

// Helper functions that maintain backward compatibility
function resetMocks() {
  retryCount = 0;
  openAIStateManager.reset(mockOpenAI.chat.completions.create);
  anthropicStateManager.reset(mockAnthropic.messages.create);
}

function setFailureMode(fail) {
  retryCount = 0;
  openAIStateManager.setFailure(fail, 'OpenAI error');
  anthropicStateManager.setFailure(fail, 'Anthropic error');
}

// Extended helper functions for more granular control
function setOpenAIResponse(response) {
  openAIStateManager.setResponse({
    choices: [{
      message: {
        content: response
      }
    }]
  });
}

function setAnthropicResponse(response) {
  anthropicStateManager.setResponse({
    content: [{ text: response }]
  });
}

function setOpenAIFailure(fail, message = 'OpenAI error') {
  retryCount = 0;
  openAIStateManager.setFailure(fail, message);
}

function setAnthropicFailure(fail, message = 'Anthropic error') {
  retryCount = 0;
  anthropicStateManager.setFailure(fail, message);
}

// Extract actual response values for backward compatibility
const mockOpenAIResponse = DEFAULT_OPENAI_RESPONSE.choices[0].message.content;
const mockAnthropicResponse = DEFAULT_ANTHROPIC_RESPONSE.content[0].text;

module.exports = {
  OpenAI: jest.fn(() => mockOpenAI),
  mockOpenAI,
  mockAnthropic,
  resetMocks,
  setFailureMode,
  mockOpenAIResponse,
  mockAnthropicResponse,
  // New granular control functions
  setOpenAIResponse,
  setAnthropicResponse,
  setOpenAIFailure,
  setAnthropicFailure
};
