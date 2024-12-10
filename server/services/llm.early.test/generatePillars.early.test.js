
// Unit tests for: generatePillars




const { sendLLMRequest, generatePillars } = require('../llm');
const { logger } = require('../../utils/log');
const Niche = require('../../models/Niche');
jest.mock("../../models/Niche");
jest.mock("../llm", () => ({
  ...jest.requireActual("../llm"),
  sendLLMRequest: jest.fn(),
}));

describe('generatePillars() generatePillars method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy Path Tests
  it('should generate pillars successfully for a valid niche', async () => {
    // Arrange
    const nicheId = 'validNicheId';
    const nicheName = 'Technology';
    const mockNiche = { _id: nicheId, name: nicheName };
    const mockResponse = '1. AI\n2. Blockchain\n3. IoT\n4. Cybersecurity\n5. Cloud Computing';

    Niche.findById.mockResolvedValue(mockNiche);
    sendLLMRequest.mockResolvedValue(mockResponse);

    // Act
    const result = await generatePillars(nicheId);

    // Assert
    expect(Niche.findById).toHaveBeenCalledWith(nicheId);
    expect(sendLLMRequest).toHaveBeenCalledWith('openai', 'gpt-4', expect.any(String));
    expect(result).toEqual(['AI', 'Blockchain', 'IoT', 'Cybersecurity', 'Cloud Computing']);
  });

  // Edge Case Tests
  it('should throw an error if niche is not found', async () => {
    // Arrange
    const nicheId = 'nonExistentNicheId';
    Niche.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(generatePillars(nicheId)).rejects.toThrow('Niche not found');
    expect(Niche.findById).toHaveBeenCalledWith(nicheId);
    expect(sendLLMRequest).not.toHaveBeenCalled();
  });

  it('should throw an error if LLM response is empty', async () => {
    // Arrange
    const nicheId = 'validNicheId';
    const nicheName = 'Technology';
    const mockNiche = { _id: nicheId, name: nicheName };
    const mockResponse = '';

    Niche.findById.mockResolvedValue(mockNiche);
    sendLLMRequest.mockResolvedValue(mockResponse);

    // Act & Assert
    await expect(generatePillars(nicheId)).rejects.toThrow('Failed to generate valid pillars');
    expect(Niche.findById).toHaveBeenCalledWith(nicheId);
    expect(sendLLMRequest).toHaveBeenCalledWith('openai', 'gpt-4', expect.any(String));
  });

  it('should throw an error if LLM response does not contain valid pillars', async () => {
    // Arrange
    const nicheId = 'validNicheId';
    const nicheName = 'Technology';
    const mockNiche = { _id: nicheId, name: nicheName };
    const mockResponse = 'No valid pillars here';

    Niche.findById.mockResolvedValue(mockNiche);
    sendLLMRequest.mockResolvedValue(mockResponse);

    // Act & Assert
    await expect(generatePillars(nicheId)).rejects.toThrow('Failed to generate valid pillars');
    expect(Niche.findById).toHaveBeenCalledWith(nicheId);
    expect(sendLLMRequest).toHaveBeenCalledWith('openai', 'gpt-4', expect.any(String));
  });

  it('should retry LLM request on failure and eventually throw an error', async () => {
    // Arrange
    const nicheId = 'validNicheId';
    const nicheName = 'Technology';
    const mockNiche = { _id: nicheId, name: nicheName };

    Niche.findById.mockResolvedValue(mockNiche);
    sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

    // Act & Assert
    await expect(generatePillars(nicheId)).rejects.toThrow('Failed to generate pillars using AI');
    expect(Niche.findById).toHaveBeenCalledWith(nicheId);
    expect(sendLLMRequest).toHaveBeenCalledTimes(3); // Ensure retries
  });
});

// End of unit tests for: generatePillars
