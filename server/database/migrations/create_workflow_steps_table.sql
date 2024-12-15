CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    default_llm_id INTEGER REFERENCES llms(id),
    default_temperature DECIMAL(3,2) DEFAULT 0.7,
    default_max_tokens INTEGER DEFAULT 1000,
    default_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the workflow steps
INSERT INTO workflow_steps (name, description, order_index, default_prompt) VALUES
(
    'Pillar Generation',
    'Generate main content pillars for the given niche',
    1,
    'Analyze the given niche and generate comprehensive content pillars that cover the main aspects and topics within this niche. Consider market trends, user intent, and content gaps.'
),
(
    'Subpillar Generation',
    'Generate detailed subpillars for each main pillar',
    2,
    'For the given content pillar, generate specific and detailed subpillars that break down the main topic into actionable content pieces. Consider user questions, pain points, and search intent.'
),
(
    'Research',
    'Conduct in-depth research for each subpillar',
    3,
    'Perform comprehensive research on the given subpillar topic. Include relevant statistics, expert opinions, case studies, and current industry trends. Verify information accuracy and cite reliable sources.'
),
(
    'Outline',
    'Create detailed content outlines',
    4,
    'Create a detailed outline for the article based on the research. Include main points, supporting arguments, examples, and a logical flow of information. Consider SEO best practices and user engagement.'
),
(
    'Article Generation',
    'Generate the full article content',
    5,
    'Using the outline and research, generate a comprehensive, engaging, and informative article. Maintain a natural flow, incorporate relevant examples, and ensure the content is valuable to the target audience.'
),
(
    'SEO Grade',
    'Evaluate and grade the article for SEO optimization',
    6,
    'Analyze the article for SEO effectiveness. Check keyword usage, meta descriptions, headings, content structure, readability, and overall optimization. Provide specific improvement recommendations.'
),
(
    'Article Improvement',
    'Enhance the article based on SEO recommendations',
    7,
    'Improve the article based on the SEO analysis. Optimize keyword placement, enhance readability, strengthen headings, and refine content structure while maintaining natural flow and user value.'
);

-- Create table for user's step settings
CREATE TABLE IF NOT EXISTS user_step_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    step_id INTEGER REFERENCES workflow_steps(id),
    llm_id INTEGER REFERENCES llms(id),
    temperature DECIMAL(3,2),
    max_tokens INTEGER,
    custom_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, step_id)
);
