const OpenAI = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');
const OpenRouterService = require('./openRouter').default;
const dotenv = require('dotenv');
const { logger } = require('../utils/log');
const Niche = require('../models/Niche');
const Research = require('../models/Research');
const { OPENROUTER_MODELS } = require('../config/openRouter');
const log = logger('llm-service');

dotenv.config();

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === 'test') {
      return new OpenAI();
    }
    throw new Error('OPENAI_API_KEY is not set in the environment variables');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    if (process.env.NODE_ENV === 'test') {
      return new Anthropic();
    }
    throw new Error('ANTHROPIC_API_KEY is not set in the environment variables');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getOpenRouterClient() {
  return new OpenRouterService();
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequestToOpenAI(model, message) {
  const openai = getOpenAIClient();
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToAnthropic(model, message) {
  const anthropic = getAnthropicClient();
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Sending request to Anthropic with model: ${model} and message: ${message}`);
      const response = await anthropic.messages.create({
        model: model,
        system: "You are a helpful AI assistant that writes high-quality, engaging content.",
        messages: [{
          role: 'user',
          content: message
        }],
        max_tokens: 1024
      });
      console.log(`Received response from Anthropic: ${JSON.stringify(response)}`);
      return response.content;
    } catch (error) {
      console.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToOpenRouter(model, message) {
  const openRouter = getOpenRouterClient();
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Sending request to OpenRouter with model: ${model} and message: ${message}`);
      const response = await openRouter.generateWithRetry(message, {
        model: model,
        temperature: 0.7,
        max_tokens: 1024
      });
      console.log(`Received response from OpenRouter: ${response}`);
      return response;
    } catch (error) {
      console.error(`Error sending request to OpenRouter (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendLLMRequest(provider, model, message) {
  switch (provider.toLowerCase()) {
    case 'openai':
      return sendRequestToOpenAI(model, message);
    case 'anthropic':
      return sendRequestToAnthropic(model, message);
    case 'openrouter':
      return sendRequestToOpenRouter(model, message);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function generatePillars(nicheId) {
  try {
    const niche = await Niche.findById(nicheId);
    if (!niche) {
      throw new Error('Niche not found');
    }

    const prompt = `Generate 5 main content pillars for the niche: ${niche.name}.
    These pillars should be comprehensive topics that can be expanded into detailed content.
    Each pillar should be unique and cover a different aspect of the niche.
    Format the response as a numbered list (1., 2., etc.).`;

    const response = await sendLLMRequest(
      'openrouter',
      OPENROUTER_MODELS.GPT4,
      prompt
    );

    // Parse the response into individual pillar titles
    const pillars = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\d+\./)) // Only keep numbered lines
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove numbers

    if (pillars.length === 0) {
      throw new Error('Failed to generate valid pillars');
    }

    return pillars;
  } catch (error) {
    log.error('Error in AI pillar generation:', error);
    if (error.message === 'Niche not found') {
      throw error;
    }
    throw new Error('Failed to generate pillars using AI');
  }
}

async function generateOutline(subpillarId) {
  try {
    // Get research related to the subpillar
    const research = await Research.find({ subpillar: subpillarId })
      .select('content source');

    if (!research || research.length === 0) {
      throw new Error('No research found for this subpillar');
    }

    // Combine research content
    const researchContent = research
      .map(r => `Source: ${r.source}\nContent: ${r.content}`)
      .join('\n\n');

    const prompt = `Based on the following research, generate a comprehensive article outline with 4-6 main sections. Each section should have a clear title that reflects its content.

Research:
${researchContent}

Format the response as:
1. [Section Title]
2. [Section Title]
etc.`;

    const response = await sendLLMRequest(
      'openai',
      'gpt-4',
      prompt
    );

    // Parse the response into sections
    const sections = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\d+\./))
      .map((line, index) => ({
        title: line.replace(/^\d+\.\s*/, ''),
        contentPoints: [],
        order: index
      }));

    if (sections.length === 0) {
      throw new Error('Failed to generate valid outline sections');
    }

    return sections;
  } catch (error) {
    log.error('Error in AI outline generation:', error);
    if (error.message === 'No research found for this subpillar') {
      throw error;
    }
    throw new Error('Failed to generate outline using AI');
  }
}

async function generateContentPoints(outlineSection, research) {
  try {
    const prompt = `Based on the following research, generate 3-5 detailed content points for the article section titled "${outlineSection.title}". Each point should be comprehensive and backed by the research provided.

Research:
${research.map(r => `Source: ${r.source}\nContent: ${r.content}`).join('\n\n')}

Format each point as a clear, detailed statement that can be expanded into full paragraphs.`;

    const response = await sendLLMRequest(
      'openai',
      'gpt-4',
      prompt
    );

    // Parse the response into content points
    const contentPoints = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(point => ({
        point: point.replace(/^[-•]\s*/, ''),
        generated: true
      }));

    if (contentPoints.length === 0) {
      throw new Error('Failed to generate valid content points');
    }

    return contentPoints;
  } catch (error) {
    log.error('Error in AI content point generation:', error);
    if (error.message === 'Invalid outline format') {
      throw error;
    }
    throw new Error('Failed to generate content points using AI');
  }
}

async function mergeContentIntoArticle(outline) {
  try {
    const sections = outline.sections.map(section => {
      const points = section.contentPoints
        .map(cp => cp.point)
        .join('\n\n');

      return `## ${section.title}\n\n${points}`;
    }).join('\n\n');

    const prompt = `Transform the following outline and content points into a cohesive article. Maintain the section structure but create smooth transitions between ideas and expand on the points naturally.

${sections}

The article should:
1. Flow naturally between sections
2. Expand on the content points while maintaining accuracy
3. Use clear topic sentences and transitions
4. Maintain a consistent tone throughout`;

    const response = await sendLLMRequest(
      'openai',
      'gpt-4',
      prompt
    );

    if (!response || response.trim().length === 0) {
      throw new Error('Failed to generate article content');
    }

    return response;
  } catch (error) {
    log.error('Error in AI article generation:', error);
    if (error.message === 'Invalid outline format') {
      throw error;
    }
    throw new Error('Failed to merge content into article using AI');
  }
}

module.exports = {
  sendLLMRequest,
  generatePillars,
  generateOutline,
  generateContentPoints,
  mergeContentIntoArticle
};
