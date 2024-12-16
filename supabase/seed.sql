-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Sample Users
INSERT INTO users (id, email, name, password, role, is_active, created_at, updated_at)
VALUES
  ('d0d4e39c-3d0e-4f56-a7c7-9f1b1b6d0aa1', 'admin@example.com', 'Admin User', crypt('admin123', gen_salt('bf')), 'admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('e1d5f49d-4e1f-4f67-b8d8-0f2c2c7e1bb2', 'user@example.com', 'Regular User', crypt('user123', gen_salt('bf')), 'user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f2e6f50e-5f2f-4a78-c9e9-1a3d3d8f2cc3', 'demo@example.com', 'Demo User', crypt('demo123', gen_salt('bf')), 'user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample Niches
INSERT INTO niches (id, name, user_id, description, status, created_at, updated_at)
VALUES
  ('a1b2c3d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d', 'Digital Marketing', 'd0d4e39c-3d0e-4f56-a7c7-9f1b1b6d0aa1', 'Digital marketing strategies and tips', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('b2c3d4e5-6f7a-4b8c-0d1e-2f3a4b5c6d7e', 'Content Writing', 'e1d5f49d-4e1f-4f67-b8d8-0f2c2c7e1bb2', 'Content writing best practices', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('c3d4e5f6-7a8b-4c9d-1e2f-3a4b5c6d7e8f', 'SEO Strategies', 'f2e6f50e-5f2f-4a78-c9e9-1a3d3d8f2cc3', 'SEO optimization techniques', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample Pillars
INSERT INTO pillars (id, title, niche_id, user_id, status, created_at, updated_at)
VALUES
  ('d4e5f6a7-8b9c-4d1e-2f3a-4b5c6d7e8f9a', 'Social Media Marketing', 'a1b2c3d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d', 'd0d4e39c-3d0e-4f56-a7c7-9f1b1b6d0aa1', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('e5f6a7b8-9c0d-4e2f-3a4b-5c6d7e8f9a0b', 'Blog Writing Tips', 'b2c3d4e5-6f7a-4b8c-0d1e-2f3a4b5c6d7e', 'e1d5f49d-4e1f-4f67-b8d8-0f2c2c7e1bb2', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f6a7b8c9-0d1e-4f3a-4b5c-6d7e8f9a0b1c', 'Keyword Research', 'c3d4e5f6-7a8b-4c9d-1e2f-3a4b5c6d7e8f', 'f2e6f50e-5f2f-4a78-c9e9-1a3d3d8f2cc3', 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample Articles
INSERT INTO articles (id, title, content, pillar_id, user_id, status, keywords, meta_description, created_at, updated_at)
VALUES
  ('d0e1f2a3-4b5c-4d6e-7f8a-9b0c1d2e3f4a', 'Instagram Marketing Guide', 'Detailed guide about Instagram marketing...', 'd4e5f6a7-8b9c-4d1e-2f3a-4b5c6d7e8f9a', 'd0d4e39c-3d0e-4f56-a7c7-9f1b1b6d0aa1', 'draft', ARRAY['instagram', 'marketing', 'social media'], 'Complete guide to Instagram marketing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b', 'Writing Engaging Blog Posts', 'Tips for writing engaging blog content...', 'e5f6a7b8-9c0d-4e2f-3a4b-5c6d7e8f9a0b', 'e1d5f49d-4e1f-4f67-b8d8-0f2c2c7e1bb2', 'draft', ARRAY['blogging', 'writing', 'content'], 'Learn to write engaging blog posts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f2a3b4c5-6d7e-4f8a-9b0c-1d2e3f4a5b6c', 'Long-tail Keywords Guide', 'Understanding and finding long-tail keywords...', 'f6a7b8c9-0d1e-4f3a-4b5c-6d7e8f9a0b1c', 'f2e6f50e-5f2f-4a78-c9e9-1a3d3d8f2cc3', 'draft', ARRAY['seo', 'keywords', 'long-tail'], 'Guide to long-tail keyword research', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
