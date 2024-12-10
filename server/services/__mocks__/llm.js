const llmService = {
  generatePillars: jest.fn(),
  sendLLMRequest: jest.fn()
};

// Default successful response
llmService.sendLLMRequest.mockImplementation(async () => {
  return '1. First Pillar\n2. Second Pillar\n3. Third Pillar';
});

// Mock implementations for different test scenarios
llmService.generatePillars.mockImplementation(async (nicheId) => {
  if (nicheId === 'invalid-id') {
    throw new Error('Invalid niche ID');
  }

  const response = await llmService.sendLLMRequest();
  return response.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim());
});

module.exports = llmService;
