CREATE TABLE IF NOT EXISTS llms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model_id VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(100) NOT NULL,
    context_length INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OpenAI Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('GPT-3.5 Turbo', 'openai/gpt-3.5-turbo', 'openai', 4096),
('GPT-3.5 Turbo 16K', 'openai/gpt-3.5-turbo-16k', 'openai', 16384),
('GPT-4', 'openai/gpt-4', 'openai', 8192),
('GPT-4 32K', 'openai/gpt-4-32k', 'openai', 32768),
('GPT-4 Turbo', 'openai/gpt-4-turbo-2024-11-20', 'openai', 128000);

-- Anthropic Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Claude 2', 'anthropic/claude-2', 'anthropic', 100000),
('Claude 2.0', 'anthropic/claude-2.0', 'anthropic', 100000),
('Claude Instant v1', 'anthropic/claude-instant-v1', 'anthropic', 100000),
('Claude v1', 'anthropic/claude-v1', 'anthropic', 100000),
('Claude 1.2', 'anthropic/claude-1.2', 'anthropic', 100000),
('Claude Instant v1 100k', 'anthropic/claude-instant-v1-100k', 'anthropic', 100000),
('Claude v1 100k', 'anthropic/claude-v1-100k', 'anthropic', 100000),
('Claude Instant 1.0', 'anthropic/claude-instant-1.0', 'anthropic', 100000);

-- Google Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('PaLM 2 Chat', 'google/palm-2-chat-bison', 'google', 8192),
('PaLM 2 Code Chat', 'google/palm-2-codechat-bison', 'google', 8192),
('PaLM 2 Chat 32k', 'google/palm-2-chat-bison-32k', 'google', 32768),
('PaLM 2 Code Chat 32k', 'google/palm-2-codechat-bison-32k', 'google', 32768),
('Gemini Pro', 'google/gemini-pro', 'google', 32768),
('Gemini Pro Vision', 'google/gemini-pro-vision', 'google', 32768);

-- Meta's Llama Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Llama 2 13B Chat', 'meta-llama/llama-2-13b-chat', 'meta-llama', 4096),
('Llama 2 70B Chat', 'meta-llama/llama-2-70b-chat', 'meta-llama', 4096),
('CodeLlama 34B Instruct', 'meta-llama/codellama-34b-instruct', 'meta-llama', 4096);

-- Mistral Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Mistral 7B Instruct', 'mistralai/mistral-7b-instruct', 'mistralai', 8192),
('Mixtral 8x7B Instruct', 'mistralai/mixtral-8x7b-instruct', 'mistralai', 32768);

-- AI21's Jamba Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Jamba 1.5 Large', 'ai21/jamba-1.5-large', 'ai21', 8192),
('Jamba 1.5 Mini', 'ai21/jamba-1.5-mini', 'ai21', 8192),
('Jamba Instruct', 'ai21/jamba-instruct', 'ai21', 8192);

-- xAI's Grok Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Grok Beta', 'xai/grok-beta', 'xai', 8192);

-- Perplexity Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('PPLX 70B Online', 'perplexity/pplx-70b-online', 'perplexity', 4096),
('PPLX 7B Online', 'perplexity/pplx-7b-online', 'perplexity', 4096),
('PPLX 7B Chat', 'perplexity/pplx-7b-chat', 'perplexity', 4096),
('PPLX 70B Chat', 'perplexity/pplx-70b-chat', 'perplexity', 4096);

-- Open Source Models
INSERT INTO llms (name, model_id, provider, context_length) VALUES
('Nous Capybara 34B', 'nousresearch/nous-capybara-34b', 'open-source', 8192),
('Nous Capybara 7B', 'nousresearch/nous-capybara-7b', 'open-source', 8192),
('Mythomist 7B', 'gryphe/mythomist-7b', 'open-source', 8192),
('Toppy M 7B', 'undi95/toppy-m-7b', 'open-source', 8192),
('Bagel 34B', 'jondurbin/bagel-34b', 'open-source', 8192),
('Psyfighter 13B', 'jebcarter/psyfighter-13b', 'open-source', 8192),
('Psyfighter 13B 2', 'koboldai/psyfighter-13b-2', 'open-source', 8192),
('Noromaid Mixtral', 'neversleep/noromaid-mixtral-8x7b-instruct', 'open-source', 32768),
('Nous Hermes Llama2 13B', 'nousresearch/nous-hermes-llama2-13b', 'open-source', 4096),
('Phind CodeLlama 34B', 'phind/phind-codellama-34b', 'open-source', 8192),
('Neural Chat 7B', 'intel/neural-chat-7b', 'open-source', 8192),
('Nous Hermes 2 Mixtral', 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo', 'open-source', 32768),
('LLaVA 13B', 'haotian-liu/llava-13b', 'open-source', 4096),
('Nous Hermes 2 Vision 7B', 'nousresearch/nous-hermes-2-vision-7b', 'open-source', 8192),
('Mythomax L2 13B', 'gryphe/mythomax-l2-13b', 'open-source', 4096),
('Nous Hermes Llama2 70B', 'nousresearch/nous-hermes-llama2-70b', 'open-source', 4096),
('CodeLlama 70B Instruct', 'codellama/codellama-70b-instruct', 'open-source', 4096),
('OpenHermes 2 Mistral', 'teknium/openhermes-2-mistral-7b', 'open-source', 8192),
('OpenHermes 2.5 Mistral', 'teknium/openhermes-2.5-mistral-7b', 'open-source', 8192),
('REMM SLERP L2 13B', 'undi95/remm-slerp-l2-13b', 'open-source', 4096),
('Cinematika 7B', 'openrouter/cinematika-7b', 'open-source', 8192),
('Yi 34B Chat', '01-ai/yi-34b-chat', 'open-source', 4096),
('Yi 34B', '01-ai/yi-34b', 'open-source', 4096),
('Yi 6B', '01-ai/yi-6b', 'open-source', 4096),
('StripedHyena Nous 7B', 'togethercomputer/stripedhyena-nous-7b', 'open-source', 8192),
('StripedHyena Hessian 7B', 'togethercomputer/stripedhyena-hessian-7b', 'open-source', 8192),
('Mixtral 8x7B', 'mistralai/mixtral-8x7b', 'open-source', 32768),
('Nous Hermes Yi 34B', 'nousresearch/nous-hermes-yi-34b', 'open-source', 4096),
('Mistral 7B OpenOrca', 'open-orca/mistral-7b-openorca', 'open-source', 8192),
('Zephyr 7B Beta', 'huggingfaceh4/zephyr-7b-beta', 'open-source', 8192),
('Chronos Hermes 13B', 'austism/chronos-hermes-13b', 'open-source', 4096),
('Synthia 70B', 'migtissera/synthia-70b', 'open-source', 4096),
('Mythalion 13B', 'pygmalionai/mythalion-13b', 'open-source', 4096),
('REMM SLERP L2 13B 6K', 'undi95/remm-slerp-l2-13b-6k', 'open-source', 6144),
('XWin LM 70B', 'xwin-lm/xwin-lm-70b', 'open-source', 4096),
('Mythomax L2 13B 8K', 'gryphe/mythomax-l2-13b-8k', 'open-source', 8192),
('OpenChat 7B', 'openchat/openchat-7b', 'open-source', 8192),
('Goliath 120B', 'alpindale/goliath-120b', 'open-source', 4096),
('LZLV 70B', 'lizpreciatior/lzlv-70b-fp16-hf', 'open-source', 4096),
('Noromaid 20B', 'neversleep/noromaid-20b', 'open-source', 8192),
('Dolphin Mixtral', 'cognitivecomputations/dolphin-mixtral-8x7b', 'open-source', 32768),
('RWKV 5 World', 'rwkv/rwkv-5-world-3b', 'open-source', 4096),
('RWKV 5 AI Town', 'recursal/rwkv-5-3b-ai-town', 'open-source', 4096),
('Eagle 7B', 'recursal/eagle-7b', 'open-source', 8192);
