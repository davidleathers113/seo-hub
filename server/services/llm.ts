export enum LLMProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GOOGLE = 'google',
    META = 'meta-llama',
    MISTRAL = 'mistralai',
    AI21 = 'ai21',
    XAI = 'xai',
    PERPLEXITY = 'perplexity',
    OPEN_SOURCE = 'open-source'
}

export enum AIModel {
    // OpenAI Models
    GPT_35_TURBO = 'openai/gpt-3.5-turbo',
    GPT_35_TURBO_16K = 'openai/gpt-3.5-turbo-16k',
    GPT_4 = 'openai/gpt-4',
    GPT_4_32K = 'openai/gpt-4-32k',
    GPT_4_TURBO = 'openai/gpt-4-turbo-2024-11-20',

    // Anthropic Models
    CLAUDE_2 = 'anthropic/claude-2',
    CLAUDE_2_0 = 'anthropic/claude-2.0',
    CLAUDE_INSTANT_V1 = 'anthropic/claude-instant-v1',
    CLAUDE_V1 = 'anthropic/claude-v1',
    CLAUDE_1_2 = 'anthropic/claude-1.2',
    CLAUDE_INSTANT_V1_100K = 'anthropic/claude-instant-v1-100k',
    CLAUDE_V1_100K = 'anthropic/claude-v1-100k',
    CLAUDE_INSTANT_1_0 = 'anthropic/claude-instant-1.0',

    // Google Models
    PALM_2_CHAT = 'google/palm-2-chat-bison',
    PALM_2_CODE = 'google/palm-2-codechat-bison',
    PALM_2_CHAT_32K = 'google/palm-2-chat-bison-32k',
    PALM_2_CODE_32K = 'google/palm-2-codechat-bison-32k',
    GEMINI_PRO = 'google/gemini-pro',
    GEMINI_PRO_VISION = 'google/gemini-pro-vision',

    // Meta's Llama Models
    LLAMA_2_13B = 'meta-llama/llama-2-13b-chat',
    LLAMA_2_70B = 'meta-llama/llama-2-70b-chat',
    CODELLAMA_34B = 'meta-llama/codellama-34b-instruct',

    // Mistral Models
    MISTRAL_7B = 'mistralai/mistral-7b-instruct',
    MIXTRAL_8X7B = 'mistralai/mixtral-8x7b-instruct',

    // AI21's Jamba Models
    JAMBA_1_5_LARGE = 'ai21/jamba-1.5-large',
    JAMBA_1_5_MINI = 'ai21/jamba-1.5-mini',
    JAMBA_INSTRUCT = 'ai21/jamba-instruct',

    // xAI's Grok Models
    GROK_BETA = 'xai/grok-beta',

    // Perplexity Models
    PPLX_70B_ONLINE = 'perplexity/pplx-70b-online',
    PPLX_7B_ONLINE = 'perplexity/pplx-7b-online',
    PPLX_7B_CHAT = 'perplexity/pplx-7b-chat',
    PPLX_70B_CHAT = 'perplexity/pplx-70b-chat',

    // Open-Source Models
    NOUS_CAPYBARA_34B = 'nousresearch/nous-capybara-34b',
    NOUS_CAPYBARA_7B = 'nousresearch/nous-capybara-7b',
    MYTHOMIST_7B = 'gryphe/mythomist-7b',
    TOPPY_M_7B = 'undi95/toppy-m-7b',
    BAGEL_34B = 'jondurbin/bagel-34b',
    PSYFIGHTER_13B = 'jebcarter/psyfighter-13b',
    PSYFIGHTER_13B_2 = 'koboldai/psyfighter-13b-2',
    NOROMAID_MIXTRAL = 'neversleep/noromaid-mixtral-8x7b-instruct',
    NOUS_HERMES_LLAMA2_13B = 'nousresearch/nous-hermes-llama2-13b',
    PHIND_CODELLAMA_34B = 'phind/phind-codellama-34b',
    NEURAL_CHAT_7B = 'intel/neural-chat-7b',
    NOUS_HERMES_2_MIXTRAL = 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    LLAVA_13B = 'haotian-liu/llava-13b',
    NOUS_HERMES_2_VISION = 'nousresearch/nous-hermes-2-vision-7b',
    MYTHOMAX_L2_13B = 'gryphe/mythomax-l2-13b',
    NOUS_HERMES_LLAMA2_70B = 'nousresearch/nous-hermes-llama2-70b',
    CODELLAMA_70B = 'codellama/codellama-70b-instruct',
    OPENHERMES_2_MISTRAL = 'teknium/openhermes-2-mistral-7b',
    OPENHERMES_25_MISTRAL = 'teknium/openhermes-2.5-mistral-7b',
    REMM_SLERP_L2_13B = 'undi95/remm-slerp-l2-13b',
    CINEMATIKA_7B = 'openrouter/cinematika-7b',
    YI_34B_CHAT = '01-ai/yi-34b-chat',
    YI_34B = '01-ai/yi-34b',
    YI_6B = '01-ai/yi-6b',
    STRIPEDHYENA_NOUS = 'togethercomputer/stripedhyena-nous-7b',
    STRIPEDHYENA_HESSIAN = 'togethercomputer/stripedhyena-hessian-7b',
    MIXTRAL_8X7B_BASE = 'mistralai/mixtral-8x7b',
    NOUS_HERMES_YI_34B = 'nousresearch/nous-hermes-yi-34b',
    MISTRAL_7B_OPENORCA = 'open-orca/mistral-7b-openorca',
    ZEPHYR_7B = 'huggingfaceh4/zephyr-7b-beta',
    CHRONOS_HERMES_13B = 'austism/chronos-hermes-13b',
    SYNTHIA_70B = 'migtissera/synthia-70b',
    MYTHALION_13B = 'pygmalionai/mythalion-13b',
    REMM_SLERP_L2_13B_6K = 'undi95/remm-slerp-l2-13b-6k',
    XWIN_LM_70B = 'xwin-lm/xwin-lm-70b',
    MYTHOMAX_L2_13B_8K = 'gryphe/mythomax-l2-13b-8k',
    OPENCHAT_7B = 'openchat/openchat-7b',
    GOLIATH_120B = 'alpindale/goliath-120b',
    LZLV_70B = 'lizpreciatior/lzlv-70b-fp16-hf',
    NOROMAID_20B = 'neversleep/noromaid-20b',
    DOLPHIN_MIXTRAL = 'cognitivecomputations/dolphin-mixtral-8x7b',
    RWKV_5_WORLD = 'rwkv/rwkv-5-world-3b',
    RWKV_5_AI_TOWN = 'recursal/rwkv-5-3b-ai-town',
    EAGLE_7B = 'recursal/eagle-7b'
}

export interface LLMModel {
    provider: LLMProvider;
    model: AIModel;
    maxTokens?: number;
    temperature?: number;
}

export interface LLMResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export async function sendLLMRequest(
    message: string,
    model: AIModel = AIModel.GPT_4,
    options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: message }],
                max_tokens: options.maxTokens || 1000,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json() as OpenRouterResponse;
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error in sendLLMRequest:', error);
        throw error;
    }
}
