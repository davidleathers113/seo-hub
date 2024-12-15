# Database Migration Plan

## 1. NicheSelection Screen
### Hard-Coded Data
- No direct hard-coded data found
- Data is fetched from API endpoints

### Suggested Database Tables
```sql
CREATE TABLE niches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_niches_created_by ON niches(created_by);
```

Example Query:
```sql
SELECT 
    n.id,
    n.name,
    n.status,
    n.progress,
    COUNT(p.id) as pillars_count,
    n.updated_at as last_updated
FROM niches n
LEFT JOIN pillars p ON p.niche_id = n.id
WHERE n.created_by = $1
GROUP BY n.id
ORDER BY n.created_at DESC;
```

## 2. NicheDetail Screen
### Hard-Coded Data
- No direct hard-coded data found
- Data is fetched from API endpoints

### Suggested Database Tables
```sql
CREATE TABLE pillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_pillars_niche_id ON pillars(niche_id);
CREATE INDEX idx_pillars_created_by ON pillars(created_by);
```

Example Query:
```sql
SELECT 
    p.id,
    p.title,
    p.status,
    p.approved,
    COUNT(sp.id) as subpillars_count
FROM pillars p
LEFT JOIN subpillars sp ON sp.pillar_id = p.id
WHERE p.niche_id = $1
GROUP BY p.id
ORDER BY p.created_at DESC;
```

## 3. SubpillarDetail Screen
### Hard-Coded Data
- Hard-coded research data in useEffect:
  ```typescript
  research: [
    {
      id: 'r1',
      content: 'Title tags remain one of the most important on-page SEO elements',
      source: 'Moz Blog',
      relevance: 0.95
    },
    // ...
  ]
  ```
- Hard-coded outline data:
  ```typescript
  outline: [
    {
      id: 'o1',
      title: 'Introduction to On-Page SEO',
      subsections: [
        {
          id: 'o1s1',
          content: 'Definition and importance of on-page SEO',
          keyPoints: [...]
        }
      ]
    }
  ]
  ```

### Suggested Database Tables
```sql
CREATE TABLE subpillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'research',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('research', 'outline', 'draft', 'complete'))
);

CREATE TABLE research_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source VARCHAR(255),
    relevance DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_relevance CHECK (relevance >= 0 AND relevance <= 1)
);

CREATE TABLE outline_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outline_subsections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES outline_sections(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE key_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subsection_id UUID REFERENCES outline_subsections(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subpillars_pillar_id ON subpillars(pillar_id);
CREATE INDEX idx_research_points_subpillar_id ON research_points(subpillar_id);
CREATE INDEX idx_outline_sections_subpillar_id ON outline_sections(subpillar_id);
CREATE INDEX idx_outline_subsections_section_id ON outline_subsections(section_id);
CREATE INDEX idx_key_points_subsection_id ON key_points(subsection_id);
```

## 4. Content Screen
### Hard-Coded Data
- No direct hard-coded data found
- Uses dynamic form input for niche generation
- Pillar data is fetched from API endpoints

### Additional Database Considerations
```sql
-- Add generated_by column to pillars table to track AI-generated content
ALTER TABLE pillars ADD COLUMN generated_by VARCHAR(50);

-- Add generation_prompt column to store the original prompt
ALTER TABLE pillars ADD COLUMN generation_prompt TEXT;

-- Add generation_timestamp to track when AI generation occurred
ALTER TABLE pillars ADD COLUMN generation_timestamp TIMESTAMP WITH TIME ZONE;

-- Create index for querying generated content
CREATE INDEX idx_pillars_generated ON pillars(generated_by, generation_timestamp);
```

Example Query for Generated Content:
```sql
SELECT 
    p.id,
    p.title,
    p.status,
    p.approved,
    p.generated_by,
    p.generation_prompt,
    p.generation_timestamp
FROM pillars p
WHERE p.niche_id = $1
    AND p.generated_by IS NOT NULL
ORDER BY p.generation_timestamp DESC;
```

## Migration Checklist

- [ ] Create database tables
  - [ ] niches
  - [ ] pillars
  - [ ] subpillars
  - [ ] research_points
  - [ ] outline_sections
  - [ ] outline_subsections
  - [ ] key_points

- [ ] Data migration tasks
  - [ ] Migrate existing niche data
  - [ ] Migrate existing pillar data
  - [ ] Migrate existing subpillar data
  - [ ] Convert hard-coded research data
  - [ ] Convert hard-coded outline data
  - [ ] Add generation metadata to existing AI-generated pillars

- [ ] API updates
  - [ ] Update niche endpoints
  - [ ] Update pillar endpoints
  - [ ] Update subpillar endpoints
  - [ ] Add research CRUD endpoints
  - [ ] Add outline CRUD endpoints
  - [ ] Add AI generation tracking endpoints

- [ ] Frontend updates
  - [ ] Update NicheSelection component
  - [ ] Update NicheDetail component
  - [ ] Update SubpillarDetail component
  - [ ] Update Content component
  - [ ] Remove hard-coded data
  - [ ] Implement proper error handling
  - [ ] Add loading states
  - [ ] Add AI generation progress indicators

- [ ] Testing
  - [ ] Write database migration tests
  - [ ] Update existing API tests
  - [ ] Update frontend component tests
  - [ ] Perform integration testing
  - [ ] Test data consistency
  - [ ] Test AI generation workflows

- [ ] Documentation
  - [ ] Update API documentation
  - [ ] Update database schema documentation
  - [ ] Document migration process
  - [ ] Document AI generation process
  - [ ] Update development setup guide
