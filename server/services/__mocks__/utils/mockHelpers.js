/**
 * Creates a configurable mock state manager
 * @param {Object} defaultResponse - The default response object
 * @param {string} serviceName - Name of the service (for error messages)
 * @returns {Object} Mock state management utilities
 */
const createMockStateManager = (defaultResponse, serviceName) => {
  let currentResponse = { ...defaultResponse };
  let shouldFail = false;
  let failureMessage = `${serviceName} request failed`;

  return {
    getResponse: () => currentResponse,
    shouldFail: () => shouldFail,
    getFailureMessage: () => failureMessage,
    setResponse: (response) => {
      currentResponse = { ...response };
    },
    setFailure: (fail, message = `${serviceName} request failed`) => {
      shouldFail = fail;
      failureMessage = message;
    },
    reset: (mockFn) => {
      currentResponse = { ...defaultResponse };
      shouldFail = false;
      failureMessage = `${serviceName} request failed`;
      if (mockFn) {
        mockFn.mockClear();
      }
    }
  };
};

/**
 * Creates an async mock function that handles failures and responses
 * @param {Function} responseTransformer - Function to transform the response
 * @param {Object} stateManager - Mock state manager instance
 * @returns {Function} Jest mock function
 */
const createMockFunction = (responseTransformer, stateManager) => {
  return jest.fn(async (...args) => {
    if (stateManager.shouldFail()) {
      throw new Error(stateManager.getFailureMessage());
    }
    return responseTransformer(stateManager.getResponse());
  });
};

module.exports = {
  createMockStateManager,
  createMockFunction
};